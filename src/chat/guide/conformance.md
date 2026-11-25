The conformance check calls a backend the way the chat will and reports every gap against the [backend contract](/chat/backend-contract): missing endpoints, identity fields or credentials in bodies, `model` instead of `selected_model`, a stream that doesn't echo `client_message_id`, tools without exactly one result, error bodies outside the envelope, and more. Run it in CI against a dev or staging deployment.

The check is not part of Atoms. It ships in the `agentic-chat-ui` package as a standalone CLI, so a backend team can run it without installing the design system.

## What a run does

It creates one conversation, sends one message (which calls the model) and deletes the conversation.

- Failures break the contract. Warnings are worth fixing but don't fail the run.
- Sending a message calls the model, so pass `--no-messages` (or `sendMessages: false` in code) for a run that mustn't. It skips endpoint 6.

## From the command line

```bash
npx --package=github:neofloai/agentic-chat-ui#semver:^0.3.0 agentic-chat-conformance \
  --base-url https://askneo.dev.example \
  --header "Cookie: session=$SESSION"
```

## From code

The programmatic form imports from `@neofloai/agentic-chat/conformance`, which is the CLI package's own path, not an Atoms one:

```ts
import { formatReport, runConformance } from '@neofloai/agentic-chat/conformance';

const report = await runConformance({ baseUrl: process.env.CHAT_BASE_URL!, headers: { Cookie: process.env.SESSION! } });
if (!report.ok) throw new Error(formatReport(report));
```
