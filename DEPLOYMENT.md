# Deployment & CI/CD Guide

Operations guide for shipping **Atoms** ([atoms.neoflo.ai](https://atoms.neoflo.ai)) — the Next.js docs site and MCP endpoint. Intended for DevOps / platform engineers.

For local development and the component API, see [`README.md`](./README.md).

---

## Table of contents

- [Architecture at a glance](#architecture-at-a-glance)
- [Why a container](#why-a-container)
- [Build pipeline](#build-pipeline)
- [The Docker image](#the-docker-image)
- [CI/CD workflows](#cicd-workflows)
- [First-time AWS setup](#first-time-aws-setup)
- [Required GitHub configuration](#required-github-configuration)
- [Runtime environment variables](#runtime-environment-variables)
- [DNS & TLS for atoms.neoflo.ai](#dns--tls-for-atomsneofloai)
- [Deploying](#deploying)
- [Rollback](#rollback)
- [Health checks & observability](#health-checks--observability)
- [Local container workflow](#local-container-workflow)
- [Troubleshooting](#troubleshooting)

---

## Architecture at a glance

Atoms is a single Next.js 16 (App Router) application serving two things:

| Route group | Type | Notes |
| ----------- | ---- | ----- |
| Docs pages (`/`, `/components/*`, `/tokens`, ...) | Mostly static (SSG) | Prerendered at build time |
| `/mcp` | Dynamic (Node runtime) | Stateless Streamable HTTP MCP server |
| `/api/health` | Dynamic (Node runtime) | Liveness/readiness probe |

Because `/mcp` and `/api/health` require a live Node server (`runtime = 'nodejs'`, `dynamic = 'force-dynamic'`), **Atoms cannot be deployed as a pure static export.** It needs a running server, which is why it ships as a container.

Default deployment target: **AWS App Runner** pulling from **Amazon ECR**. ECS Fargate or any other container runtime works with the same image.

---

## Why a container

- The MCP endpoint needs a long-lived Node process; static hosting (S3/CloudFront alone) cannot serve it.
- One artifact runs identically on a laptop, in CI, and in production.
- The image is built from Next.js [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output), keeping it small (traced runtime files only, not the full `node_modules`).

---

## Build pipeline

The build is deliberately ordered so generated data can never go stale:

```
npm run build
  └─ prebuild  → npm run generate   # writes data/*.json from src/
  └─ build     → next build         # emits .next/standalone
```

- `npm run generate` (`scripts/generate.ts`) reads `src/components/*/*.examples.tsx`, `src/tokens/`, and `src/patterns/` and writes the canonical `data/*.json` manifests consumed by the MCP server.
- `prebuild` is an npm lifecycle hook — it runs automatically before `build`. **Never edit `data/*.json` by hand.**
- CI additionally fails if the committed `data/*.json` differs from a fresh `npm run generate` (see [CI](#cicd-workflows)).

> Runtime data loading: the MCP server reads `data/*.json` at request time via `fs.readFile(process.cwd()/data/...)`. This is a dynamic read, so the `data/` directory is copied into the image explicitly (see Dockerfile) rather than relying on Next's file tracing.

---

## The Docker image

`Dockerfile` is a multi-stage build:

| Stage | Purpose |
| ----- | ------- |
| `base` | `node:22-alpine` + `libc6-compat` (so SWC binaries run on musl) |
| `deps` | `npm ci` against the lockfile only — caches independently of source |
| `builder` | `npm run build` (runs `generate` via `prebuild`) |
| `runner` | Minimal non-root image: standalone server + static assets + `data/` |

Key properties:

- **Non-root:** runs as the `nextjs` (uid 1001) user.
- **Port:** listens on `3000` (`PORT` / `HOSTNAME=0.0.0.0`).
- **Entry:** `node server.js` (Next standalone entrypoint).
- **Build args:** `NODE_VERSION` (default `22`), `APP_VERSION` (default `dev`; CI sets the commit SHA or release tag, surfaced by `/api/health`).

Build locally:

```bash
docker build -t neoflo-atoms:local .

# with an explicit version stamp
docker build --build-arg APP_VERSION=$(git rev-parse --short HEAD) -t neoflo-atoms:local .
```

---

## CI/CD workflows

A single GitHub Actions workflow — `.github/workflows/ci.yml` (named **CI/CD**) — handles both validation and deployment. It triggers on every PR, on push to `main`, on `v*` tags, and via manual dispatch.

| Job | Runs on | Depends on | Purpose |
| --- | ------- | ---------- | ------- |
| `verify` | all events | — | `npm ci` → check `data/*.json` is in sync → `lint` → `typecheck` → `build` |
| `docker` | PRs only | `verify` | Build the image (no push) to catch Dockerfile breakage |
| `deploy` | push to `main`, `v*` tags, manual dispatch | `verify` | Build, push to ECR, roll out App Runner |

**Deploy is gated on checks.** Because `deploy` declares `needs: verify`, it cannot start unless lint, typecheck, build, and the data-freshness check all pass. A red check blocks the deploy.

The `deploy` job:

1. Assumes an AWS IAM role via **OIDC** (no static keys stored).
2. Logs in to ECR.
3. Builds and pushes the image, tagged with both the **commit SHA** (immutable) and **`latest`**, baking `APP_VERSION` in.
4. Runs `aws apprunner update-service` to the SHA-tagged image, then `wait service-updated` for a stable rollout.

Concurrency cancels superseded **PR** runs but never interrupts a push/tag run mid-deploy.

---

## First-time AWS setup

One-time provisioning (per AWS account/region). Replace placeholders.

### 1. ECR repository

```bash
aws ecr create-repository \
  --repository-name neoflo-atoms \
  --image-scanning-configuration scanOnPush=true \
  --region <AWS_REGION>
```

### 2. GitHub OIDC provider + deploy role

Create (once per account) the GitHub OIDC identity provider:

- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

Then create an IAM role (e.g. `atoms-github-deploy`) with a trust policy scoped to this repo:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike": { "token.actions.githubusercontent.com:sub": "repo:neofloai/atoms:*" }
    }
  }]
}
```

Attach permissions for ECR push and App Runner updates (scope down in production):

- `ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`, `ecr:PutImage`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`
- `apprunner:UpdateService`, `apprunner:DescribeService`
- `iam:PassRole` for the App Runner ECR-access role (below)

### 3. App Runner service

Create a service from the ECR image with:

- Port `3000`, health check path `/api/health`
- An **ECR access role** so App Runner can pull private images
- Environment variables (see [below](#runtime-environment-variables))

Note the **service ARN** — CI needs it.

---

## Required GitHub configuration

Set these under **Settings → Secrets and variables → Actions** (and a `production` environment for reviewer gates).

### Repository variables

| Variable | Example | Used by |
| -------- | ------- | ------- |
| `AWS_REGION` | `ap-south-1` | `deploy` job |
| `ECR_REPOSITORY` | `neoflo-atoms` | `deploy` job |

### Secrets

| Secret | Description |
| ------ | ----------- |
| `AWS_DEPLOY_ROLE_ARN` | ARN of the OIDC deploy role from step 2 |
| `APPRUNNER_SERVICE_ARN` | ARN of the App Runner service from step 3 |

### Environment

Create a `production` environment (referenced by the `deploy` job). Add required reviewers there if you want manual approval before each deploy.

---

## Runtime environment variables

Set on the running service (App Runner / ECS task definition), **not** baked into the image.

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `MCP_TOKEN` | **Yes in prod** | Bearer token enforced by `/mcp`. If unset, the MCP endpoint is **open**. Always set in production. |
| `PORT` | No | Defaults to `3000`. |
| `HOSTNAME` | No | Defaults to `0.0.0.0` in the image. |
| `APP_VERSION` | No | Set at image build time by CI; reported by `/api/health`. |

MCP clients then authenticate with `Authorization: Bearer <MCP_TOKEN>`.

---

## DNS & TLS for atoms.neoflo.ai

`atoms.neoflo.ai` is a subdomain — records go in whichever DNS zone is authoritative for `neoflo.ai`.

1. **TLS certificate (ACM):** request a cert for `atoms.neoflo.ai` and add the **CNAME validation record** ACM provides. For App Runner / ALB the cert lives in the service's region; if CloudFront fronts the app, the cert must be in `us-east-1`.
2. **Routing record**, by target:

| Target | DNS record |
| ------ | ---------- |
| App Runner | Link the custom domain in the App Runner console, then add the `CNAME` + validation records it returns |
| ECS/Fargate behind ALB | Route 53 **Alias A/AAAA** → ALB, or `CNAME atoms → <alb-dns-name>` on external DNS |
| CloudFront | Alias A/AAAA → distribution domain |

Minimum in the zone is usually one ACM validation `CNAME` plus one routing record.

---

## Deploying

### Continuous (default)

Merge to `main` → after `verify` passes, the `deploy` job builds, pushes, and rolls out automatically.

### Release tag

```bash
git tag v0.2.0
git push origin v0.2.0
```

The tag name becomes `APP_VERSION` (visible at `/api/health`).

### Manual

Actions → **Deploy** → **Run workflow** (`workflow_dispatch`).

---

## Rollback

Every build is pushed with an immutable `:<commit-sha>` tag, so rollback is a re-point, no rebuild:

```bash
aws apprunner update-service \
  --service-arn <APPRUNNER_SERVICE_ARN> \
  --source-configuration "ImageRepository={ImageIdentifier=<ECR_URI>:<previous-sha>,ImageRepositoryType=ECR}"

aws apprunner wait service-updated --service-arn <APPRUNNER_SERVICE_ARN>
```

Or re-run the **Deploy** workflow from the last good commit.

---

## Health checks & observability

- **Health endpoint:** `GET /api/health` → `{ "status": "ok", "version": "<sha-or-tag>", "timestamp": "..." }`. Always served fresh (never cached). Use it as the App Runner / ALB health check path.
- **Verify a deploy:**

```bash
curl -s https://atoms.neoflo.ai/api/health
```

Confirm `version` matches the commit/tag you shipped.

- **MCP smoke test:**

```bash
curl -s -X POST https://atoms.neoflo.ai/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}'
```

- **Logs/metrics:** App Runner streams to CloudWatch Logs; request/CPU/memory metrics appear under the App Runner service.

---

## Local container workflow

```bash
# Build
docker build -t neoflo-atoms:local .

# Run (MCP open — local only)
docker run --rm -p 3000:3000 neoflo-atoms:local

# Run with auth, mirroring prod
docker run --rm -p 3000:3000 -e MCP_TOKEN=dev-secret neoflo-atoms:local
```

Then:

```bash
curl http://localhost:3000/api/health
open http://localhost:3000
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| ------- | ------------ | --- |
| CI fails at "Check generated data is up to date" | `data/*.json` not regenerated after a component/token change | `npm run generate` and commit the result |
| MCP returns data but `/api/health` shows `version: "unknown"` | Image built without `APP_VERSION` | Pass `--build-arg APP_VERSION=...` (CI does this automatically) |
| MCP endpoint accessible without a token in prod | `MCP_TOKEN` not set on the service | Set `MCP_TOKEN` env var on App Runner/ECS |
| `503` from App Runner after deploy | Health check failing or wrong port | Confirm health path `/api/health` and port `3000` |
| ECR push denied in CI | OIDC role missing ECR permissions or wrong `sub` condition | Recheck the trust policy `repo:neofloai/atoms:*` and ECR actions |
| `MODULE_NOT_FOUND` / missing `data/` at runtime | `data/` not present in image | Ensure the Dockerfile `COPY ... /app/data ./data` line is intact |
| SWC/native binary error on container start | Alpine musl compatibility | Keep `libc6-compat` installed in the `base` stage |
