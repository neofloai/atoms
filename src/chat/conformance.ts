/**
 * `@neofloai/atoms/chat/conformance` — checks a backend against the chat standard over real HTTP,
 * the way the chat calls it. No React and no components: it needs only `fetch`, so it runs in a
 * backend's CI. From the command line it is `atoms-chat-conformance` (see `bin/`).
 */
export {
  runConformance,
  formatReport,
  type ConformanceOptions,
  type ConformanceCheck,
  type ConformanceReport,
  type ConformanceStatus,
} from './conformance/index';
export { runConformanceCli } from './conformance/cli';
