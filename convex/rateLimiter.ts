/**
 * Rate Limiter Configuration
 *
 * Defines rate limits for various operations to prevent abuse.
 * Uses token bucket algorithm for bursts and fixed window for hard limits.
 */

import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Task operations - allow bursts, refill over time
  createTask: { kind: "token bucket", rate: 20, period: MINUTE, capacity: 5 },
  updateTask: { kind: "token bucket", rate: 50, period: MINUTE },
  deleteTask: { kind: "token bucket", rate: 30, period: MINUTE },

  // AI Assistant operations - more restrictive due to external API costs
  createThread: { kind: "token bucket", rate: 5, period: MINUTE, capacity: 2 },
  sendMessage: { kind: "token bucket", rate: 10, period: MINUTE, capacity: 3 },

  // Auth operations - prevent brute force
  signup: { kind: "fixed window", rate: 5, period: HOUR },
  login: { kind: "fixed window", rate: 10, period: HOUR },
});
