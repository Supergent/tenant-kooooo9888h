import { defineApp } from "convex/server";

// Import Convex Components
import betterAuth from "@convex-dev/better-auth/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import agent from "@convex-dev/agent/convex.config";

const app = defineApp();

// Register components (betterAuth MUST be first)
app.use(betterAuth);
app.use(rateLimiter);
app.use(agent);

export default app;
