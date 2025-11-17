# ULearner Platform

ULearner is a full‑stack learning platform powered by a **Next.js 16** frontend and a **NestJS** backend.  
Learners browse the catalog, enroll, and track progress; instructors author content; admins moderate data through an AdminJS panel with media uploads, stats, and moderation tools.  
The backend exposes REST APIs, handles authentication (including password resets via email), persists data in PostgreSQL, and streams media from local storage or uploaded assets.

---

## Tech stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Web frontend | Next.js 16, React 19, Bootstrap 5 | App directory, Suspense boundaries, client/server components, Intersection Observer animations, dynamic routes (`/courses/[id]`, `/dashboard/*`) |
| Backend API | NestJS 10, TypeORM, PostgreSQL | Modular architecture (auth, courses, enrollments, favorites, media, certificates, reviews, dashboard stats) |
| Auth & security | JWT access/refresh tokens, bcrypt | Refresh rotation, secure password reset links, AdminJS session guard |
| File uploads | AdminJS + custom media endpoints | Images & videos saved under `uploads/media` with signed URLs |
| Admin UI | AdminJS (Express adapter) | Courses, lessons, instructors, users, testimonials, course reviews, media, analytics dashboard |

### Repository layout

```
.
├── src/                    # Next.js app (frontend)
├── public/                 # Frontend assets
├── ulearner-backend/       # NestJS application
│   ├── src/
│   ├── uploads/            # Local media storage
│   └── .env                # Backend environment variables (not committed)
└── docs/                   # ADRs and supporting docs
```

---

## Key features

- **JWT auth + refresh rotation** and a branded password-reset flow (email link expires after 30 minutes and signs the user in after updating their password).
- **Modern onboarding**: login/signup pages with inline messages, “Forgot password?”, redirect after login via `?next=...`, and contextual CTA links to signup or back to login.
- **Catalog & discovery**: `/` landing page highlights hero course, testimonials, instructors, FAQ; `/courses/[id]` shows lessons, curriculum, media previews, testimonials and reviews.
- **Dashboard suites**:
  - `/dashboard/courses` – enrolled catalogue with progress bars, completion %
  - `/dashboard/favorites` – saved courses with removal actions
  - `/dashboard/profile` – edit avatar, bio, contact info
  - `/dashboard/certificates` – generated PDF certificates and shareable numbers
- **Learning flows**: Course detail page shows modules/lessons with text/video/quiz content; enrollments tracked via progress API; `Learn` layout (iframe-friendly) consumes modules.
- **AdminJS dashboard** at `/admin` with inline media previews, per-resource CRUD, course cover uploads, and a “Platform overview” stats widget.
- **Learner experience** that surfaces courses, testimonials, instructors, enrollments, and progress tracking.
- **Authoring tools** (Course editor, media uploads, modules/lessons, quizzes).
- **Certificates, reviews, favorites, and testimonial modules** to boost credibility.

---

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+
- (Optional) SMTP credentials for password-reset emails (Gmail app password, SendGrid, etc.)

### Install dependencies

```bash
npm install                     # frontend
cd ulearner-backend
npm install                     # backend
```

### Configure environment

1. Copy `ulearner-backend/.env.example` (or create `.env`) and populate it. An example with development defaults:

```
NODE_ENV=development
PORT=3001
APP_WEB_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000

ADMIN_EMAIL=admin@ulearner.dev
ADMIN_PASSWORD=change-me-now
ADMIN_COOKIE_NAME=ulearner_admin
ADMIN_COOKIE_SECRET=super-secret-admin-cookie

MAIL_FROM_EMAIL=notifications.ulearner@gmail.com
MAIL_FROM_NAME=ULearner
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=notifications.ulearner@gmail.com
SMTP_PASSWORD=*** app password ***

MEDIA_BASE_URL=http://localhost:3001
MEDIA_UPLOAD_DIR=uploads/media

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ulearner
POSTGRES_USER=potgress
POSTGRES_PASSWORD=29082006
```

2. Create the database and run migrations:

```bash
cd ulearner-backend
npm run db:migrate
```

### Run locally

Frontend:

```bash
npm run dev
# http://localhost:3000
```

Backend:

```bash
cd ulearner-backend
npm run start:dev
# http://localhost:3001/api/v1
```

Admin panel: http://localhost:3001/admin  
Login with the credentials set via `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

---

## Useful scripts

| Location | Command | Description |
| --- | --- | --- |
| root | `npm run dev` | Start Next.js frontend |
| root | `npm run lint` | Lint frontend code |
| `ulearner-backend` | `npm run start:dev` | Start NestJS server with hot reload |
| `ulearner-backend` | `npm run build` | Compile backend to `dist/` |
| `ulearner-backend` | `npm run db:migrate` | Run TypeORM migrations |
| `ulearner-backend` | `npm run lint` | Lint backend code |

---

## Password reset flow

1. User clicks **Forgot password?** on `/login`, enters their email, and receives a branded ULearner email (Nodemailer + SMTP).
2. The link points to `/reset-password?token=...`. Tokens are stored in `password_reset_tokens`, expire after 30 minutes, and are marked as used once redeemed.
3. After setting a new password, the user is automatically logged in (fresh JWT + refresh token issued).

Frontend screens involved:
- `/forgot-password` – simple form, success/error states, CTA back to login.
- `/reset-password?token=...` – validates token, enforces password confirmation, shows expired-state fallback with CTA to request again.

---

## Admin dashboard

- Visit `/admin` with your admin credentials.
- Upload course covers directly from the course edit view (files go through `/api/v1/admin/media`).
- Inspect learners, testimonials, reviews, and media assets.
- “Social proof” modules let moderators delete problematic entries.
- The landing dashboard shows platform stats (courses, lessons, users, enrollments, reviews, testimonials) fetched via `/api/v1/admin/stats`.

---

## Contributing

- Keep `.env` secrets local. Never commit SMTP passwords, API keys, or database credentials.
- Frontend uses the Next.js app router with ESLint enforcing `@next/next/no-img-element`; prefer `next/image` for new components.
- Backend modules should export DTOs, entities, and services; any schema change must include a new TypeORM migration.
- Follow the ESLint/Prettier rules enforced by `npm run lint`.
- When touching backend modules, ensure migrations are created for schema changes (`npm run typeorm migration:generate ...`).

For additional architectural decisions and ADRs see [`docs/`](docs). Feel free to open an issue or PR with improvements! 🚀
