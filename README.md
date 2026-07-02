# HirePilot-AI

HirePilot-AI is a full-stack AI career development platform for resume improvement, mock interviews, DSA practice, roadmap planning, placement tracking, mentor support, community engagement, payments, and admin analytics.

The project is built as a modern React + Express SaaS application backed by PostgreSQL/Neon through Prisma.

## Core Features

- AI mock interviews with voice/video-style interview flow, reports, scoring, and history.
- Resume AI tools for resume creation, ATS checks, keyword optimization, and rewrite support.
- Career profile analysis with deterministic scoring and AI-generated insights.
- Job matching based on skills, projects, role fit, and weighted ranking.
- Contextual interview assistant using resume, LinkedIn, GitHub, and technical profile inputs.
- Roadmap generator with prerequisite-aware learning path logic.
- DSA coach with topic scoring, weak topic detection, complexity classification, and review support.
- Project analyzer for GitHub/project structure, architecture quality, missing files, and resume value.
- LinkedIn optimizer for recruiter visibility and keyword gaps.
- Placement tracker with funnel analytics and success probability.
- Mentor chatbot with ranked context selection.
- Community, gamification, notifications, and admin analytics.
- Razorpay payment flow for plan credits.
- Firebase Google authentication support.

## Tech Stack

**Frontend**

- React 19
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- Firebase client SDK
- Razorpay Checkout
- jsPDF, Recharts, Motion

**Backend**

- Node.js
- Express
- Prisma ORM
- PostgreSQL/Neon
- JWT cookies
- Firebase token verification
- Gemini/OpenRouter AI providers
- Razorpay Orders API
- Zod validation

## Repository Structure

```text
HirePilot-AI/
  client/
    src/
      admin/
      assets/
      components/
      constants/
      context/
      data/
      features/
      hooks/
      pages/
      routes/
      services/
      styles/
  server/
    prisma/
      schema.prisma
      seed.js
    src/
      ai/
      config/
      middlewares/
      modules/
      services/
      shared/
        algorithms/
      app.js
      routes.js
      server.js
  docs/
```

## Prerequisites

- Node.js 20+
- npm
- A PostgreSQL database, preferably Neon
- Firebase project with Google sign-in enabled
- Gemini or OpenRouter API key
- Razorpay account and API keys

## Environment Setup

Create environment files from the examples:

```bash
cd server
copy .env.example .env

cd ../client
copy .env.example .env
```

On macOS/Linux, use `cp` instead of `copy`.

### Server Environment

Required for normal development:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB_NAME?sslmode=require"
PORT=8000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173"

JWT_SECRET="use_a_long_secure_secret"
JWT_EXPIRES_IN="7d"
COOKIE_SECRET="use_a_cookie_secret"

FIREBASE_WEB_API_KEY="your_firebase_web_api_key"

AI_PROVIDER="gemini"
GEMINI_API_KEY="your_gemini_api_key"

RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

OpenRouter can be used instead of Gemini by setting:

```env
AI_PROVIDER="openrouter"
OPENROUTER_API_KEY="your_openrouter_api_key"
OPENROUTER_MODEL="deepseek/deepseek-r1:free"
```

### Client Environment

```env
VITE_API_BASE_URL="http://localhost:8000"
VITE_APP_NAME="HirePilot AI"
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_firebase_app_id"
```

## Installation

Install dependencies separately in the client and server apps:

```bash
cd server
npm install

cd ../client
npm install
```

## Database Setup

Generate Prisma client:

```bash
cd server
npm run prisma:generate
```

Apply schema changes to your database:

```bash
npm run prisma:deploy
```

For local iterative schema work, use:

```bash
npm run prisma:migrate
```

## Running Locally

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## Scripts

### Client

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Server

```bash
npm run dev
npm run start
npm run build
npm run lint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
```

## API Modules

The backend is organized around feature modules under `server/src/modules`:

- `auth`
- `users`
- `careerProfile`
- `resumeAI`
- `jobMatching`
- `interviews`
- `contextualInterview`
- `videoAnalysis`
- `roadmaps`
- `dsaCoach`
- `projectAnalyzer`
- `linkedinOptimizer`
- `placementTracker`
- `mentorChat`
- `community`
- `gamification`
- `notifications`
- `billing`
- `admin`

Routes are registered centrally from `server/src/routes.js`.

## Algorithm Layer

Reusable deterministic algorithms live in:

```text
server/src/shared/algorithms/
```

These algorithms support product features such as:

- weighted career and employability scoring
- resume keyword matching and ATS scoring
- cosine and Jaccard similarity
- job ranking
- adaptive interview progress
- video communication metrics
- roadmap graph traversal
- DSA weak topic detection
- project tree analysis
- placement funnel analytics
- notification priority ranking
- gamification XP and level calculation
- admin KPI aggregation
- auth/security risk scoring

AI output and deterministic algorithm output are kept separate where possible, so the product can combine AI insight with predictable scoring.

## Payments

HirePilot-AI uses Razorpay Orders API for checkout.

Current flow:

1. The client requests an order from `POST /api/payment/order`.
2. The backend creates a Razorpay order.
3. The client opens Razorpay Checkout.
4. The client sends Razorpay payment details to `POST /api/payment/verify`.
5. The backend verifies the signature, marks payment as paid, adds credits, and activates the subscription.

Razorpay webhooks are optional for initial setup. The app verifies payments through the checkout callback. Add webhooks later for production reconciliation, refunds, missed browser callbacks, delayed payment states, or audit logging.

## Authentication

Authentication uses:

- Firebase Google sign-in on the client
- Firebase token lookup on the server
- JWT stored in an HTTP-only cookie
- Prisma-backed user records and role checks

Admin routes require authenticated users with the `ADMIN` role.

## Quality Checks

Run before pushing changes:

```bash
cd server
npm run lint
npm run build
npx prisma validate

cd ../client
npm run lint
npm run build
```

On Windows, Prisma generate can fail if a running Node process locks the Prisma query engine DLL. Stop running server processes and rerun `npm run build` in `server`.

## Deployment Notes

- Use Neon or another managed PostgreSQL provider for the database.
- Set `DATABASE_URL`, auth secrets, AI provider keys, Firebase keys, and Razorpay keys in the hosting environment.
- Set `FRONTEND_URL` and `ALLOWED_ORIGINS` to the deployed frontend domain.
- Build the client with `npm run build`.
- Run Prisma deploy on the server before starting production.
- Do not commit `.env` files or real credentials.

## Security Notes

- Keep JWT, cookie, AI, Firebase, Razorpay, and database credentials private.
- Use HTTPS in production.
- Use strong secrets with at least 32 characters.
- Keep `ALLOWED_ORIGINS` restricted to trusted frontend domains.
- Review admin access before production use.
