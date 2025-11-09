# uLearner Backend (NestJS)

A modular NestJS backend that mirrors the uLearner UI experience with PostgreSQL persistence, RESTful APIs, and clean domain boundaries.

## Tech stack

- **NestJS 10** with feature modules per domain (instructors, courses, testimonials)
- **TypeORM** for Postgres data access, migrations, and seed scripts
- **class-validator / class-transformer** for DTO validation
- **Jest + Supertest** scaffolding for unit/e2e tests

## Getting started

1. **Install dependencies**
   ```bash
   cd ulearner-backend
   npm install
   ```
2. **Provide environment variables**
   ```bash
   cp .env.example .env
   # adjust if your DB host/port differ
   ```
3. **Start PostgreSQL** (ships with the requested `potgress/29082006` superuser):
   ```bash
   docker compose up -d postgres
   ```
4. **Run database migrations and seed demo content**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
5. **Launch the API**
   ```bash
   npm run start:dev
   ```
   The service listens on `http://localhost:3001/api/v1` by default.

## API surface

| Resource | Endpoint | Description |
| --- | --- | --- |
| Courses | `GET /api/v1/courses` | Supports pagination plus `category`, `instructorId`, `search`, `minPrice`, `maxPrice` filters. |
|  | `POST /api/v1/courses` | Creates a course with nested lessons tied to an instructor. |
|  | `PATCH /api/v1/courses/:id` | Updates course fields, reorders lessons, or swaps instructors. |
|  | `DELETE /api/v1/courses/:id` | Removes a course and cascades lessons. |
|  | `POST /api/v1/courses/:id/lessons` | Adds a lesson to a course. |
|  | `PATCH /api/v1/courses/:courseId/lessons/:lessonId` | Mutates an existing lesson. |
|  | `DELETE /api/v1/courses/:courseId/lessons/:lessonId` | Deletes a single lesson. |
| Instructors | `GET /api/v1/instructors` | Lists instructors with their courses. |
|  | `POST /api/v1/instructors` | Creates a new instructor profile. |
| Testimonials | `GET /api/v1/testimonials` | Lists testimonials, optionally by course. |
|  | `POST /api/v1/testimonials` | Adds learner feedback linked to any course. |

All responses are wrapped by the `ResponseTransformInterceptor` to keep payloads consistent:

```json
{
  "success": true,
  "data": { /* payload */ }
}
```

Errors are formatted by `HttpExceptionFilter` as:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Course ... was not found",
  "path": "/api/v1/courses/...",
  "timestamp": "..."
}
```

## Project layout

```
src/
 ├─ common/          # shared DTOs, filters, interceptors, middleware
 ├─ config/          # configuration + Joi validation
 ├─ courses/         # course module with nested lesson operations
 ├─ instructors/     # instructors module
 ├─ testimonials/    # testimonials module
 └─ database/        # migrations + seed script
```

## Local tips

- Update `.env` to point the frontend to this backend via `NEXT_PUBLIC_API_URL` if needed and set `CORS_ALLOWED_ORIGINS` if your UI runs on a different host/port.
- The `db:revert` script rolls back the latest migration.
- Extend the architecture with auth/roles by adding new modules and wiring them through `AppModule`.
