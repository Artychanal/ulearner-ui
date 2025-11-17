# ADR 0001 – Testing & API Documentation for the TypeScript stack

## Status

Accepted – updated after the migration to Next.js + NestJS.

## Context

We rewrote ULearner from a Spring Boot monolith to a TypeScript stack.  
The new architecture (Next.js frontend + NestJS backend + AdminJS) changed how we test and document the platform:

- The backend now runs on NestJS with Jest tooling out of the box.
- The frontend uses the Next.js App Router, client/server components, and async data requirements.
- We need a fast feedback loop (unit + e2e tests) that works both locally and in CI without heavyweight Java tooling.
- The previous Swagger/OpenAPI setup was tied to Spring; we need a pragmatic replacement until we adopt Nest’s Swagger module.

## Decision

1. **Backend testing (NestJS)**
   - Use **Jest** as the single runner (`npm run test`, `test:watch`, `test:e2e`).
   - Unit tests mock repositories/services using `@nestjs/testing`.
   - Integration tests rely on **Supertest** against the Nest HTTP adapter with an in-memory or disposable Postgres database (via TypeORM migrations).
   - Goal: each module (auth, courses, enrollments, media, admin stats, etc.) exposes at least a happy-path + failure-path test per controller/service.

2. **Frontend testing (Next.js)**
   - Adopt **React Testing Library** for component logic and forms.
   - Use **Playwright** (or Cypress) for high-value flows (login, enrollment, password reset). For now we rely on ESLint + TypeScript + manual QA; automated suites will be added incrementally.
   - Keep fixtures in `src/test-utils` to share mocks across dashboard pages, catalog, and forms.

3. **API documentation**
   - Short term: maintain developer-facing docs in `README.md` + ADRs (this file) and keep request/response examples in the repository (e.g., `docs/http/*.http` or shared Insomnia collection).
   - Long term: integrate `@nestjs/swagger` to auto-generate OpenAPI from controllers once modules stabilize (auth, courses, enrollments, reviews, admin APIs). Each new module must include DTO decorators so the Swagger generator can emit accurate schemas.
   - Admin workflows are showcased via AdminJS itself; we document admin-specific endpoints (`/api/v1/admin/*`) alongside public APIs.

4. **Tooling & automation**
   - `npm run lint` (frontend) and `cd ulearner-backend && npm run lint` (backend) are required before merging.
   - CI will run `npm run test` for both apps once the suites provide value; until then we fail on lint/type errors to keep the gate strict.

## Consequences

- NestJS developers can run `npm run test` / `npm run test:e2e` locally or in CI without spinning up Java, and the tests mirror our real modules.
- Frontend contributors know the target stack for unit/e2e coverage and can bootstrap tests using Testing Library/Playwright conventions.
- Documentation currently lives in Markdown (README + ADRs) and AdminJS screens; when we add `@nestjs/swagger`, those docs will become interactive without rewriting controllers.
- The decision keeps the feedback loop fast while leaving a clear path toward richer, automated documentation and full-stack test coverage.
