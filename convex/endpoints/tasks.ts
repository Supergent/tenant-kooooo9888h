/**
 * Endpoint Layer: Tasks
 *
 * Business logic for task management.
 * Composes database operations from the db layer.
 * Handles authentication, authorization, and rate limiting.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import * as Tasks from "../db/tasks";
import {
  isValidTaskTitle,
  isValidTaskDescription,
  isValidDueDate,
  sanitizeInput,
} from "../helpers/validation";
import { MAX_TASKS_PER_USER } from "../helpers/constants";

/**
 * Create a new task
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "createTask", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(rateLimitStatus.retryAfter / 1000)} seconds.`
      );
    }

    // 3. Validation
    const sanitizedTitle = sanitizeInput(args.title);
    if (!isValidTaskTitle(sanitizedTitle)) {
      throw new Error("Task title must be between 1 and 200 characters");
    }

    if (args.description) {
      const sanitizedDescription = sanitizeInput(args.description);
      if (!isValidTaskDescription(sanitizedDescription)) {
        throw new Error("Task description must be less than 5000 characters");
      }
    }

    if (args.dueDate && !isValidDueDate(args.dueDate)) {
      throw new Error("Invalid due date");
    }

    // 4. Check task limit
    const existingTasks = await Tasks.getTasksByUser(ctx, authUser._id);
    if (existingTasks.length >= MAX_TASKS_PER_USER) {
      throw new Error(`Maximum ${MAX_TASKS_PER_USER} tasks per user reached`);
    }

    // 5. Create task
    return await Tasks.createTask(ctx, {
      userId: authUser._id,
      title: sanitizedTitle,
      description: args.description ? sanitizeInput(args.description) : undefined,
      status: "pending",
      priority: args.priority,
      dueDate: args.dueDate,
    });
  },
});

/**
 * List all tasks for the authenticated user
 */
export const list = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUser(ctx, authUser._id);
  },
});

/**
 * List tasks by status
 */
export const listByStatus = query({
  args: {
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUserAndStatus(ctx, authUser._id, args.status);
  },
});

/**
 * Get upcoming tasks (not completed, with due date in the future)
 */
export const upcoming = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getUpcomingTasks(ctx, authUser._id);
  },
});

/**
 * Get overdue tasks
 */
export const overdue = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getOverdueTasks(ctx, authUser._id);
  },
});

/**
 * Get task counts by status
 */
export const stats = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.countTasksByStatus(ctx, authUser._id);
  },
});

/**
 * Get a single task by ID
 */
export const get = query({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify ownership
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to view this task");
    }

    return task;
  },
});

/**
 * Update a task
 */
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"))
    ),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "updateTask", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(rateLimitStatus.retryAfter / 1000)} seconds.`
      );
    }

    // 3. Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to update this task");
    }

    // 4. Validation
    const updates: {
      title?: string;
      description?: string;
      status?: "pending" | "in_progress" | "completed";
      priority?: "low" | "medium" | "high";
      dueDate?: number;
      completedAt?: number;
    } = {};

    if (args.title !== undefined) {
      const sanitizedTitle = sanitizeInput(args.title);
      if (!isValidTaskTitle(sanitizedTitle)) {
        throw new Error("Task title must be between 1 and 200 characters");
      }
      updates.title = sanitizedTitle;
    }

    if (args.description !== undefined) {
      const sanitizedDescription = sanitizeInput(args.description);
      if (!isValidTaskDescription(sanitizedDescription)) {
        throw new Error("Task description must be less than 5000 characters");
      }
      updates.description = sanitizedDescription;
    }

    if (args.status !== undefined) {
      updates.status = args.status;
      // Set completedAt when marking as completed
      if (args.status === "completed" && task.status !== "completed") {
        updates.completedAt = Date.now();
      }
      // Clear completedAt when reopening
      if (args.status !== "completed" && task.status === "completed") {
        updates.completedAt = undefined;
      }
    }

    if (args.priority !== undefined) {
      updates.priority = args.priority;
    }

    if (args.dueDate !== undefined) {
      if (!isValidDueDate(args.dueDate)) {
        throw new Error("Invalid due date");
      }
      updates.dueDate = args.dueDate;
    }

    // 5. Update task
    return await Tasks.updateTask(ctx, args.id, updates);
  },
});

/**
 * Mark a task as completed
 */
export const complete = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const rateLimitStatus = await rateLimiter.limit(ctx, "updateTask", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(rateLimitStatus.retryAfter / 1000)} seconds.`
      );
    }

    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to update this task");
    }

    return await Tasks.markTaskCompleted(ctx, args.id);
  },
});

/**
 * Delete a task
 */
export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const rateLimitStatus = await rateLimiter.limit(ctx, "deleteTask", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(rateLimitStatus.retryAfter / 1000)} seconds.`
      );
    }

    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to delete this task");
    }

    return await Tasks.deleteTask(ctx, args.id);
  },
});
