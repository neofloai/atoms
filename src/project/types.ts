/**
 * Contracts for the project intake: the short brief an agent has to
 * collect before it builds anything with Atoms, and the scaffold recipes
 * it follows once that brief is complete.
 *
 * Serialized to `data/project.json` by `scripts/generate.ts` and served
 * through the MCP `start_project` and `scaffold_app` tools. The docs site
 * renders the same objects, so the questions a person reads and the
 * questions an agent is told to ask cannot drift apart.
 */

import type { InstallStep } from '@/src/install';

/**
 * What is being made. This is the fork the whole brief turns on, which
 * is why it is asked first and answered before anything else matters.
 *
 * It is asked as what the user wants to create rather than as who they
 * are. The same three answers cover both: a designer and a manager both
 * want a working prototype with no database behind it, and asking them
 * to classify themselves first is a question about them rather than
 * about the thing being built.
 */
export type ProjectPurpose = 'prototype' | 'new-project' | 'existing-project';

/** Framework for a new project. Asked rather than inferred. */
export type ProjectTechStack = 'react' | 'nextjs';

/** What gets created on disk, resolved from purpose and stack. */
export type ProjectTarget = 'react' | 'nextjs' | 'existing';

/** How much chrome the screens sit inside. */
export type ProjectShell = 'rail-and-bar' | 'bar-only' | 'none';

/**
 * The scheme the app runs in.
 *
 * `switch` means the app mounts its own control to change scheme at
 * runtime, rather than being pinned to one. Light is the fallback when
 * nobody has a preference.
 */
export type ProjectColorMode = 'light' | 'dark' | 'switch';

/**
 * One question to put to the user before building.
 *
 * `ask` is phrased for a person rather than for a form, because the
 * agent reading this is going to say it out loud. `why` is included so
 * it can explain itself when asked why it wants to know, and so nobody
 * maintaining this list has to guess what a question was protecting.
 */
export interface BriefQuestion {
  /** Key this answer takes in the brief object. */
  id: string;
  /** Heading it groups under, in the order the sections are asked. */
  section: string;
  /** The question, in the words to put to the user. */
  ask: string;
  /** What changes in the build depending on the answer. */
  why: string;
  /** Shape of a usable answer. */
  accepts: string;
  /** Unanswered, this blocks the build plan. */
  required: boolean;
  /**
   * The purposes this question applies to at all. Absent means every
   * purpose. A question outside its purposes is not asked and not
   * reported missing — the stack of an existing app is not a question
   * about a prototype.
   */
  purposes?: readonly ProjectPurpose[];
  /** Asked once this one is answered, to get to the detail. */
  followUps?: readonly string[];
}

/** What the existing app is, when Atoms is going into one. */
export interface ExistingAppFacts {
  /** Framework and version, e.g. "Next.js 15 App Router", "Vite 5". */
  framework: string;
  /** React major, e.g. "19". Atoms needs 18 or 19. */
  reactVersion: string;
  /** Whether the app already mounts MUI and a theme of its own. */
  usesMui: boolean;
  /**
   * The version of Atoms already in the app, as `npm ls @neofloai/atoms`
   * reports it. Absent means nobody has looked yet, which is different
   * from `"none"` — that one means it is genuinely not installed.
   *
   * Here rather than derived, because the served code is written against
   * the current release and the app is on whatever it installed. An
   * integration is the one purpose where those two can already disagree
   * before a line is written.
   */
  atomsVersion?: string;
}

/**
 * The answers, as far as they have been collected.
 *
 * Every field is optional because the point of the type is to describe a
 * brief in progress: `start_project` reports what is still missing, and
 * a field being absent is the signal it works from.
 */
export interface ProjectBrief {
  purpose?: ProjectPurpose;
  techStack?: ProjectTechStack;
  existingApp?: ExistingAppFacts;
  projectName?: string;
  screens?: readonly string[];
  shell?: ProjectShell;
  records?: readonly string[];
  colorMode?: ProjectColorMode;
  productName?: string;
}

/**
 * How one target gets created and wired.
 *
 * The install and provider steps are not repeated here — `scaffold_app`
 * interleaves them from the installation guide, so there is one copy of
 * "how do you wire NeofloThemeProvider" in the repo and it is the one
 * `get_installation` already serves.
 */
export interface ProjectTargetRecipe {
  id: ProjectTarget;
  label: string;
  /** Why the resolver lands here, reported verbatim in the plan. */
  chooseWhen: string;
  /** Create command, with `{{name}}` for the project name. */
  createCommand: string | null;
  /**
   * How the downloaded icon files get declared, which is the one step
   * that differs between a framework's own conventions. Held apart from
   * `steps` so it can be emitted immediately after the download rather
   * than at the end, where a reader has to go back for it.
   */
  iconStep: InstallStep | null;
  /** Steps that belong to this target alone. */
  steps: InstallStep[];
}

/** A brand file a new app needs a local copy of. */
export interface BrandAsset {
  /** Filename as it should land in the new project. */
  file: string;
  /** Path on the docs origin to fetch it from. */
  path: string;
  /** Where it goes in the new project. */
  target: string;
  /** What it is for. */
  note: string;
}

/** Everything the intake and scaffold tools serve. */
export interface ProjectGuide {
  questions: readonly BriefQuestion[];
  targets: readonly ProjectTargetRecipe[];
  /**
   * Extra rules that hang off the purpose rather than off the target.
   *
   * Keyed on purpose because that is the only thing asked about the
   * work: what a prototype has to get right (everything reachable,
   * nothing half-styled) is not what a project that will be maintained
   * has to get right (typed records, visible seams for real data).
   */
  purposeNotes: Readonly<Record<ProjectPurpose, readonly string[]>>;
  /** Rules that hold for every project, reported with every plan. */
  rules: readonly string[];
  /**
   * Rules that apply only when something is being created.
   *
   * Held apart from `rules` so an integration plan does not carry
   * instructions about where to put a folder it will never make. A plan
   * that says nothing is created and then says where to create it can be
   * followed either way, which makes it worse than no rule at all.
   */
  creationRules: readonly string[];
  /**
   * Search terms that should surface the intake.
   *
   * Curated rather than derived from the questions, so a search for a
   * word a question happens to use does not return an interview.
   */
  keywords: readonly string[];
  /** Directory new projects are created in, expanded by the shell. */
  parentDir: string;
  /** Origin the brand files are downloaded from, once, at setup. */
  brandOrigin: string;
  /** Files a Neoflo-branded app needs its own copy of. */
  brandAssets: readonly BrandAsset[];
  /** How the mark gets into the app, which needs no file. */
  logoStep: InstallStep;
}
