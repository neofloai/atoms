# Deployment & CI/CD Guide

Operations guide for shipping **Atoms** ([atoms.neoflo.ai](https://atoms.neoflo.ai)) — the Next.js docs site and MCP endpoint. Intended for DevOps / platform engineers.

For local development and the component API, see [`README.md`](./README.md).

---

## Table of contents

- [Architecture at a glance](#architecture-at-a-glance)
- [Why a container](#why-a-container)
- [Build pipeline](#build-pipeline)
- [The library package (`@neoflo/atoms`)](#the-library-package-neofloatoms)
- [The Docker image](#the-docker-image)
- [CI/CD overview](#cicd-overview)
- [GitHub Actions (CI)](#github-actions-ci)
- [AWS CodeBuild (CD)](#aws-codebuild-cd)
- [First-time AWS setup](#first-time-aws-setup)
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

Deployment target: **AWS ECS (Fargate)** pulling from **Amazon ECR**. The image is built and shipped by **AWS CodeBuild** via [`buildspec.yml`](./buildspec.yml). Any other container runtime works with the same image.

This repo also publishes a third output — the **`@neoflo/atoms` npm library** — consumed by other Neoflo projects over `git+ssh`. That build is independent of the service deployment (see [The library package](#the-library-package-neofloatoms)).

---

## Why a container

- The MCP endpoint needs a long-lived Node process; static hosting (S3/CloudFront alone) cannot serve it.
- One artifact runs identically on a laptop, in CI, and in production.
- The image is built from Next.js [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output), keeping it small (traced runtime files only, not the full `node_modules`).

---

## Build pipeline

The docs-site build is deliberately ordered so generated data can never go stale:

```
npm run build
  └─ prebuild  → npm run generate   # writes data/*.json from src/
  └─ build     → next build         # emits .next/standalone
```

- `npm run generate` (`scripts/generate.ts`) reads `src/components/*/*.examples.tsx`, `src/tokens/`, and `src/patterns/` and writes the canonical `data/*.json` manifests consumed by the MCP server.
- `prebuild` is an npm lifecycle hook — it runs automatically before `build`. **Never edit `data/*.json` by hand.**
- CI additionally fails if the committed `data/*.json` differs from a fresh `npm run generate` (see [GitHub Actions](#github-actions-ci)).

> Runtime data loading: the MCP server reads `data/*.json` at request time via `fs.readFile(process.cwd()/data/...)`. This is a dynamic read, so the `data/` directory is copied into the image explicitly (see Dockerfile) rather than relying on Next's file tracing.

---

## The library package (`@neoflo/atoms`)

Other Neoflo projects install the design system over SSH:

```bash
npm install git+ssh://git@github.com-neoflo:neofloai/atoms.git
```

How it builds:

- `npm run build:lib` runs **tsup** (`tsup.config.ts`), compiling `src/` into `dist/` as ESM (`.mjs`) + CJS (`.js`) + type declarations (`.d.ts`), with four entry points: the root barrel, `./icons`, `./tokens`, and `./theme`. `tsup` type generation uses `tsconfig.lib.json` (a build-only tsconfig without the Next.js plugin / `incremental` flag).
- `package.json` `exports` point at `./dist/*`, and `files` ships only `dist`.
- A **`prepare`** lifecycle script runs `build:lib` automatically. Because npm runs `prepare` when installing a `git+ssh` dependency (after installing devDeps), consumers always get a freshly built `dist/` that matches the committed source. **`dist/` is gitignored** — never committed.

> The `prepare` script is also why the Dockerfile's `deps` stage uses `npm ci --ignore-scripts`: that layer copies only `package.json`/lockfile (no `src/`), so the library build must not fire there. The docs-site image does not need `dist/`.

---

## The Docker image

`Dockerfile` is a multi-stage build:

| Stage | Purpose |
| ----- | ------- |
| `base` | `node:22-alpine` + `libc6-compat` (so SWC binaries run on musl) |
| `deps` | `npm ci --ignore-scripts` against the lockfile only — caches independently of source; `--ignore-scripts` skips the `prepare`/library build since `src/` is not present yet |
| `builder` | `npm run build` (runs `generate` via `prebuild`) |
| `runner` | Minimal non-root image: standalone server + static assets + `data/` |

Key properties:

- **Non-root:** runs as the `nextjs` (uid 1001) user.
- **Port:** listens on `3000` (`PORT` / `HOSTNAME=0.0.0.0`).
- **Entry:** `node server.js` (Next standalone entrypoint).
- **Build args:** `NODE_VERSION` (default `22`), `APP_VERSION` (default `dev`; surfaced by `/api/health`).

Build locally:

```bash
docker build -t neoflo-atoms:local .

# with an explicit version stamp
docker build --build-arg APP_VERSION=$(git rev-parse --short HEAD) -t neoflo-atoms:local .
```

---

## CI/CD overview

Two independent systems, with a clean split of responsibilities:

| System | File | Responsibility |
| ------ | ---- | -------------- |
| **GitHub Actions** | `.github/workflows/ci.yml` | **CI only** — validate every PR / push to `main`. Never deploys. |
| **AWS CodeBuild** | `buildspec.yml` | **CD** — build the image, push to ECR, roll out ECS. |

`buildspec.yml` is owned by DevOps — do not modify it from app code.

---

## GitHub Actions (CI)

`.github/workflows/ci.yml` (named **CI**) runs on every pull request and on pushes to `main`. It does **not** deploy.

| Job | Runs on | Depends on | Purpose |
| --- | ------- | ---------- | ------- |
| `verify` | every PR + push to `main` | — | `npm ci` → check `data/*.json` is in sync → `lint` → `typecheck` → `build:lib` (validates the npm package) → `build` (docs site) |
| `docker` | PRs only | `verify` | Build the production image (no push) to catch Dockerfile breakage before it reaches CodeBuild |

Notes:

- `npm ci` triggers the `prepare` script, so the library is built during install; the explicit **Build library** step makes a broken package fail the PR loudly.
- `dist/` is excluded from lint (`eslint.config.mjs`) and typecheck (`tsconfig.json`), so generated output never trips CI.
- Concurrency cancels superseded **PR** runs to save minutes.

---

## AWS CodeBuild (CD)

Deployment is **fully automated via AWS CodePipeline**: pushing to the `main` branch triggers the pipeline, which runs CodeBuild against [`buildspec.yml`](./buildspec.yml). There is no manual approval step. Phases:

1. **`pre_build`** — log in to ECR, resolve `REPOSITORY_URI` from the account ID + `IMAGE_REPO_NAME`, and compute `IMAGE_TAG` from the short (7-char) commit SHA (`CODEBUILD_RESOLVED_SOURCE_VERSION`), falling back to `latest`.
2. **`build`** — `docker build -t $REPOSITORY_URI:latest .` then tag the same image with `:$IMAGE_TAG`.
3. **`post_build`** — push both `:latest` and `:$IMAGE_TAG` to ECR, write `imagedefinitions.json`, and run `aws ecs update-service ... --force-new-deployment` to roll out the new image on ECS.

Every build is therefore pushed with both a moving `:latest` and an **immutable `:<short-sha>`** tag, which is what makes rollback a re-point with no rebuild.

### CodeBuild environment variables

The build project must define these (region is `ap-south-1` and is hardcoded in the ECR login/URI lines of `buildspec.yml`):

| Variable | Example | Purpose |
| -------- | ------- | ------- |
| `AWS_DEFAULT_REGION` | `ap-south-1` | ECR auth region (provided by CodeBuild) |
| `IMAGE_REPO_NAME` | `neoflo-atoms` | ECR repository name |
| `ECS_CLUSTER_NAME` | `neoflo` | Target ECS cluster |
| `ECS_SERVICE_NAME` | `atoms` | Target ECS service |
| `ECS_TASK_DEFINITION` | `atoms-task` | Task definition family used for the new deployment |

> `CODEBUILD_RESOLVED_SOURCE_VERSION` and `ACCOUNT_ID` are resolved at runtime — you do not set them.

---

## First-time AWS setup

One-time provisioning (per AWS account/region). Replace placeholders.

### 1. ECR repository

```bash
aws ecr create-repository \
  --repository-name neoflo-atoms \
  --image-scanning-configuration scanOnPush=true \
  --region ap-south-1
```

### 2. ECS cluster, task definition, and service

- Cluster (Fargate) — note the name for `ECS_CLUSTER_NAME`.
- Task definition — container on port `3000`, with a task **execution role** (ECR pull + CloudWatch Logs) and any task role your runtime needs. Note the family for `ECS_TASK_DEFINITION`.
- Service — fronted by an ALB target group, health check path `/api/health`, port `3000`. Note the name for `ECS_SERVICE_NAME`.
- Set the [runtime environment variables](#runtime-environment-variables) on the task definition.

### 3. CodeBuild project + IAM service role

Create a CodeBuild project that uses `buildspec.yml`, with **privileged mode enabled** (required to run `docker build`). Set the [environment variables](#codebuild-environment-variables) above.

The CodeBuild **service role** needs permission to push images and roll out ECS:

- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`, `ecr:PutImage`, `ecr:BatchGetImage`
- `ecs:UpdateService`, `ecs:DescribeServices`
- `iam:PassRole` for the ECS task execution/task roles
- `sts:GetCallerIdentity`

---

## Runtime environment variables

Set on the **ECS task definition**, **not** baked into the image.

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `MCP_TOKEN` | **Yes in prod** | Bearer token enforced by `/mcp`. If unset, the MCP endpoint is **open**. Always set in production. |
| `PORT` | No | Defaults to `3000`. |
| `HOSTNAME` | No | Defaults to `0.0.0.0` in the image. |
| `APP_VERSION` | No | Set at image build time; reported by `/api/health`. |

MCP clients then authenticate with `Authorization: Bearer <MCP_TOKEN>`.

---

## DNS & TLS for atoms.neoflo.ai

`atoms.neoflo.ai` is a subdomain — records go in whichever DNS zone is authoritative for `neoflo.ai`.

1. **TLS certificate (ACM):** request a cert for `atoms.neoflo.ai` and add the **CNAME validation record** ACM provides. For an ALB the cert lives in the service's region; if CloudFront fronts the app, the cert must be in `us-east-1`.
2. **Routing record**, by target:

| Target | DNS record |
| ------ | ---------- |
| ECS/Fargate behind ALB | Route 53 **Alias A/AAAA** → ALB, or `CNAME atoms → <alb-dns-name>` on external DNS |
| CloudFront | Alias A/AAAA → distribution domain |

Minimum in the zone is usually one ACM validation `CNAME` plus one routing record.

---

## Deploying

Deployment is **automated** — pushing to `main` ships to production. There is no manual deploy step (GitHub Actions only validates; it never deploys).

### What happens on push to `main`

1. CodePipeline detects the push to `main` and starts automatically.
2. CodeBuild runs `buildspec.yml`: builds the image, pushes `:latest` + `:<short-sha>` to ECR, and forces a new ECS deployment.
3. ECS performs a rolling replacement; the ALB health check (`/api/health`) gates the new tasks before they take traffic.

> Because `main` auto-deploys, treat it as the production branch: do real work on PRs, let GitHub Actions `verify` go green, then merge to ship. The deployed image's `APP_VERSION` (when passed as a build arg) is visible at `/api/health`.

---

## Rollback

Every build is pushed with an immutable `:<short-sha>` tag, so rollback is a re-point, no rebuild. Point the service's task definition at the previous image tag and force a new deployment:

```bash
# Roll the ECS service back to a previously pushed image tag.
aws ecs update-service \
  --cluster <ECS_CLUSTER_NAME> \
  --service <ECS_SERVICE_NAME> \
  --task-definition <ECS_TASK_DEFINITION> \
  --force-new-deployment \
  --region ap-south-1
```

If the previous task definition revision already references the older image, roll back by selecting that revision:

```bash
aws ecs update-service \
  --cluster <ECS_CLUSTER_NAME> \
  --service <ECS_SERVICE_NAME> \
  --task-definition <ECS_TASK_DEFINITION>:<previous-revision> \
  --region ap-south-1
```

> If your task definition pins `:latest`, register a new revision pinning the desired `:<short-sha>` before rolling, so the rollback targets an exact image.

---

## Health checks & observability

- **Health endpoint:** `GET /api/health` → `{ "status": "ok", "version": "<sha-or-tag>", "timestamp": "..." }`. Always served fresh (never cached). Use it as the ALB target group health check path.
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

- **Logs/metrics:** ECS tasks stream to CloudWatch Logs via the `awslogs` driver; CPU/memory metrics appear under the ECS service and the ALB target group.

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
| Consumer install fails: `Cannot find module './dist/index.mjs'` | `prepare` did not run (e.g. `--ignore-scripts` on the consumer) or devDeps unavailable to build | Reinstall without `--ignore-scripts`; ensure tsup/typescript install so `prepare` can build `dist/` |
| Consumer `import { X } from "@neoflo/atoms"` has no export | Component not re-exported from `src/index.ts`, or stale install | Add the export, then reinstall the package in the consumer |
| Docker build fails in `deps` stage running tsup | `prepare` fired without source present | Keep `npm ci --ignore-scripts` in the `deps` stage |
| MCP returns data but `/api/health` shows `version: "unknown"` | Image built without `APP_VERSION` | Pass `--build-arg APP_VERSION=...` |
| MCP endpoint accessible without a token in prod | `MCP_TOKEN` not set on the task definition | Set `MCP_TOKEN` env var on the ECS task definition |
| ECS tasks fail health checks / `503` from ALB | Wrong port or health path | Confirm health path `/api/health` and container port `3000` |
| ECR push denied in CodeBuild | Service role missing ECR permissions | Add the ECR actions listed in [First-time AWS setup](#first-time-aws-setup) to the CodeBuild role |
| CodeBuild fails at `docker build` with a daemon error | Privileged mode not enabled on the project | Enable privileged mode on the CodeBuild project |
| `MODULE_NOT_FOUND` / missing `data/` at runtime | `data/` not present in image | Ensure the Dockerfile `COPY ... /app/data ./data` line is intact |
| SWC/native binary error on container start | Alpine musl compatibility | Keep `libc6-compat` installed in the `base` stage |
