# AI MCP Agent Frontend

A modern Next.js frontend for the AI MCP Agent Backend, featuring ChatGPT-like interface with streaming chat, session management, MCP server configuration, and LLM settings.

## Features

- 💬 **Streaming Chat**: Real-time character-by-character streaming responses
- 🧭 **Session Management**: Create, switch, and delete conversation sessions
- ⚙️ **Settings Panel**: Configure MCP servers and LLM settings
- 🔍 **Dual Modes**: Switch between Agent mode (with tools) and RAG mode
- 📊 **Health Monitoring**: Real-time backend health status
- 🎨 **Modern UI**: ChatGPT-inspired design with dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running at `http://localhost:8000` (or configure via `NEXT_PUBLIC_API_BASE_URL`)

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Environment Variables

Create a `.env.local` file (optional):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

If not set, defaults to `http://localhost:8000`.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: TailwindCSS v4
- **State Management**: Zustand
- **HTTP Client**: Fetch API
- **SSE Streaming**: EventSource API
- **Markdown**: react-markdown
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
