# Task Manager - AI-Powered Todo List

A clean, focused todo list application with real-time updates, user authentication, and optional AI assistance. Built with Convex backend, Next.js 15 App Router, and Better Auth.

## ✨ Features

- 🔐 **User Authentication** - Email/password signup and signin
- ✅ **Task Management** - Create, complete, delete, and filter tasks
- 📊 **Live Statistics** - Real-time dashboard with task metrics
- 🤖 **AI Assistant** - Optional AI-powered task help (requires API key)
- ⚡ **Real-time Updates** - Changes sync instantly across all devices
- 🛡️ **Rate Limiting** - Built-in protection against abuse
- 🎨 **Clean UI** - Responsive design with Tailwind CSS
- 🔒 **Type-Safe** - Full TypeScript coverage

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A Convex account ([sign up free](https://convex.dev))

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.local.example .env.local

# 3. Generate Better Auth secret
openssl rand -base64 32
# Add to .env.local as BETTER_AUTH_SECRET

# 4. Start Convex backend (keep running)
npx convex dev

# 5. In a new terminal, start Next.js frontend
cd apps/web && npm run dev

# 6. Open browser
open http://localhost:3000
```

**See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.**

## 📁 Project Structure

```
.
├── convex/                 # Backend (Convex)
│   ├── db/                # Database layer (CRUD operations)
│   │   ├── tasks.ts       # Task database operations
│   │   ├── threads.ts     # Thread database operations
│   │   ├── messages.ts    # Message database operations
│   │   └── index.ts       # Barrel export
│   ├── endpoints/         # Business logic layer
│   │   ├── tasks.ts       # Task management endpoints
│   │   ├── assistant.ts   # AI assistant endpoints
│   │   └── dashboard.ts   # Dashboard statistics
│   ├── helpers/           # Utility functions
│   │   ├── validation.ts  # Input validation
│   │   └── constants.ts   # App constants
│   ├── schema.ts          # Database schema
│   ├── auth.ts            # Better Auth configuration
│   ├── http.ts            # HTTP routes
│   ├── rateLimiter.ts     # Rate limiting config
│   └── agent.ts           # AI agent configuration
├── apps/web/              # Frontend (Next.js)
│   ├── app/
│   │   ├── auth/          # Auth pages (signin/signup)
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/        # React components
│   │   └── task-list.tsx  # Task management UI
│   ├── lib/               # Client utilities
│   │   ├── auth-client.ts # Auth setup
│   │   └── convex.ts      # Convex client
│   └── providers/         # React providers
│       └── convex-provider.tsx
└── packages/              # Shared design system
    ├── design-tokens/     # Theme configuration
    └── components/        # Reusable UI components
```

## 🏗️ Architecture

This project follows the **four-layer Convex architecture** (The Cleargent Pattern):

### 1. Database Layer (`convex/db/`)
- **ONLY place** where `ctx.db` is used
- Pure async functions (NOT queries/mutations)
- CRUD operations with proper TypeScript types

### 2. Endpoint Layer (`convex/endpoints/`)
- Business logic that composes database operations
- **NEVER uses** `ctx.db` directly
- Authentication and authorization
- Rate limiting on mutations
- Input validation

### 3. Helper Layer (`convex/helpers/`)
- Pure utility functions
- NO database access, NO `ctx` parameter
- Validation, formatting, constants

### 4. Frontend (`apps/web/`)
- Next.js 15 App Router
- Real-time updates via Convex
- Shared design system from packages

**Why this architecture?**
- Clear separation of concerns
- Easy to test each layer independently
- Database queries optimized in one place
- Business logic reusable across endpoints

## 🔐 Authentication

Uses [Better Auth](https://better-auth.com) with Convex adapter:
- Email/password authentication
- Session management
- JWT tokens (30-day expiration)
- User scoping on all operations

## 🛡️ Rate Limiting

Built-in protection against abuse:
- **Task operations**: 20-50 per minute (token bucket)
- **AI operations**: 5-10 per minute (token bucket)
- **Auth operations**: 5-10 per hour (fixed window)

Configure in `convex/rateLimiter.ts`.

## 🤖 AI Assistant (Optional)

Enable AI-powered task assistance:

1. Get an API key:
   - [Anthropic Claude](https://console.anthropic.com/) (recommended)
   - [OpenAI](https://platform.openai.com/)

2. Add to `.env.local`:
   ```bash
   ANTHROPIC_API_KEY=your_key_here
   # OR
   OPENAI_API_KEY=your_key_here
   ```

3. Restart Convex dev server

The AI assistant can:
- Help break down complex tasks
- Suggest priorities
- Provide productivity tips
- Reference your actual tasks for context

## 📊 Database Schema

### Tasks
```typescript
{
  userId: string
  title: string
  description?: string
  status: "pending" | "in_progress" | "completed"
  priority?: "low" | "medium" | "high"
  dueDate?: number
  completedAt?: number
  createdAt: number
  updatedAt: number
}
```

### Threads (AI Assistant)
```typescript
{
  userId: string
  title?: string
  status: "active" | "archived"
  createdAt: number
  updatedAt: number
}
```

### Messages (AI Assistant)
```typescript
{
  threadId: Id<"threads">
  userId: string
  role: "user" | "assistant"
  content: string
  createdAt: number
}
```

## 🔧 Development

### Available Scripts

```bash
# Start both backend and frontend
npm run dev

# Start only backend
npx convex dev

# Start only frontend
cd apps/web && npm run dev

# Build for production
npm run build

# View component library
npm run storybook
```

### Environment Variables

Required:
```bash
CONVEX_DEPLOYMENT=              # Auto-set by convex dev
NEXT_PUBLIC_CONVEX_URL=         # Auto-set by convex dev
BETTER_AUTH_SECRET=             # Generate with: openssl rand -base64 32
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Optional (for AI features):
```bash
ANTHROPIC_API_KEY=              # For Claude
OPENAI_API_KEY=                 # For GPT-4
```

See `.env.local.example` for full list.

## 🚢 Deployment

### Convex Backend

```bash
# Deploy to production
npx convex deploy

# Set production environment variables
npx convex env set BETTER_AUTH_SECRET="your_secret"
npx convex env set SITE_URL="https://your-domain.com"
```

### Next.js Frontend (Vercel)

```bash
cd apps/web
npm run build
vercel deploy
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_CONVEX_URL` (from Convex dashboard)
- `NEXT_PUBLIC_SITE_URL` (your production URL)

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
- **[PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md)** - Infrastructure details
- **[PHASE_2_COMPLETE.md](./PHASE_2_COMPLETE.md)** - Implementation details
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete overview

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Create task
- [ ] Mark task complete
- [ ] Delete task
- [ ] Filter by status
- [ ] View statistics
- [ ] Test rate limiting (create 20+ tasks rapidly)
- [ ] Test real-time updates (open in two tabs)

## 🛠️ Tech Stack

### Backend
- [Convex](https://convex.dev) - Serverless backend with real-time database
- [Better Auth](https://better-auth.com) - Authentication library
- [Convex Components](https://docs.convex.dev/components) - Rate limiter, Agent
- TypeScript

### Frontend
- [Next.js 15](https://nextjs.org) - React framework (App Router)
- [React 18](https://react.dev) - UI library
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com) - Component primitives
- [Radix UI](https://radix-ui.com) - Unstyled components
- [Lucide](https://lucide.dev) - Icons

### AI (Optional)
- [Anthropic Claude](https://anthropic.com) or [OpenAI](https://openai.com)
- [@convex-dev/agent](https://www.npmjs.com/package/@convex-dev/agent) - AI orchestration

## 🤝 Contributing

This is a generated project showcasing Convex best practices. Feel free to:
- Fork and modify for your needs
- Use as a template for your projects
- Learn from the architecture patterns

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Built with [Convex](https://convex.dev)
- Authentication by [Better Auth](https://better-auth.com)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com)
- Generated by Claude Code - Convex Project Architect

## 📞 Support

### Resources
- [Convex Documentation](https://docs.convex.dev)
- [Better Auth Documentation](https://better-auth.com)
- [Next.js Documentation](https://nextjs.org/docs)

### Community
- [Convex Discord](https://convex.dev/community)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)

---

**Happy task managing! 🚀**

Built with ❤️ using Convex, Next.js, and Better Auth.
