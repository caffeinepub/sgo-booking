/**
 * Shared utilities for handling room picture URLs across Guest and Hotel UIs.
 * Validates and normalizes picture URLs to support all stored formats including
 * generic data: URLs, http(s):// URLs, and direct blob URLs.
 */

/**
 * Checks if a picture URL is valid and displayable.
 * Accepts:
 * - data: URLs (all types, not just data:image/)
 * - http:// and https:// URLs
 * - Any other non-empty string (for direct blob URLs from ExternalBlob.getDirectURL())
 */
export function isValidPictureUrl(url: unknown): url is string {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return false;
  }
  
  // Accept all data: URLs (not just data:image/)
  if (url.startsWith('data:')) {
    return true;
  }
  
  // Accept http/https URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }
  
  // Accept any other non-empty string (for direct blob URLs)
  return true;
}

/**
 * Filters an array of picture URLs to only valid, displayable ones.
 */
export function getValidPictures(pictures: string[]): string[] {
  return pictures.filter(isValidPictureUrl);
}

/**
 * Gets the first valid picture from an array, or null if none exist.
 */
export function getFirstValidPicture(pictures: string[]): string | null {
  const valid = getValidPictures(pictures);
  return valid.length > 0 ? valid[0] : null;
}

/**
 * Tracks failed image URLs (not indices) to prevent desync when filtering.
 */
export class FailedImageTracker {
  private failedUrls = new Set<string>();

  markFailed(url: string): void {
    this.failedUrls.add(url);
  }

  hasFailed(url: string): boolean {
    return this.failedUrls.has(url);
  }

  reset(): void {
    this.failedUrls.clear();
  }
}

/**
 * Filters pictures to exclude those that have failed to load.
 */
export function getDisplayablePictures(
  pictures: string[],
  failedTracker: FailedImageTracker
): string[] {
  const valid = getValidPictures(pictures);
  return valid.filter((url) => !failedTracker.hasFailed(url));
}
