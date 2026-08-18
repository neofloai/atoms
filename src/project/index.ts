/**
 * Project intake: what to find out before building anything with Atoms,
 * and where the result goes.
 *
 * The problem this solves is not that agents cannot write components. It
 * is that they will happily write the wrong ones — a screen assembled
 * from six component docs, in a sandbox directory, from invented data.
 * Every question in `BRIEF_QUESTIONS` exists because getting it wrong
 * costs a rebuild rather than an edit, which is also why there are only
 * nine of them.
 *
 * Serialized to `data/project.json` by `scripts/generate.ts`. The two
 * decision functions stay here rather than in the manifest, because a
 * condition is code and the prose that explains it is data.
 */

import { BRIEF_QUESTIONS } from './questions';
import {
  BRAND_ASSETS,
  BRAND_ORIGIN,
  LOGO_STEP,
  PROJECT_PARENT_DIR,
  PROJECT_TARGETS,
} from './targets';

import type {
  BriefQuestion,
  ProjectBrief,
  ProjectGuide,
  ProjectPurpose,
  ProjectTarget,
} from './types';

export * from './types';
export { BRIEF_QUESTIONS } from './questions';
export {
  BRAND_ASSETS,
  BRAND_ORIGIN,
  LOGO_STEP,
  PROJECT_PARENT_DIR,
  PROJECT_TARGETS,
} from './targets';

/** What the target decision was, and the answer that forced it. */
export interface TargetDecision {
  target: ProjectTarget;
  /** The specific thing in the brief that decided it. */
  trigger: string;
}

/**
 * Rules that follow from what is being built.
 *
 * Keyed on purpose rather than on who is at the keyboard. The three
 * lists used to be three job titles, which meant asking the user to
 * classify themselves before anything could be built — and the answer
 * only ever mattered because of what it implied about the work. A
 * prototype is a prototype whether a designer or an engineer asked for
 * it, and it has the same things to get right either way.
 */
const PURPOSE_NOTES: Record<ProjectPurpose, readonly string[]> = {
  prototype: [
    'Every screen has to be reachable by clicking. No sign-in gate, no route that can only be reached by editing the URL.',
    'Assume it gets shown to other people, live. Every click has to land somewhere — a dead control in front of a room is the only thing anyone remembers.',
    'Put the sample data in one file with an obvious name. What is on screen changes far more often than the components do, and nobody should have to open a component to change a vendor name.',
    'Nothing half-styled. A control that is not wired yet still has to look finished, because in a review it will be read as the design rather than as a placeholder.',
    'Nothing that needs a network. If the room has no wifi it still has to run.',
    'One obvious path through the screens, and the two commands that start it at the top of the README: `npm install`, `npm run dev`. Anything more than that will not survive being handed on.',
  ],
  'new-project': [
    'Keep the sample data behind the function signature the real source will have, so swapping it later is one file rather than a search.',
    'Type the records properly. A table built on loose rows is a table that will not survive the real ones.',
    'Mark the seams where real data will arrive with a comment saying what is expected, rather than spreading a mock through the components.',
    'Pin the Atoms install to a commit for anything that has to reproduce; a bare install tracks the default branch.',
    'Do not wrap or restyle an Atoms component locally to get a variant that does not exist. Open an issue on the Atoms repo — a local override stops tracking the design system the day it is written.',
  ],
  'existing-project': [
    'Pin the Atoms install to a commit. A bare install tracks the default branch, and an app already in front of users does not want its buttons changing on someone else\'s merge.',
    'Introduce it on one screen first. A single screen and a whole-app migration are the same install and very different reviews.',
    'Leave the app\'s own components where they are. Atoms sits alongside them; replacing what already works is separate work with its own approval.',
    'Do not wrap or restyle an Atoms component locally to get a variant that does not exist. Open an issue on the Atoms repo — a local override stops tracking the design system the day it is written.',
  ],
};

const PROJECT_RULES: readonly string[] = [
  'Do not scaffold, install, or write a component until every required answer is in hand. Ask the questions in one pass rather than one at a time, and ask the follow-ups for anything that came back vague.',
  'Hold state in React state. Do not add `localStorage`, `sessionStorage`, cookies or a database to make something survive a reload unless the user asks for it — a prototype that remembers the last person who used it cannot be reset before the next demo.',
  'Call `get_pattern` before composing a screen, `get_component` before using a component, and `get_tokens` before writing any colour, spacing or type value. Never hardcode a hex or a pixel value that a token already carries.',
  'Import only from `@neofloai/atoms`, `@neofloai/atoms/icons`, `@neofloai/atoms/tokens` and `@neofloai/atoms/theme`. Importing from `@mui/material` resolves and bypasses the design system.',
  'When it runs, say how to see it — the folder and the command for something new, the route for a screen inside an app that already runs. Then say which interactions are real and which are only drawn.',
];

