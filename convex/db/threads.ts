/**
 * Database Layer: Threads
 *
 * This is the ONLY file that directly accesses the threads table using ctx.db.
 * All thread-related database operations are defined here as pure async functions.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// CREATE
export async function createThread(
  ctx: MutationCtx,
  args: {
    userId: string;
    title?: string;
    status: "active" | "archived";
  }
) {
  const now = Date.now();
  return await ctx.db.insert("threads", {
    ...args,
    createdAt: now,
    updatedAt: now,
  });
}

// READ - Get by ID
export async function getThreadById(ctx: QueryCtx, id: Id<"threads">) {
  return await ctx.db.get(id);
}

// READ - Get by user
export async function getThreadsByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("threads")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

// READ - Get by user and status
export async function getThreadsByUserAndStatus(
  ctx: QueryCtx,
  userId: string,
  status: "active" | "archived"
) {
  return await ctx.db
    .query("threads")
    .withIndex("by_user_and_status", (q) =>
      q.eq("userId", userId).eq("status", status)
    )
    .order("desc")
    .collect();
}

// READ - Get active threads for user
export async function getActiveThreads(ctx: QueryCtx, userId: string) {
  return await getThreadsByUserAndStatus(ctx, userId, "active");
}

// UPDATE
export async function updateThread(
  ctx: MutationCtx,
  id: Id<"threads">,
  args: {
    title?: string;
    status?: "active" | "archived";
  }
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

// UPDATE - Archive thread
export async function archiveThread(ctx: MutationCtx, id: Id<"threads">) {
  return await ctx.db.patch(id, {
    status: "archived",
    updatedAt: Date.now(),
  });
}

// UPDATE - Reactivate thread
export async function reactivateThread(ctx: MutationCtx, id: Id<"threads">) {
  return await ctx.db.patch(id, {
    status: "active",
    updatedAt: Date.now(),
  });
}

// DELETE
export async function deleteThread(ctx: MutationCtx, id: Id<"threads">) {
  return await ctx.db.delete(id);
}