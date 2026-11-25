#!/usr/bin/env node
// Checks a chat backend against the Neoflo chat standard. Run with --help for the options.
import { runConformanceCli } from '../dist/chat/conformance.mjs';

process.exitCode = await runConformanceCli(process.argv.slice(2));
