/**
 * Trims a string and returns undefined if the result is empty
 */
export function trimOrUndefined(value: string | undefined): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Trims a string and returns empty string if the result would be undefined
 */
export function trimOrEmpty(value: string | undefined): string {
  if (value === undefined || value === null) {
    return '';
  }
  return value.trim();
}
