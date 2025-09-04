import z from 'zod';

export const optionalDateSchema = z
  .string()
  .optional()
  .transform((val) => {
    // Handle empty string, null, or undefined
    if (!val || val === '' || val === 'null' || val === 'undefined') {
      return undefined;
    }

    // Check if it's in DD/MM/YYYY format and convert to ISO format
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = val.match(dateRegex);

    if (match) {
      const [, day, month, year] = match;
      // Convert DD/MM/YYYY to ISO format YYYY-MM-DD
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try to parse the date for other formats
    const parsed = new Date(val);

    // Check if the date is valid
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date format: ${val}`);
    }

    // Return as ISO string for other formats
    return parsed;
  });
