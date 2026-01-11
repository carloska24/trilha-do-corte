/**
 * Formats a full name into a shortened version.
 * Example: "Carlos Alberto" -> "CARLOS A."
 * Example: "João" -> "JOÃO"
 */
export const formatName = (fullName: string | undefined | null): string => {
  if (!fullName) return '';

  const cleanName = fullName.trim();
  const parts = cleanName.split(/\s+/); // Split by any whitespace

  if (parts.length === 1) {
    return parts[0].toUpperCase();
  }

  // Take first name and first letter of the second name
  const firstName = parts[0].toUpperCase();
  const secondInitial = parts[1][0].toUpperCase();

  return `${firstName} ${secondInitial}.`;
};
