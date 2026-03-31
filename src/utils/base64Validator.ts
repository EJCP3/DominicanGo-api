/**
 * Calculates the approximate size in bytes of a Base64 encoded string.
 * Helps prevent RAM saturation from unusually large payload strings.
 * 
 * @param base64String Processing input
 * @returns Size in bytes
 */
export const getBase64SizeInBytes = (base64String: string): number => {
  // Strip out the data url part if present
  const base64Data = base64String.includes('base64,') 
    ? base64String.split('base64,')[1] 
    : base64String;

  // Formula: (Length * (3/4)) - padding characters
  const paddingMatches = base64Data.match(/=+$/);
  const paddingLength = paddingMatches ? paddingMatches[0].length : 0;
  
  return (base64Data.length * 0.75) - paddingLength;
};

/**
 * Zod validation refinement function
 * Checks if a base64 string exceeds a specified limit in Megabytes.
 * 
 * @param maxMB Limit in MB
 */
export const maxBase64Size = (maxMB: number) => {
  const maxBytes = maxMB * 1024 * 1024;
  return (val: string) => {
    // If it's a regular http URL, skip validation
    if (val.startsWith('http://') || val.startsWith('https://')) {
      return true;
    }
    return getBase64SizeInBytes(val) <= maxBytes;
  };
};
