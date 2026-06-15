export function parseEmailList(value: string): string[] {
  return value
    .split(/[,;\n]+/)
    .map((email) => email.trim())
    .filter(Boolean);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateEmailList(
  value: string,
  fieldName: string,
): string | null {
  if (!value.trim()) return null;

  const emails = parseEmailList(value);
  const invalid = emails.filter((email) => !isValidEmail(email));

  if (invalid.length > 0) {
    return `Invalid ${fieldName} address${invalid.length > 1 ? "es" : ""}: ${invalid.join(", ")}`;
  }

  return null;
}

export function formatFromAddress(name: string, email: string): string {
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();

  if (!trimmedName) return trimmedEmail;
  return `${trimmedName} <${trimmedEmail}>`;
}
