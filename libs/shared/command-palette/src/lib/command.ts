export type CommandGroup = 'navigate' | 'theme' | 'action';

export interface Command {
  readonly id: string;
  readonly label: string;
  readonly group: CommandGroup;
  /** Extra text the fuzzy search can match against (e.g. route path, aliases). */
  readonly keywords?: readonly string[];
  /** Shortcut hint displayed on the right of the row (not wired to a listener
   *  — that's up to the host to register separately if it wants). */
  readonly hint?: string;
  readonly run: () => void | Promise<void>;
}
