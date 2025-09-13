/**
 * Generates a unique Digital ID for users
 * Format: IND-{timestamp}-{random string}
 * Example: IND-20230913-abc123
 */

export const generateDigitalId = (): string => {
  // Get current timestamp in YYYYMMDD format
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('');

  // Generate a random 6-character alphanumeric string
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();

  // Combine components to create the ID
  return `IND-${timestamp}-${randomStr}`;
};

/**
 * Validates a Digital ID format
 * @param id The ID to validate
 * @returns boolean indicating if the ID is valid
 */
export const isValidDigitalId = (id: string): boolean => {
  const regex = /^IND-\d{8}-[A-Z0-9]{6}$/;
  return regex.test(id);
};

/**
 * Extracts the creation date from a Digital ID
 * @param id The Digital ID
 * @returns Date object or null if invalid
 */
export const getCreationDateFromId = (id: string): Date | null => {
  if (!isValidDigitalId(id)) return null;
  
  try {
    const dateStr = id.substring(4, 12); // Extract YYYYMMDD
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JS months are 0-indexed
    const day = parseInt(dateStr.substring(6, 8), 10);
    
    return new Date(year, month, day);
  } catch (error) {
    console.error('Error parsing date from ID:', error);
    return null;
  }
};

/**
 * Generates a human-readable version of the Digital ID
 * @param id The Digital ID
 * @returns Formatted string (e.g., "IND-2023-09-13-ABC123")
 */
export const formatDigitalId = (id: string): string => {
  if (!isValidDigitalId(id)) return id; // Return as-is if invalid format
  
  const datePart = id.substring(4, 12);
  const randomPart = id.substring(13);
  
  // Format as IND-YYYY-MM-DD-RANDOM
  return `IND-${datePart.substring(0, 4)}-${datePart.substring(4, 6)}-${datePart.substring(6)}-${randomPart}`;
};
