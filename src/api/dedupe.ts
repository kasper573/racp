// rAthena often has case-insensitive enums, but actually prefer capitalization.
// These functions find duplicates and only keeps the values with the most uppercase characters.

export function dedupe(values: string[]): string[] {
  const unique: string[] = [];
  for (const newValue of values) {
    dedupeInsert(unique, newValue);
  }
  return unique;
}

export function dedupeInsert(list: string[], newValue: string) {
  const similarIndex = list.findIndex((v) => isSimilar(v, newValue));
  if (similarIndex === -1) {
    list.push(newValue);
  } else {
    const similarValue = list[similarIndex];
    list.splice(similarIndex, 1, best(newValue, similarValue));
  }
}

export function dedupeRecordInsert(
  record: Record<string, string[]>,
  key?: string,
  value?: string
) {
  if (key === undefined) {
    return;
  }

  const similarKey = Object.keys(record).find((v) => isSimilar(v, key));

  // First entry
  if (!similarKey) {
    record[key] = value !== undefined ? [value] : [];
    return;
  }

  // New entries
  const entries = record[similarKey];
  if (value !== undefined) {
    // Dedupe value
    dedupeInsert(entries, value);
  }

  // Dedupe key
  delete record[similarKey];
  record[best(similarKey, key)] = entries;
}

const best = (a: string, b: string) => (score(a) > score(b) ? a : b);
const score = (s: string) => [...s].reduce((n, l) => n + isUppercase(l), 0);
const isUppercase = (s: string) => (s === s.toUpperCase() ? 1 : 0);
const isSimilar = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
