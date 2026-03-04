import type { JournalEntry } from "./types";
import { getSessionId } from "./session";

const JOURNAL_KEY_PREFIX = "stratos_journal_";

function getJournalKey(): string {
  return `${JOURNAL_KEY_PREFIX}${getSessionId()}`;
}

export function getJournalEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(getJournalKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveJournalEntry(entry: JournalEntry): void {
  const entries = getJournalEntries();
  entries.unshift(entry);
  localStorage.setItem(getJournalKey(), JSON.stringify(entries));
}

export function recordOutcome(auditId: string, outcome: string): void {
  const entries = getJournalEntries();
  const idx = entries.findIndex(e => e.id === auditId);
  if (idx !== -1) {
    entries[idx].outcome = outcome;
    entries[idx].outcomeDate = new Date().toISOString();
    localStorage.setItem(getJournalKey(), JSON.stringify(entries));
  }
}

export function deleteJournal(): void {
  localStorage.removeItem(getJournalKey());
}

export function getJournalCount(): number {
  return getJournalEntries().length;
}
