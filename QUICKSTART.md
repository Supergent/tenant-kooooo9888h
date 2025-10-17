# Quick Start Guide

Get your task manager app running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- A Convex account (sign up at [convex.dev](https://convex.dev))

## Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Generate a Better Auth secret
openssl rand -base64 32

# Edit .env.local and add:
# - BETTER_AUTH_SECRET (paste the generated secret)
# - CONVEX_DEPLOYMENT (will be set by convex dev)
# - NEXT_PUBLIC_CONVEX_URL (will be set by convex dev)
```

### 3. Start Convex Backend

Open a terminal and run:

```bash
npx convex dev
```

This will:
- Create a new Convex project (if first time)
- Generate the database schema
- Watch for file changes
- Automatically update `.env.local` with deployment URL

**Important:** Keep this terminal running!

### 4. Start Next.js Frontend

Open a **new terminal** and run:

```bash
cd apps/web
npm run dev
```

### 5. Open Your Browser

Navigate to:
```
http://localhost:3000
```

## First Steps in the App

### 1. Create an Account
- Click "Sign Up"
- Enter your name, email, and password
- Click "Sign Up"

### 2. Create Your First Task
- Click "New Task"
- Enter a task title
- Click "Create"

### 3. Manage Tasks
- Click the circle icon to mark tasks complete
- Click the trash icon to delete tasks
- Use the filter buttons to view tasks by status

## Optional: AI Assistant Setup

To enable the AI assistant feature:

1. Get an API key:
   - **Anthropic Claude:** https://console.anthropic.com/
   - **OpenAI:** https://platform.openai.com/

2. Add to `.env.local`:
   ```bash
   # For Claude (recommended)
   ANTHROPIC_API_KEY=your_key_here

   # OR for OpenAI
   OPENAI_API_KEY=your_key_here
   ```

3. Restart the Convex dev server

## Project Structure

```
├── convex/              # Backend (Convex functions)
│   ├── db/             # Database layer (CRUD operations)
│   ├── endpoints/      # Business logic endpoints
│   ├── helpers/        # Utility functions
│   └── schema.ts       # Database schema
├── apps/web/           # Frontend (Next.js)
│   ├── app/           # Pages and layouts
│   ├── components/    # React components
│   └── lib/           # Client utilities
└── packages/           # Shared design system
    ├── design-tokens/ # Theme configuration
    └── components/    # Reusable UI components
```

## Development Commands

```bash
# Start both backend and frontend
npm run dev

# Start only backend
npx convex dev

# Start only frontend
cd apps/web && npm run dev

# Build for production
npm run build

# Run Storybook (view components)
npm run storybook
```

## Troubleshooting

### "Not authenticated" error
- Make sure you've signed up/in
- Check that Better Auth is configured in `.env.local`
- Refresh the page

### Tasks not appearing
- Check the Convex dev terminal for errors
- Verify the database schema is deployed
- Check browser console for errors

### Rate limit errors
- Wait a minute and try again
- Rate limits are configured in `convex/rateLimiter.ts`

### Port already in use
```bash
# Next.js (default 3000)
cd apps/web && npm run dev -- -p 3001

# Storybook (default 6006)
npm run storybook -- -p 6007
```

## Architecture Highlights

This app follows the **four-layer Convex architecture**:

1. **Database Layer** (`convex/db/`)
   - Only place where `ctx.db` is used
   - Pure CRUD operations

2. **Endpoint Layer** (`convex/endpoints/`)
   - Business logic
   - Authentication & authorization
   - Rate limiting

3. **Helper Layer** (`convex/helpers/`)
   - Pure utility functions
   - Input validation

4. **Frontend** (`apps/web/`)
   - Next.js 15 App Router
   - Real-time updates via Convex
   - Shared design system

## Next Steps

- **Customize the theme:** Edit `planning/theme.json`
- **Add more features:** Create new endpoints in `convex/endpoints/`
- **Deploy to production:** See `README.md` for deployment guide
- **Enable AI assistant:** Add API keys to `.env.local`

## Getting Help

- **Convex Docs:** https://docs.convex.dev
- **Better Auth Docs:** https://better-auth.com
- **Next.js Docs:** https://nextjs.org/docs

## Common Tasks

### Add a new field to tasks

1. Update schema in `convex/schema.ts`
2. Update database functions in `convex/db/tasks.ts`
3. Update endpoint validators in `convex/endpoints/tasks.ts`
4. Update frontend UI in `apps/web/components/task-list.tsx`

### Add a new endpoint

1. Create file in `convex/endpoints/`
2. Import and use database layer functions
3. Add authentication check
4. Add rate limiting to mutations
5. Use in frontend with `useQuery` or `useMutation`

### Change rate limits

Edit `convex/rateLimiter.ts` and restart Convex dev server.

---

**Happy task managing! 🚀**
