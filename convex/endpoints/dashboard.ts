/**
 * Endpoint Layer: Dashboard
 *
 * Provides aggregate statistics and recent activity for the dashboard.
 */

import { v } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth";
import * as Dashboard from "../db/dashboard";
import * as Tasks from "../db/tasks";

/**
 * Get dashboard summary statistics
 */
export const summary = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Dashboard.loadSummary(ctx, authUser._id);
  },
});

/**
 * Get recent tasks
 */
export const recent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Dashboard.loadRecent(ctx, authUser._id, args.limit ?? 5);
  },
});

/**
 * Get task statistics
 */
export const taskStats = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.countTasksByStatus(ctx, authUser._id);
  },
});
