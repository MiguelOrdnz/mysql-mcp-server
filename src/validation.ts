/**
 * Validates that a string is a safe MySQL identifier (table name, database name).
 *
 * Allowed: alphanumeric, underscores, dots (for schema.table), hyphens.
 * Max length: 64 characters (MySQL limit for identifiers).
 *
 * Throws if the identifier is invalid.
 */
export function validateIdentifier(name: string, label = "identifier"): string {
  if (!name || name.trim().length === 0) {
    throw new Error(`${label} cannot be empty`);
  }

  const trimmed = name.trim();

  if (trimmed.length > 64) {
    throw new Error(`${label} exceeds maximum length of 64 characters`);
  }

  const SAFE_IDENTIFIER = /^[a-zA-Z0-9_][a-zA-Z0-9_.\-]*$/;

  if (!SAFE_IDENTIFIER.test(trimmed)) {
    throw new Error(
      `${label} "${trimmed}" contains invalid characters. ` +
        `Only letters, digits, underscores, hyphens, and dots are allowed.`
    );
  }

  return trimmed;
}
