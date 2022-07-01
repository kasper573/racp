/**
 * rAthena often has case-insensitive enums, but actually prefer capitalization.
 * This function finds duplicates and only keeps the values with the most uppercase characters.
 */
export function dedupe<T>(values: T[]): T[] {
  const unique: T[] = [];
  for (const newValue of values) {
    const newString = String(newValue);
    const uniqueIndex = unique.findIndex(
      (candidate) => String(candidate).toLowerCase() === newString.toLowerCase()
    );

    if (uniqueIndex === -1) {
      unique.push(newValue);
      continue;
    }

    const uniqueString = String(unique[uniqueIndex]);
    const uniqueScore = score(uniqueString);
    const newScore = score(newString);

    if (newScore > uniqueScore) {
      unique.splice(uniqueIndex, 1, newValue);
    }
  }

  return unique;
}

function score(str: string) {
  const uppercase = str.toUpperCase();
  let n = 0;
  for (let i = 0; i < str.length; i++) {
    const isUppercase = str.charAt(i) === uppercase.charAt(i);
    if (isUppercase) {
      n++;
    }
  }
  return n;
}
