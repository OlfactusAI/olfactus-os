export function normalizeEmail(
  value: string,
) {
  const email =
    value.trim().toLowerCase();

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    )
  ) {
    throw new Error(
      "Enter a valid email address.",
    );
  }

  return email;
}

export function normalizeDisplayName(
  value: string,
) {
  const name =
    value.trim();

  if (
    name.length < 2 ||
    name.length > 80
  ) {
    throw new Error(
      "Display name must be between 2 and 80 characters.",
    );
  }

  return name;
}
