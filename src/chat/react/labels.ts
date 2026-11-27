/** Every string the UI shows. Override any of them through `labels` for copy or translation. */
/** The kinds a file card tells apart, by extension or content type. */
export type FileKind = 'spreadsheet' | 'pdf' | 'document' | 'image' | 'folder' | 'file';

const FILE_KINDS: Record<FileKind, string> = {
  spreadsheet: 'Spreadsheet',
  pdf: 'PDF document',
  document: 'Document',
  image: 'Image',
  folder: 'Folder',
  file: 'File',
};

export interface ChatLabels {
  composerPlaceholder: string;
  composerAwaitingDecision: string;
  composerLabel: string;
  send: string;
  stop: string;
  attach: string;
  removeAttachment: (name: string) => string;
  uploading: string;
  uploadFailed: string;

  scopeAll: string;
  scopeSome: (count: number) => string;
  scopeNone: string;
  scopeSelectAll: string;
  scopeDeselectAll: string;
  scopeLabel: string;
  /** A multiple-choice `ComposerPicker`'s trigger text, from its `name`. */
  pickerSummary: (name: string, selected: number, total: number) => string;
  /** A `ComposerPicker` group heading's action. */
  pickerSelectAll: string;
  pickerDeselectAll: string;

  newChat: string;
  history: string;
  openHistory: string;
  closeHistory: string;
  searchChats: string;
  rename: string;
  renameTitle: string;
  save: string;
  delete: string;
  deleteTitle: string;
  deleteBody: string;
  archive: string;
  unarchive: string;
  showArchived: string;
  hideArchived: string;
  cancel: string;
  moreActions: (title: string) => string;
  historyEmpty: string;
  historyNoResults: string;
  historyError: string;
  running: string;
  groupToday: string;
  groupYesterday: string;
  groupPrevious7: string;
  groupPrevious30: string;
  groupOlder: string;

  thinkingLive: string;
  thoughtFor: (seconds: number) => string;
  thought: string;
  toolRunning: string;
  toolFailed: string;
  toolInterrupted: string;
  toolResults: (count: number) => string;
  toolMoreResults: (count: number) => string;
  rows: (count: number) => string;
  sources: (count: number) => string;
  sourcesTitle: string;
  approve: string;
  reject: string;
  approved: string;
  rejected: string;
  submit: string;
  submitted: string;
  selectAtLeast: (count: number) => string;
  selectAtMost: (count: number) => string;
  decisionFailed: string;
  tryAgain: string;
  tryAgainIn: (seconds: number) => string;
  /** The button on a `connection_required` / `connection_expired` error. */
  reconnect: (source?: string) => string;
  /** Under an error, for bug reports. */
  errorReference: (requestId: string) => string;
  messageTooLong: (max: number) => string;
  openFull: string;
  close: string;
  download: string;
  imageFailed: string;
  planRunning: string;

  copy: string;
  copied: string;
  jumpToLatest: string;
  loadError: string;
  reload: string;
  interrupted: string;
  stopped: string;
  unknownBlock: string;
  blockCrashed: string;
  welcomeTitle: string;
  /** The composer's placeholder on the empty chat, where it sits under the greeting. */
  welcomePlaceholder: string;
  /** The suggested prompts' list. */
  suggestionsLabel: string;
  /** The × on a suggested prompt. */
  dismissSuggestion: (label: string) => string;
  /** The composer's + button, which opens the menu. */
  composerMenu: string;
  /** The + menu's attach item. */
  menuAttach: string;
  /** The + menu's workflows item. */
  menuWorkflows: string;
  /** The search field at the top of a submenu. */
  menuSearch: string;
  /** A submenu search that matches nothing. */
  menuNoMatches: string;
  /** A folder in a menu, loading what is inside it. */
  menuLoading: string;
  /** A folder whose contents failed to load; choosing the row tries again. */
  menuLoadFailed: string;
  /** Under an answer: the thumbs-up button. */
  feedbackGood: string;
  /** Under an answer: the thumbs-down button. */
  feedbackBad: string;
  /** Under the newest answer: the button that asks its question again. */
  askAgain: string;
  /** The toast after feedback is sent. */
  feedbackThanksTitle: string;
  feedbackThanksMessage: string;
  /** The toast when `onFeedback` fails. */
  feedbackFailedTitle: string;
  feedbackFailedMessage: string;
  /** The thumbs-down dialog. */
  feedbackDialogTitle: string;
  feedbackIssueLabel: string;
  feedbackDetailsLabel: string;
  feedbackHint: string;
  /** What a file card says a file is: "Spreadsheet", "PDF document", "Folder"… */
  fileKind: (kind: FileKind) => string;
  /** When an answer was given, under it: "just now", "40 mins ago", "Yesterday", "12 Nov". */
  timeAgo: (date: Date, now: Date) => string;
}

/** "just now", "1 min ago", "40 mins ago", "3 hrs ago", "Yesterday", "4 days ago", then the date. */
function timeAgo(date: Date, now: Date): string {
  const mins = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (!Number.isFinite(mins)) return '';
  if (mins < 1) return 'just now';
  if (mins < 60) return mins === 1 ? '1 min ago' : `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs === 1 ? '1 hr ago' : `${hrs} hrs ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
}

