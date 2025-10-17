/**
 * Database Layer: Dashboard
 *
 * Aggregate queries for dashboard statistics.
 * This file accesses multiple tables to provide dashboard summaries.
 */

import { QueryCtx } from "../_generated/server";
import { DataModel } from "../_generated/dataModel";

const TABLES = ["tasks", "threads", "messages"] as const;

/**
 * Load dashboard summary statistics
 */
export async function loadSummary(ctx: QueryCtx, userId?: string) {
  const perTable: Record<string, number> = {};

  for (const table of TABLES) {
    // Use type assertion for dynamic table queries
    const records = await ctx.db.query(table as keyof DataModel).collect();
    const scopedRecords = userId
      ? records.filter((record: any) => record.userId === userId)
      : records;
    perTable[table] = scopedRecords.length;
  }

  // Get detailed task stats if userId provided
  let taskStats = null;
  if (userId) {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    taskStats = {
      pending: tasks.filter((t) => t.status === "pending").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    };
  }

  return {
    perTable,
    totalRecords: Object.values(perTable).reduce((a, b) => a + b, 0),
    taskStats,
  };
}

/**
 * Load recent tasks
 */
export async function loadRecent(ctx: QueryCtx, userId: string, limit: number = 5) {
  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .take(limit);

  return tasks;
}
