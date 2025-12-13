# 🎓 LexaFlow

**LexaFlow** is a modern English learning application with AI-powered exercises, structured courses, and gamification features.

![LexaFlow](https://img.shields.io/badge/version-1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Fastify](https://img.shields.io/badge/Fastify-4.24-green)

## ✨ Features

- 🤖 **AI-Powered Exercises** - Generate exercises with LLaMA 3.1 via Groq
- 📚 **Structured Courses** - Grammar, conjugation, and vocabulary lessons
- 🎯 **Placement Test** - 25-question test to determine CEFR level (A1-C2)
- 🔥 **Streaks & Badges** - Gamification to keep learners motivated
- 📊 **Progress Tracking** - Detailed analytics and weak area identification
- 🔐 **Secure Auth** - JWT + 2FA with recovery codes
- 📱 **PWA** - Install on any device, works offline
- ♿ **Accessible** - WCAG 2.2 compliant
- 🇪🇺 **GDPR Compliant** - Data export, deletion, and consent management

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 14, TypeScript, React Query, Zustand |
| Backend | Fastify, TypeScript, Prisma ORM |
| Database | PostgreSQL (Render) |
| Cache | Redis (Upstash) |
| AI | Groq (LLaMA 3.1-70b-versatile) |
| Email | Brevo |
| Auth | JWT + TOTP 2FA + Google OAuth |
| Hosting | Netlify (Frontend), Render (Backend) |
| CI/CD | GitHub Actions |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Upstash)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lexaflow.git
cd lexaflow

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start Docker services (PostgreSQL + Redis)
docker-compose up -d

# Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate

# Seed the database
pnpm db:seed

# Start development servers
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Required
DATABASE_URL="postgresql://lexaflow:lexaflow_dev@localhost:5432/lexaflow"
JWT_SECRET="your-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
PASSWORD_PEPPER="your-pepper-min-16-chars"

# Optional (for AI features)
GROQ_API_KEY="your-groq-api-key"

# Optional (for production)
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
BREVO_API_KEY="your-brevo-key"
```

## 📁 Project Structure

```
lexaflow/
├── apps/
│   ├── backend/         # Fastify API server
│   │   ├── prisma/      # Database schema and migrations
│   │   └── src/
│   │       ├── config/  # Environment, database, Redis
│   │       ├── middleware/
│   │       ├── routes/  # API routes
│   │       ├── schemas/ # Zod validation schemas
│   │       ├── services/# Email, AI services
│   │       └── utils/   # Helpers, security
│   └── frontend/        # Next.js PWA
│       ├── app/         # App router pages
│       ├── components/  # React components
│       ├── hooks/       # Custom hooks
│       ├── lib/         # API client, utilities
│       └── styles/      # CSS design system
├── .github/workflows/   # CI/CD pipelines
├── docker-compose.yml   # Local development setup
└── package.json         # Workspace root
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/2fa/setup` | Setup 2FA |
| POST | `/api/auth/2fa/verify` | Enable 2FA |

### Exercises
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exercises/types` | List exercise types |
| POST | `/api/exercises/generate` | Generate AI exercise |
| POST | `/api/exercises/submit` | Submit answers |
| GET | `/api/exercises/history` | Get history |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List courses |
| GET | `/api/courses/:id` | Get course details |
| POST | `/api/courses/:id/progress` | Update progress |
| GET | `/api/courses/placement-test` | Get placement test |

Full API documentation available at `/docs` when running the backend.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test:unit

# Run API tests
pnpm test:api

# Run E2E tests
pnpm test:e2e
```

## 🚢 Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd apps/backend && pnpm install && pnpm build`
4. Set start command: `cd apps/backend && pnpm start`
5. Add environment variables

### Frontend (Netlify)

1. Create a new site on Netlify
2. Connect your GitHub repository
3. Set build command: `pnpm --filter frontend build`
4. Set publish directory: `apps/frontend/.next`
5. Add environment variables

### Database (Render PostgreSQL)

1. Create a PostgreSQL database on Render
2. Copy the connection URL to `DATABASE_URL`
3. Run migrations: `pnpm db:migrate`

## 🔒 Security

- Passwords hashed with bcrypt + pepper
- JWT access tokens (15min) + refresh tokens (7 days)
- TOTP-based 2FA with recovery codes
- Rate limiting on all endpoints
- Input validation with Zod
- CORS and Helmet security headers
- GDPR-compliant data handling

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

---

Built with ❤️ for English learners everywhere.
