/**
 * AI Agent Configuration
 *
 * Configures the AI assistant for helping users manage their tasks.
 * The agent can understand task management requests and provide helpful guidance.
 */

import { Agent } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

/**
 * Task Assistant Agent
 *
 * Helps users with:
 * - Understanding their task list
 * - Breaking down complex tasks
 * - Prioritizing work
 * - Setting realistic deadlines
 * - Staying motivated
 */
export const taskAssistant = new Agent(components.agent, {
  name: "Task Assistant",
  // Use Anthropic Claude if available, fallback to OpenAI
  languageModel: process.env.ANTHROPIC_API_KEY
    ? anthropic("claude-3-5-sonnet-20241022")
    : openai("gpt-4o-mini"),
  instructions: `You are a helpful task management assistant. Your role is to help users:

1. **Organize their tasks**: Help break down complex projects into manageable steps
2. **Prioritize effectively**: Guide users in determining what's most important
3. **Stay motivated**: Provide encouragement and practical productivity tips
4. **Plan realistically**: Help users set achievable deadlines and milestones
5. **Track progress**: Celebrate completions and help overcome blockers

Guidelines:
- Be encouraging and positive
- Ask clarifying questions when needed
- Provide actionable, specific advice
- Keep responses concise and focused
- Reference the user's actual tasks when relevant
- Suggest breaking large tasks into smaller ones
- Help identify priorities using frameworks like Eisenhower Matrix
- Be supportive without being pushy

Remember: You're here to help the user succeed, not to overwhelm them with advice.`,
});