const CREATION_RULES: readonly string[] = [
  `Create the project in ${PROJECT_PARENT_DIR}/<project-name>. Not a temp directory, not inside the Atoms repo, not whatever directory this conversation started in — a prototype nobody can find again was not delivered. If that folder does not exist, ask where it should go rather than guessing.`,
  'If a folder of that name is already there, stop and ask. Never scaffold into or over an existing directory.',
];

const SEARCH_KEYWORDS: readonly string[] = [
  'start a project',
  'new project',
  'start',
  'prototype',
  'demo',
  'mockup',
  'scaffold',
  'boilerplate',
  'starter',
  'create app',
  'new app',
  'react app',
  'next app',
  'vite',
  'create-next-app',
  'existing project',
  'integrate',
  'brief',
  'requirements',
  'intake',
  'designer',
];

/** Everything the intake and scaffold tools serve. */
export const projectGuide: ProjectGuide = {
  questions: BRIEF_QUESTIONS,
  targets: PROJECT_TARGETS,
  purposeNotes: PURPOSE_NOTES,
  rules: PROJECT_RULES,
  creationRules: CREATION_RULES,
  keywords: SEARCH_KEYWORDS,
  parentDir: PROJECT_PARENT_DIR,
  brandOrigin: BRAND_ORIGIN,
  brandAssets: BRAND_ASSETS,
  logoStep: LOGO_STEP,
};

/**
 * Whether an answer counts as given.
 *
 * `false` is an answer, so only absence, blank strings and empty lists
 * count as missing.
 */
function isAnswered(value: unknown): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

/**
 * Whether a question applies to this brief at all.
 *
 * A question scoped to certain purposes cannot be judged until `purpose`
 * itself is answered, so it counts as applying — `purpose` is required,
 * so the agent is coming back anyway.
 */
function isRelevant(question: BriefQuestion, brief: ProjectBrief): boolean {
  if (!question.purposes || brief.purpose === undefined) {
    return true;
  }
  return question.purposes.includes(brief.purpose);
}

/** The required answers still missing — the list that blocks a plan. */
export function missingRequired(
  questions: readonly BriefQuestion[],
  brief: ProjectBrief
): BriefQuestion[] {
  return questions.filter(
    (question) =>
      question.required &&
      isRelevant(question, brief) &&
      !isAnswered(brief[question.id as keyof ProjectBrief])
  );
}

/**
 * The optional answers still missing.
 *
 * Reported with the plan rather than defaulted in silence: each one is a
 * decision that otherwise gets made on the user's behalf by whoever
 * writes the screen.
 */
export function unansweredRecommended(
  questions: readonly BriefQuestion[],
  brief: ProjectBrief
): BriefQuestion[] {
  return questions.filter(
    (question) =>
      !question.required &&
      isRelevant(question, brief) &&
      !isAnswered(brief[question.id as keyof ProjectBrief])
  );
}

/**
 * What to build, and the answer that decided it.
 *
 * Asked rather than inferred, which is the whole change from guessing at
 * it: a prototype is always React, an existing project is never
 * scaffolded, and a new project gets the stack the user picked. React is
 * the default for a new project because Next is not more capable for the
 * UI, only for what sits behind it.
 */
export function resolveTarget(brief: ProjectBrief): TargetDecision {
  if (brief.purpose === 'existing-project') {
    return {
      target: 'existing',
      trigger:
        'Atoms is going into a project that already exists, so nothing is created',
    };
  }
  if (brief.purpose === 'prototype') {
    return {
      target: 'react',
      trigger:
        'it is a prototype: React with Vite, sample data in the app, no backend and no stored state',
    };
  }
  if (brief.techStack === 'nextjs') {
    return {
      target: 'nextjs',
      trigger: 'a new project, and Next was asked for',
    };
  }
  return {
    target: 'react',
    trigger: 'a new project on React with Vite, which is the default',
  };
}
