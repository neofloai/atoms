import type { BriefQuestion } from './types';

/**
 * The interview: nine questions, of which three to six block.
 *
 * How many depends on the first answer, because `purpose` scopes the
 * rest — five for a prototype, six for a new project (which is also
 * asked its stack), three for a project that already exists (which is
 * asked nothing about screens, since it has its own).
 *
 * Deliberately short. Atoms is used for three things, and once which one
 * is known, most of what an intake would otherwise ask is already
 * settled: a prototype is static with no database, so there is nothing
 * to ask about sign-ins, persistence, or where the rows come from.
 *
 * Nothing here asks who the user is. A designer, a manager and an
 * engineer reach for Atoms for the same three reasons, and which of the
 * three it is says everything their job title would have — so the first
 * question is about the thing being made, not about the person making
 * it.
 *
 * What is left is what cannot be inferred: what is on screen, whether
 * there is a shell around it, and what it is called.
 */
export const BRIEF_QUESTIONS: readonly BriefQuestion[] = [
  {
    id: 'purpose',
    section: 'What this is',
    ask: 'What do you want to create — a working prototype with no database behind it, the frontend of a new project, or Atoms going into a project you already have?',
    why: 'The fork everything else follows from, and the only question about the work that has to be asked outright. A prototype is React with sample data and no backend. A new project gets its stack chosen. An existing project gets an install and nothing created.',
    accepts: 'prototype | new-project | existing-project',
    required: true,
  },
  {
    id: 'techStack',
    section: 'What this is',
    ask: 'React or Next.js?',
    why: 'React with Vite is the default and the right answer unless something needs a server — auth, data that has to survive a reload, API routes, or a secret the browser must not see. Next is not more capable for the UI, only for what sits behind it.',
    accepts: 'react (recommended) | nextjs',
    required: true,
    purposes: ['new-project'],
  },
  {
    id: 'existingApp',
    section: 'What this is',
    ask: 'What is the existing app — framework and version, which React version, and does it already use MUI?',
    why: 'Atoms ships MUI and a theme inside it. An app that already mounts its own theme provider has to have that reconciled before anything renders correctly, and React 17 is not supported at all. Finding either out after installing is a rollback.',
    accepts: 'framework + version, React major, whether MUI is already there',
    required: true,
    purposes: ['existing-project'],
    followUps: [
      'Is there already a design system or component library in it?',
      'Does it already have a theme provider, and who owns it?',
    ],
  },
  {
    id: 'screens',
    section: 'What is on screen',
    ask: 'Which screens are there? Name each one and say in a sentence what a person does on it.',
    why: 'The count and the verbs decide the routing and the shell. One screen with no navigation is a different app from four behind a rail, and finding that out after the shell is built means rebuilding it.',
    accepts: 'one line per screen: name — what a person does there',
    required: true,
    purposes: ['prototype', 'new-project'],
    followUps: [
      'Which screen opens first?',
      'How does someone get from each screen to the next — the rail, clicking a row, a button?',
      'Is anything on these screens meant to be drawn but not wired, so nobody demos a picture by accident?',
    ],
  },
  {
    id: 'shell',
    section: 'What is on screen',
    ask: 'Is there an app shell — a nav rail down the side with a bar across the content — or is it a single screen with no chrome?',
    why: 'The shell is the arrangement most often built backwards. The rail runs the full height and the bar starts where the rail ends, so the outer box is a row rather than a bar with a row underneath. Answering this up front is what makes the Dashboard pattern usable as it is.',
    accepts: 'rail-and-bar | bar-only | none',
    required: true,
    purposes: ['prototype', 'new-project'],
    followUps: [
      "What are the rail's destinations, in order, and which is selected when it opens?",
      'Does the rail collapse to icons?',
    ],
  },
  {
    id: 'records',
    section: 'What is on screen',
    ask: 'If a screen has a table or a list: what does one row represent, and what are the columns?',
    why: 'Column widths and whether a table scrolls sideways are decided by the real columns. A table built against invented ones has to be re-measured against the real ones later.',
    accepts: 'per table: what a row is, and the column names',
    required: false,
    purposes: ['prototype', 'new-project'],
    followUps: [
      'Which columns are statuses or categories worth filtering on?',
      'Which column identifies a row to a person — the thing they would read out loud?',
    ],
  },
  {
    id: 'colorMode',
    section: 'How it looks',
    ask: 'Light, dark, or a switch in the app so the person viewing can change it?',
    why: 'Every token carries both schemes, so this is one prop. Light unless there is a reason — and a demo on a projector or someone else\'s laptop wants pinning rather than a switch nobody will find.',
    accepts: 'light (default) | dark | switch',
    required: true,
  },
  {
    id: 'productName',
    section: 'How it looks',
    ask: 'What is it called on screen — and is it Neoflo-branded, or does it carry a customer\'s name?',
    why: 'Decides what sits beside the mark in the rail and what the browser tab says. The Neoflo mark and favicon go in either way unless the answer says otherwise.',
    accepts: 'the name shown in the UI, noting whether it is a customer brand',
    required: false,
  },
  {
    id: 'projectName',
    section: 'Where it goes',
    ask: 'What should the folder be called?',
    why: 'It becomes the directory on the Desktop and the package name. Renaming it afterwards means touching both.',
    accepts: 'kebab-case, e.g. vendor-query-prototype',
    required: true,
    purposes: ['prototype', 'new-project'],
  },
];
