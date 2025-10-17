import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { createAuth } from "./auth";

/**
 * HTTP router for Convex
 *
 * Handles Better Auth authentication endpoints:
 * - POST /auth/* - Login, signup, logout, etc.
 * - GET /auth/* - Session verification, user info, etc.
 *
 * Better Auth automatically handles all authentication flows
 * through these wildcard routes.
 */
const http = httpRouter();

// Better Auth POST routes (login, signup, logout, etc.)
http.route({
  path: "/auth/*",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx);
    return await auth.handler(request);
  }),
});

// Better Auth GET routes (session verification, user info, etc.)
http.route({
  path: "/auth/*",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx);
    return await auth.handler(request);
  }),
});

export default http;
