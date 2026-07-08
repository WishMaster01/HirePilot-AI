# HirePilot AI

> An AI-powered career intelligence and placement preparation SaaS platform.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

HirePilot AI combines career analysis, resume optimization, job matching, interview preparation, DSA coaching, portfolio analysis, placement tracking, mentorship, gamification, and administrative analytics in one platform.

**Live application:** [hire-pilot-ai-murex.vercel.app](https://hire-pilot-ai-murex.vercel.app)

---

## Table of Contents

- [Platform Overview](#platform-overview)
- [Product Suites](#product-suites)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [API Overview](#api-overview)
- [Authentication and Authorization](#authentication-and-authorization)
- [Admin Console](#admin-console)
- [AI Providers](#ai-providers)
- [Payments](#payments)
- [Deployment](#deployment)
- [Security](#security)
- [Quality Checks](#quality-checks)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Platform Overview

HirePilot AI provides candidates with a unified workspace for measuring and improving career readiness.

The platform combines:

- AI-generated recommendations and feedback
- Deterministic scoring algorithms
- Persistent PostgreSQL-backed user data
- Role-based administrative controls
- Subscription and AI credit management
- Career progress and placement analytics
- Modular frontend product suites

---

## Product Suites

| Suite | Capabilities |
|---|---|
| 🧭 Career Intelligence | Career profiles, career DNA scoring, skill-gap analysis, employability scoring, recommended roles |
| 📄 Resume Intelligence | Resume builder, uploads, ATS scoring, rewriting, keyword optimization, gap analysis |
| 💼 Job & Placement | Job matching, placement tracking, company preparation, application management |
| 🎙️ Interview Preparation | AI mock interviews, HR and technical interviews, behavioral practice, video analysis |
| 💻 Coding & DSA | DSA assessments, coding challenges, AI code review, complexity and weak-topic analysis |
| 🌐 Portfolio Branding | GitHub project analysis, LinkedIn optimization, portfolio recommendations |
| 🤖 AI Mentor | Career chatbot, roadmap generation, learning plans and daily recommendations |
| 👥 Community | Discussions, peer interviews, experiences, comments and reactions |
| 🏆 Gamification | XP, badges, streaks, achievements, levels and leaderboards |
| 💳 Billing | Plans, AI credits, Razorpay payments and usage history |
| ✅ Productivity | Daily goals, notifications, reminders, deadlines and reports |
| 🛡️ Administration | User management, analytics, reports, moderation and system health |

---

## Architecture

```mermaid
flowchart LR
    U[User] --> C[React Client]
    A[Administrator] --> AC[Admin Console]

    C --> API[Express REST API]
    AC --> API

    API --> AUTH[Authentication and RBAC]
    API --> AI[AI Provider Layer]
    API --> ALGO[Scoring Algorithms]
    API --> DB[(PostgreSQL)]
    API --> PAY[Razorpay]
    AUTH --> FIREBASE[Firebase Authentication]
    AI --> GEMINI[Google Gemini]
    AI --> OPENROUTER[OpenRouter]

    DB --> PRISMA[Prisma ORM]
```

### Backend Design

The backend follows a feature-module architecture:

```text
Route -> Middleware -> Controller -> Service/Algorithm -> Prisma -> PostgreSQL
```

Cross-cutting responsibilities include:

- Authentication
- Role-based authorization
- Request validation
- File upload validation
- Rate limiting
- AI usage controls
- Centralized error handling
- Security headers
- CORS enforcement

---

## Technology Stack

### Frontend

- React 19
- React Router
- Redux Toolkit
- Vite
- Tailwind CSS
- Axios
- Recharts
- Motion
- Firebase Client SDK
- jsPDF
- React Icons

### Backend

- Node.js
- Express 5
- Prisma ORM
- PostgreSQL
- Zod
- JSON Web Tokens
- HTTP-only cookies
- Helmet
- Express Rate Limit
- Multer
- Firebase authentication
- Gemini and OpenRouter integrations
- Razorpay Orders API

### Infrastructure

- Vercel for frontend hosting
- Neon or another managed PostgreSQL provider
- External Node.js hosting for the backend API
- Environment-based configuration

---

## Repository Structure

```text
HirePilot-AI/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── admin/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── data/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── ai/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   ├── services/
│   │   ├── shared/
│   │   │   └── algorithms/
│   │   ├── app.js
│   │   ├── routes.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── docs/
├── README.md
└── vercel.json
```

---

## Getting Started

### Prerequisites

Install or configure:

- Node.js 20 or later
- npm
- PostgreSQL or Neon
- Firebase project
- Gemini or OpenRouter API credentials
- Razorpay account for payment features

### Installation

```bash
git clone https://github.com/<your-github-username>/HirePilot-AI.git
cd HirePilot-AI
```

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

---

## Environment Configuration

Create local environment files from the examples.

### Windows

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

### macOS or Linux

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Server Environment

```env
NODE_ENV=development
PORT=8000

DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

FRONTEND_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173"

JWT_SECRET="replace_with_a_long_random_secret"
JWT_EXPIRES_IN="7d"
COOKIE_SECRET="replace_with_a_cookie_secret"

FIREBASE_WEB_API_KEY="your_firebase_web_api_key"

AI_PROVIDER="gemini"
GEMINI_API_KEY="your_gemini_api_key"
GEMINI_MODEL="gemini-1.5-flash"

OPENROUTER_API_KEY="your_openrouter_api_key"
OPENROUTER_MODEL="your_openrouter_model"
OPENROUTER_SITE_URL="http://localhost:5173"
OPENROUTER_APP_NAME="HirePilot AI"

RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AI_RATE_LIMIT_WINDOW_MS=900000
AI_RATE_LIMIT_MAX=20
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10

MAX_FILE_SIZE_MB=10
MAX_VIDEO_SIZE_MB=100
```

### Client Environment

```env
VITE_API_BASE_URL="http://localhost:8000"
VITE_APP_NAME="HirePilot AI"

VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_firebase_app_id"
```

> Variables beginning with `VITE_` are included in the browser bundle. Never store private credentials or production secrets in them.

---

## Database Setup

Generate the Prisma client:

```bash
cd server
npm run prisma:generate
```

Apply existing migrations:

```bash
npm run prisma:deploy
```

For local schema development:

```bash
npm run prisma:migrate
```

Open Prisma Studio when database inspection is required:

```bash
npx prisma studio
```

---

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

Default addresses:

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:8000` |
| API base path | `http://localhost:8000/api` |

---

## API Overview

All application endpoints are exposed under `/api`.

| Domain | Example endpoints |
|---|---|
| Authentication | `/api/auth/google`, `/api/auth/login`, `/api/auth/register` |
| Users | `/api/users/me`, `/api/users/profile` |
| Career | `/api/career-profile`, `/api/career-profile/analyze` |
| Resumes | `/api/resumes`, `/api/resumes/:id/analyze` |
| Jobs | `/api/job-matches/analyze`, `/api/job-matches` |
| Interviews | `/api/interviews`, `/api/interviews/:id/feedback` |
| Video analysis | `/api/video-analysis` |
| Roadmaps | `/api/roadmaps/generate`, `/api/roadmaps/:id/progress` |
| DSA | `/api/dsa/problems`, `/api/dsa/assessment` |
| Projects | `/api/projects/analyze` |
| LinkedIn | `/api/linkedin/analyze` |
| Placements | `/api/placements`, `/api/placements/report` |
| Mentor | `/api/mentor/chat`, `/api/mentor/sessions` |
| Community | `/api/community/posts` |
| Gamification | `/api/gamification/stats` |
| Notifications | `/api/notifications` |
| Billing | `/api/payment/order`, `/api/payment/verify` |
| Administration | `/api/admin/users`, `/api/admin/analytics` |

### API Response Principles

The API uses:

- Appropriate HTTP status codes
- Centralized error handling
- Structured JSON responses
- Zod request validation
- Authentication and authorization middleware
- Rate limits for general, authentication and AI requests

---

## Authentication and Authorization

HirePilot AI supports:

- Firebase Google authentication
- Email and password compatibility routes
- JWT-based sessions
- HTTP-only authentication cookies
- Prisma-backed user identities
- `USER` and `ADMIN` roles

Protected requests must include the authentication cookie:

```javascript
axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});
```

### Authorization Levels

| Role | Access |
|---|---|
| `USER` | Personal suites, interviews, analytics and account data |
| `ADMIN` | User management, platform analytics, reports and moderation |

---

## Admin Console

Frontend routes:

```text
/admin
/admin-dashboard
```

Backend administration endpoints:

```text
GET    /api/admin/users
GET    /api/admin/analytics
GET    /api/admin/interviews
GET    /api/admin/reports
PATCH  /api/admin/users/:id/role
DELETE /api/admin/users/:id
```

Additional operational endpoints include:

```text
GET /api/admin/ai-usage
GET /api/admin/revenue
GET /api/admin/system-health
GET /api/admin/content-moderation
```

Backend administration requests require:

1. A valid authentication cookie
2. A corresponding active Prisma user
3. The `ADMIN` database role

### Production Warning

A frontend environment-variable login must not be treated as production security. `VITE_` values are visible to browser users.

Production admin access must be enforced by backend authentication and role authorization.

---

## AI Providers

The platform supports multiple AI providers through a provider abstraction.

### Gemini

```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="your_key"
GEMINI_MODEL="gemini-1.5-flash"
```

### OpenRouter

```env
AI_PROVIDER="openrouter"
OPENROUTER_API_KEY="your_key"
OPENROUTER_MODEL="your_model"
```

When provider credentials are unavailable, supported features may use deterministic fallbacks or return a controlled error.

---

## Deterministic Algorithms

Reusable scoring and analysis logic is maintained in:

```text
server/src/shared/algorithms/
```

The algorithm layer supports:

- Career readiness scoring
- Employability scoring
- Skill-gap detection
- ATS keyword matching
- Cosine and Jaccard similarity
- Job-match ranking
- Interview progress calculation
- Communication metrics
- Roadmap graph traversal
- DSA weak-topic detection
- Complexity classification
- Project structure analysis
- Placement funnel analytics
- Gamification calculations
- Notification priority ranking
- Administrative KPI aggregation
- Security risk scoring

Separating deterministic logic from AI output improves predictability, testability and explainability.

---

## Payments

HirePilot AI uses Razorpay for subscription and credit purchases.

### Payment Flow

1. The client requests an order.
2. The backend creates a Razorpay order.
3. Razorpay Checkout collects payment.
4. The client sends payment identifiers to the backend.
5. The backend verifies the Razorpay signature.
6. Credits and subscription status are updated.

Never verify payment signatures on the client.

Production deployments should configure Razorpay webhooks for reconciliation, refunds, missed callbacks and delayed payment events.

---

## Deployment

### Frontend

The React application can be deployed to Vercel.

Build configuration:

```bash
cd client
npm install
npm run build
```

Output directory:

```text
client/dist
```

The repository includes SPA rewrites so routes such as `/admin-dashboard` resolve to `index.html`.

### Backend

Deploy the Node.js server to a platform that supports:

- Persistent Node.js processes
- HTTPS
- Environment variables
- Outbound database and AI-provider access
- Secure cookies
- File upload limits

Before starting a production backend:

```bash
npm install
npm run prisma:deploy
npm run start
```

### Production Checklist

- Configure the production database
- Configure all backend secrets
- Restrict `ALLOWED_ORIGINS`
- Set `NODE_ENV=production`
- Use HTTPS
- Configure secure cookie behavior
- Run Prisma migrations
- Create authorized admin users
- Configure Razorpay webhooks
- Configure application monitoring
- Verify frontend SPA rewrites
- Test authentication across deployed domains

---

## Security

Implemented security controls include:

- HTTP-only JWT cookies
- Role-based authorization
- Helmet security headers
- CORS origin restrictions
- Request rate limiting
- Dedicated AI and authentication limits
- Zod payload validation
- File type and size restrictions
- Prisma parameterized database queries
- Centralized error responses
- Active-user verification
- Server-side payment signature verification

### Security Requirements

- Never commit `.env` files
- Rotate exposed credentials immediately
- Use secrets of at least 32 random characters
- Restrict production CORS origins
- Keep database credentials server-side
- Do not store admin passwords in client environment variables
- Audit destructive admin operations
- Apply dependency and database updates regularly

---

## Available Scripts

### Client

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Create a production bundle |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production bundle |

### Server

| Command | Purpose |
|---|---|
| `npm run dev` | Start the server with Nodemon |
| `npm run start` | Start the production server |
| `npm run build` | Generate the Prisma client |
| `npm run lint` | Validate server entry syntax |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Create and apply local migrations |
| `npm run prisma:deploy` | Apply production migrations |

---

## Quality Checks

Run these checks before opening a pull request or deploying.

### Backend

```bash
cd server
npm run lint
npm run build
npx prisma validate
```

### Frontend

```bash
cd client
npm run lint
npm run build
```

Recommended production additions:

- Unit tests for deterministic algorithms
- Controller and middleware integration tests
- API contract tests
- End-to-end browser tests
- Automated dependency scanning
- CI enforcement for linting and builds

---

## Troubleshooting

### Client routes return 404 after deployment

Ensure the deployment contains an SPA rewrite:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Admin APIs return `401`

Confirm that:

- The user is authenticated
- Cookies are included with requests
- Frontend and backend cookie settings support their deployed domains

### Admin APIs return `403`

Confirm the authenticated Prisma user has:

```text
role = ADMIN
```

### CORS errors

Add the exact frontend origin to `ALLOWED_ORIGINS`. Do not include route paths.

### Prisma generation fails on Windows

Stop active Node.js processes that may be locking the Prisma engine, then run:

```bash
npm run prisma:generate
```

### AI features fail

Check:

- `AI_PROVIDER`
- Provider API key
- Selected model availability
- Provider quota and rate limits
- Server logs

### Payments fail

Verify that the Razorpay key ID and secret belong to the same mode, either test or live.

---

## Contributing

1. Create a feature branch.
2. Keep changes scoped to one responsibility.
3. Follow the existing module architecture.
4. Add validation for new API inputs.
5. Add or update tests where applicable.
6. Run frontend and backend quality checks.
7. Submit a pull request with a clear technical summary.

Example:

```bash
git checkout -b feature/career-readiness-report
git commit -m "feat: add career readiness report"
git push origin feature/career-readiness-report
```

---

## Project Status

HirePilot AI is under active development.

Some integrations require external credentials and production infrastructure. Validate authentication, AI provider behavior, payment processing and administrative authorization before using the platform with real user data.

---

## License

No public license is granted unless a separate `LICENSE` file is included in the repository.

Copyright © 2026 HirePilot AI. All rights reserved.
