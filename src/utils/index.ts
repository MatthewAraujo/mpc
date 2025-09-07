/**
 * Utility functions for data processing and formatting
 */

/**
 * Escape CSV field by wrapping in quotes, doubling internal quotes, and removing newlines
 */
export function escapeCsvField(s: string): string {
  const singleLine = s.replace(/\r\n/g, " ").replace(/\n/g, " ");
  const escaped = singleLine.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Count words in a string by splitting on whitespace
 */
export function wordCount(s: string): number {
  if (!s) return 0;
  return s.trim().length === 0 ? 0 : s.trim().split(/\s+/).length;
}

/**
 * Create a regex pattern from an array of keywords for case-insensitive matching
 */
export function createKeywordRegex(keywords: readonly string[]): RegExp {
  return new RegExp(keywords.join("|"), "i");
}

/**
 * Ensure directory exists, create if it doesn't
 */
export function ensureDirectoryExists(dirPath: string): void {
  const fs = require("fs");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