export const defaultLabels: ChatLabels = {
  composerPlaceholder: 'Ask anything',
  composerAwaitingDecision: 'Respond to the card above to continue',
  composerLabel: 'Message',
  send: 'Send',
  stop: 'Stop',
  attach: 'Attach files',
  removeAttachment: (name) => `Remove ${name}`,
  uploading: 'Uploading…',
  uploadFailed: 'Upload failed',

  scopeAll: 'All workflows',
  scopeSome: (n) => (n === 1 ? '1 workflow' : `${n} workflows`),
  scopeNone: 'No workflows',
  scopeSelectAll: 'Select all',
  scopeDeselectAll: 'Deselect all',
  scopeLabel: 'Choose which workflows to ask about',
  pickerSummary: (name, selected, total) =>
    selected === total ? `All ${name.toLowerCase()}` : selected === 0 ? `No ${name.toLowerCase()}` : `${name} (${selected})`,
  pickerSelectAll: 'Select all',
  pickerDeselectAll: 'Deselect all',

  newChat: 'New chat',
  history: 'History',
  openHistory: 'Show chat history',
  closeHistory: 'Hide chat history',
  searchChats: 'Search chats',
  rename: 'Rename',
  renameTitle: 'Rename chat',
  save: 'Save',
  delete: 'Delete',
  deleteTitle: 'Delete this chat?',
  deleteBody: 'The conversation and its messages are removed. This can’t be undone.',
  archive: 'Archive',
  unarchive: 'Unarchive',
  showArchived: 'Show archived',
  hideArchived: 'Hide archived',
  cancel: 'Cancel',
  moreActions: (title) => `More actions for ${title}`,
  historyEmpty: 'No chats yet',
  historyNoResults: 'No chats match your search',
  historyError: 'Couldn’t load your chats.',
  running: 'Replying…',
  groupToday: 'Today',
  groupYesterday: 'Yesterday',
  groupPrevious7: 'Previous 7 days',
  groupPrevious30: 'Previous 30 days',
  groupOlder: 'Older',

  thinkingLive: 'Thinking…',
  thoughtFor: (s) => (s < 1 ? 'Thought for a moment' : `Thought for ${s} ${s === 1 ? 'second' : 'seconds'}`),
  thought: 'Thought',
  toolRunning: 'Running…',
  toolFailed: 'Failed',
  toolInterrupted: 'Interrupted',
  toolResults: (n) => (n === 1 ? '1 result' : `${n.toLocaleString()} results`),
  toolMoreResults: (n) => `and ${n.toLocaleString()} more`,
  rows: (n) => (n === 1 ? '1 row' : `${n.toLocaleString()} rows`),
  sources: (n) => (n === 1 ? '1 source' : `${n} sources`),
  sourcesTitle: 'Sources',
  approve: 'Approve',
  reject: 'Not now',
  approved: 'Approved',
  rejected: 'Declined',
  submit: 'Submit',
  submitted: 'Submitted',
  selectAtLeast: (n) => `Choose at least ${n}.`,
  selectAtMost: (n) => `Choose up to ${n}.`,
  decisionFailed: 'Your answer didn’t go through.',
  tryAgain: 'Try again',
  tryAgainIn: (s) => `Try again in ${s}s`,
  reconnect: (source) => (source ? `Reconnect ${source}` : 'Reconnect'),
  errorReference: (id) => `Reference: ${id}`,
  messageTooLong: (max) => `Messages can be up to ${max.toLocaleString()} characters.`,
  openFull: 'Open',
  close: 'Close',
  download: 'Download',
  imageFailed: 'The image couldn’t be loaded.',
  planRunning: 'In progress',

  copy: 'Copy',
  copied: 'Copied',
  jumpToLatest: 'Jump to latest',
  loadError: 'Couldn’t load this chat.',
  reload: 'Reload',
  interrupted: 'The reply was interrupted.',
  stopped: 'Stopped',
  unknownBlock: 'Unsupported content',
  blockCrashed: 'This part of the answer couldn’t be displayed.',
  welcomeTitle: 'What can I help you with?',
  welcomePlaceholder: 'How can I help you today?',
  suggestionsLabel: 'Suggested prompts',
  dismissSuggestion: (label) => `Remove “${label}”`,
  composerMenu: 'Add to your message',
  menuAttach: 'Add files & photos',
  menuWorkflows: 'Workflows',
  menuSearch: 'Search…',
  menuNoMatches: 'Nothing matches',
  menuLoading: 'Loading…',
  menuLoadFailed: 'Couldn’t load this. Try again',
  feedbackGood: 'Good response',
  feedbackBad: 'Bad response',
  askAgain: 'Ask again',
  feedbackThanksTitle: 'Thanks for the feedback!',
  feedbackThanksMessage: 'Your response has been recorded',
  feedbackFailedTitle: 'Couldn’t send your feedback',
  feedbackFailedMessage: 'Please try again in a moment.',
  feedbackDialogTitle: 'Give negative feedback',
  feedbackIssueLabel: 'Select your issue type (optional)',
  feedbackDetailsLabel: 'Please provide details (optional)',
  feedbackHint: 'Your feedback helps us improve our responses.',
  fileKind: (kind) => FILE_KINDS[kind],
  timeAgo,
};
