/**
 * Endpoint Layer: AI Assistant
 *
 * Business logic for AI-powered task assistance.
 * Manages threads and messages for conversational task management help.
 */

import { v } from "convex/values";
import { mutation, query, action, QueryCtx, MutationCtx } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import { taskAssistant } from "../agent";
import * as Threads from "../db/threads";
import * as Messages from "../db/messages";
import * as Tasks from "../db/tasks";
import {
  isValidThreadTitle,
  isValidMessageContent,
  sanitizeInput,
} from "../helpers/validation";
import { MAX_THREADS_PER_USER, MAX_MESSAGES_PER_THREAD } from "../helpers/constants";

/**
 * Create a new conversation thread
 */
export const createThread = mutation({
  args: {
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const rateLimitStatus = await rateLimiter.limit(ctx, "createThread", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(rateLimitStatus.retryAfter / 1000)} seconds.`
      );
    }

    // Check thread limit
    const existingThreads = await Threads.getThreadsByUser(ctx, authUser._id);
    if (existingThreads.length >= MAX_THREADS_PER_USER) {
      throw new Error(`Maximum ${MAX_THREADS_PER_USER} threads per user reached`);
    }

    // Validate title if provided
    let sanitizedTitle: string | undefined;
    if (args.title) {
      sanitizedTitle = sanitizeInput(args.title);
      if (!isValidThreadTitle(sanitizedTitle)) {
        throw new Error("Thread title must be between 1 and 100 characters");
      }
    }

    return await Threads.createThread(ctx, {
      userId: authUser._id,
      title: sanitizedTitle,
      status: "active",
    });
  },
});

/**
 * List all threads for the authenticated user
 */
export const listThreads = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Threads.getThreadsByUser(ctx, authUser._id);
  },
});

/**
 * List active threads
 */
export const activeThreads = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Threads.getActiveThreads(ctx, authUser._id);
  },
});

/**
 * Get a single thread with its messages
 */
export const getThread = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const thread = await Threads.getThreadById(ctx, args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.userId !== authUser._id) {
      throw new Error("Not authorized to view this thread");
    }

    const messages = await Messages.getMessagesByThread(ctx, args.threadId);

    return {
      thread,
      messages,
    };
  },
});

/**
 * Update thread (rename or archive)
 */
export const updateThread = mutation({
  args: {
    threadId: v.id("threads"),
    title: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const thread = await Threads.getThreadById(ctx, args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.userId !== authUser._id) {
      throw new Error("Not authorized to update this thread");
    }

    const updates: { title?: string; status?: "active" | "archived" } = {};

    if (args.title !== undefined) {
      const sanitizedTitle = sanitizeInput(args.title);
      if (!isValidThreadTitle(sanitizedTitle)) {
        throw new Error("Thread title must be between 1 and 100 characters");
      }
      updates.title = sanitizedTitle;
    }

    if (args.status !== undefined) {
      updates.status = args.status;
    }

    return await Threads.updateThread(ctx, args.threadId, updates);
  },
});

/**
 * Delete a thread and all its messages
 */
export const deleteThread = mutation({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const thread = await Threads.getThreadById(ctx, args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.userId !== authUser._id) {
      throw new Error("Not authorized to delete this thread");
    }

    // Delete all messages first
    await Messages.deleteMessagesByThread(ctx, args.threadId);

    // Then delete the thread
    return await Threads.deleteThread(ctx, args.threadId);
  },
});

/**
 * Internal query to get thread by ID
 */
const internalGetThreadById = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    return await Threads.getThreadById(ctx, args.threadId);
  },
});

/**
 * Internal query to count messages in thread
 */
const internalCountMessagesInThread = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    return await Messages.countMessagesInThread(ctx, args.threadId);
  },
});

/**
 * Internal mutation to create a message
 */
const internalCreateMessage = mutation({
  args: {
    threadId: v.id("threads"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await Messages.createMessage(ctx, {
      threadId: args.threadId,
      userId: args.userId,
      role: args.role,
      content: args.content,
    });
  },
});

/**
 * Internal query to get tasks by user
 */
const internalGetTasksByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await Tasks.getTasksByUser(ctx, args.userId);
  },
});

/**
 * Internal query to get recent messages by thread
 */
const internalGetRecentMessagesByThread = query({
  args: {
    threadId: v.id("threads"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return await Messages.getRecentMessagesByThread(ctx, args.threadId, args.limit);
  },
});

/**
 * Send a message and get AI response
 */
export const sendMessage = action({
  args: {
    threadId: v.id("threads"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get authenticated user
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimitStatus = await rateLimiter.limit(ctx, "sendMessage", {
      key: authUser._id,
    });
    if (!rateLimitStatus.ok) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(rateLimitStatus.retryAfter / 1000)} seconds.`
      );
    }

    // 3. Validate message content
    const sanitizedContent = sanitizeInput(args.content);
    if (!isValidMessageContent(sanitizedContent)) {
      throw new Error("Message content must be between 1 and 10000 characters");
    }

    // 4. Verify thread ownership
    const thread = await ctx.runQuery(internalGetThreadById, {
      threadId: args.threadId,
    });
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.userId !== authUser._id) {
      throw new Error("Not authorized to send messages in this thread");
    }

    // 5. Check message limit
    const messageCount = await ctx.runQuery(internalCountMessagesInThread, {
      threadId: args.threadId,
    });
    if (messageCount >= MAX_MESSAGES_PER_THREAD) {
      throw new Error(`Maximum ${MAX_MESSAGES_PER_THREAD} messages per thread reached`);
    }

    // 6. Save user message
    const userMessageId = await ctx.runMutation(internalCreateMessage, {
      threadId: args.threadId,
      userId: authUser._id,
      role: "user",
      content: sanitizedContent,
    });

    // 7. Get user's current tasks for context
    const tasks = await ctx.runQuery(internalGetTasksByUser, {
      userId: authUser._id,
    });

    const taskContext = tasks.length > 0
      ? `\n\nCurrent user tasks:\n${tasks.map((t: any) => `- [${t.status}] ${t.title}${t.priority ? ` (${t.priority} priority)` : ""}${t.dueDate ? ` (due: ${new Date(t.dueDate).toLocaleDateString()})` : ""}`).join("\n")}`
      : "\n\nThe user has no tasks yet.";

    // 8. Get previous messages for context
    const previousMessages = await ctx.runQuery(internalGetRecentMessagesByThread, {
      threadId: args.threadId,
      limit: 10,
    });

    // 9. Build conversation history
    const conversationHistory = previousMessages
      .filter((m: any) => m._id !== userMessageId) // Exclude the message we just added
      .map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    // 10. Call AI agent
    const aiResponse = await (taskAssistant as any).generate(ctx, {
      messages: [
        ...conversationHistory,
        {
          role: "user",
          content: sanitizedContent + taskContext,
        },
      ],
    });

    // 11. Save AI response
    const assistantMessageId = await ctx.runMutation(internalCreateMessage, {
      threadId: args.threadId,
      userId: authUser._id,
      role: "assistant",
      content: aiResponse.text,
    });

    return {
      userMessageId,
      assistantMessageId,
      response: aiResponse.text,
    };
  },
});