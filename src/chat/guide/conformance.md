The conformance check calls a backend the way the chat will and reports every gap against the [backend contract](/chat/backend-contract): missing endpoints, identity fields or credentials in bodies, `model` instead of `selected_model`, a stream that doesn't echo `client_message_id`, tools without exactly one result, error bodies outside the envelope, and more. Run it in CI against a dev or staging deployment.

It ships with Atoms 4.4.0 and later, as the `atoms-chat-conformance` command and the `@neofloai/atoms/chat/conformance` subpath. It runs on the same engine the chat does, so the check and the chat can't disagree about the standard. It needs Node 22 or later and nothing else: no React, no components and no dependencies to install.

## What a run does

It creates one conversation, sends one message (which calls the model) and deletes the conversation.

- Failures break the contract. Warnings are worth fixing but don't fail the run.
- Sending a message calls the model, so pass `--no-messages` (or `sendMessages: false` in code) for a run that mustn't. It skips endpoint 6.
- The exit code is 0 when every check passes (warnings allowed), 1 when one fails and 2 on bad usage. `--help` lists every option.

## From the command line

A backend repo doesn't need Atoms in its own dependencies. `npx` fetches it for the run:

```bash
npx --package=github:neofloai/atoms#semver:^4.4.0 atoms-chat-conformance \
  --base-url https://askneo.dev.example \
  --header "Cookie: session=$SESSION"
```

`CHAT_BASE_URL` and `CHAT_HEADERS` (one header per line) work in place of the flags, which keeps a session out of the CI log. `--json` prints the report as JSON.

## From code

`runConformance` takes what the flags set (`baseUrl`, `headers`, `sendMessages`, `prompt`, `checkUnauthenticated`) plus `paths` for a backend that mounts the endpoints elsewhere, and resolves a `ConformanceReport`: `ok`, the counts and every check. `formatReport` turns the report into the text the command prints.

```ts
import { formatReport, runConformance } from '@neofloai/atoms/chat/conformance';

const report = await runConformance({ baseUrl: process.env.CHAT_BASE_URL!, headers: { Cookie: process.env.SESSION! } });
if (!report.ok) throw new Error(formatReport(report));
```
