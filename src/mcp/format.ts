/**
 * Markdown formatting shared by more than one MCP tool.
 *
 * Tool responses are read by a model rather than rendered, so the shape
 * matters: a numbered step means "do this in this order", a bullet means
 * "this is true". Where two tools emit the same shape they emit it from
 * here, so `get_installation` and `scaffold_app` cannot start numbering
 * or nesting the same steps differently.
 */

import type { InstallStep } from '@/src/install';
import type { BriefQuestion } from '@/src/project/types';

/**
 * Install steps as numbered sections, continuing from `startIndex`.
 *
 * Numbered rather than bulleted because these are ordered: wiring the
 * provider before installing the package produces a confusing error
 * rather than a missing feature.
 */
export function renderSteps(steps: InstallStep[], startIndex: number): string {
  return steps
    .map((step, offset) => {
      const heading = `### ${startIndex + offset}. ${step.title}`;
      const code = step.code
        ? `\n\n\`\`\`${step.language ?? ''}\n${step.code}\n\`\`\``
        : '';
      return `${heading}\n\n${step.body}${code}`;
    })
    .join('\n\n');
}

/**
 * One intake question, with everything needed to ask it well.
 *
 * The `why` travels with the question because the agent asking it will
 * be asked why it wants to know, and "the tool told me to" is a worse
 * answer than the real one.
 */
export function renderQuestion(question: BriefQuestion): string {
  const followUps =
    question.followUps && question.followUps.length > 0
      ? `\n  Then ask:\n${question.followUps.map((f) => `    - ${f}`).join('\n')}`
      : '';
  // A question scoped to some purposes is not a question about the
  // others, and saying so is what stops an agent asking a prototype
  // which framework the app it is going into uses.
  const scope = question.purposes
    ? `\n  Only when purpose is: ${question.purposes.join(' or ')}`
    : '';
  return [
    `- **${question.id}** — ${question.ask}`,
    `  Why it matters: ${question.why}`,
    `  Answer shape: \`${question.accepts}\`${scope}`,
    followUps,
  ].join('\n');
}

/** Questions grouped under their section headings, in order. */
export function renderQuestionSections(
  questions: readonly BriefQuestion[]
): string {
  const sections = new Map<string, BriefQuestion[]>();
  for (const question of questions) {
    const group = sections.get(question.section) ?? [];
    group.push(question);
    sections.set(question.section, group);
  }
  return [...sections.entries()]
    .map(
      ([section, group]) =>
        `### ${section}\n\n${group.map(renderQuestion).join('\n\n')}`
    )
    .join('\n\n');
}
