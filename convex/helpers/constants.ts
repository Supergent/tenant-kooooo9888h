/**
 * Application Constants
 *
 * Shared constants used across the application.
 */

// Task limits
export const MAX_TASKS_PER_USER = 1000;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 5000;

// Thread limits
export const MAX_THREADS_PER_USER = 50;
export const MAX_THREAD_TITLE_LENGTH = 100;

// Message limits
export const MAX_MESSAGE_LENGTH = 10000;
export const MAX_MESSAGES_PER_THREAD = 1000;

// Pagination
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

// Status transitions
export const VALID_STATUS_TRANSITIONS: Record<
  "pending" | "in_progress" | "completed",
  Array<"pending" | "in_progress" | "completed">
> = {
  pending: ["pending", "in_progress", "completed"],
  in_progress: ["in_progress", "completed", "pending"],
  completed: ["completed", "pending"], // Allow reopening tasks
};
