/**
 * Validation Helpers
 *
 * Pure functions for input validation.
 * NO database access, NO ctx parameter.
 */

/**
 * Validates task title
 */
export function isValidTaskTitle(title: string): boolean {
  return title.length > 0 && title.length <= 200;
}

/**
 * Validates task description
 */
export function isValidTaskDescription(description: string): boolean {
  return description.length <= 5000;
}

/**
 * Validates due date (must be in the future or today)
 */
export function isValidDueDate(dueDate: number): boolean {
  const now = Date.now();
  // Allow dates from today onwards (within 5 years)
  const fiveYearsFromNow = now + 5 * 365 * 24 * 60 * 60 * 1000;
  return dueDate >= now - 24 * 60 * 60 * 1000 && dueDate <= fiveYearsFromNow;
}

/**
 * Validates task status
 */
export function isValidTaskStatus(
  status: string
): status is "pending" | "in_progress" | "completed" {
  return ["pending", "in_progress", "completed"].includes(status);
}

/**
 * Validates task priority
 */
export function isValidTaskPriority(
  priority: string
): priority is "low" | "medium" | "high" {
  return ["low", "medium", "high"].includes(priority);
}

/**
 * Validates thread title
 */
export function isValidThreadTitle(title: string): boolean {
  return title.length > 0 && title.length <= 100;
}

/**
 * Validates message content
 */
export function isValidMessageContent(content: string): boolean {
  return content.length > 0 && content.length <= 10000;
}

/**
 * Sanitizes user input (removes excessive whitespace)
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
