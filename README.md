# ULearner Platform

ULearner is a learning management platform that combines a Next.js frontend (`ulearner-ui`) with a Spring Boot backend (`ulearner-backend`). This repository contains both applications as well as infrastructure for automated testing, API documentation, and database migrations.

## Architecture Overview

- **Frontend (Next.js 14)** – Provides the web experience for learners and instructors. The app lives in the repository root and can be started with `npm run dev`.
- **Backend (Spring Boot 3)** – Exposes REST APIs for authentication, course management, enrollments, and progress tracking. The service resides in `ulearner-backend` and follows a layered architecture (controller → service → repository) with MapStruct DTO mappers.
- **Database** – PostgreSQL in production with Flyway migrations. Tests run against an in-memory H2 database configured in PostgreSQL compatibility mode.
- **Security** – JWT-based stateless authentication with refresh-token rotation and role-based authorization.

A more detailed rationale for the testing and documentation stack is captured in [`docs/adr/0001-testing-and-documentation.md`](docs/adr/0001-testing-and-documentation.md).

## Backend Highlights

### Modules

- `controller` – REST endpoints for authentication, catalog browsing, course management, user profiles, and progress tracking.
- `service` – Business logic split into auth, course, enrollment, refresh token, and user services.
- `repository` – Spring Data JPA repositories that encapsulate persistence for users, roles, courses, lessons, enrollments, and refresh tokens.
- `security` – JWT token validation, authentication filter, and security configuration with endpoint whitelisting.
- `mapper` – MapStruct mappers used to translate between entities and DTOs.

### Authentication Scenarios

| Scenario | Endpoint | Description |
| --- | --- | --- |
| User registration | `POST /api/auth/register` | Creates a new user, assigns roles, returns access & refresh tokens.
| Login | `POST /api/auth/login` | Authenticates via email/password and issues token pair.
| Token refresh | `POST /api/auth/refresh` | Validates refresh token, rotates stored token, and issues new pair.
| Logout | `POST /api/auth/logout` | Revokes an active refresh token.

Refresh tokens are stored server-side and rotated on every refresh call. Accounts with a status other than `ACTIVE` are prevented from logging in.

### Error Model

The `GlobalExceptionHandler` converts exceptions into the following HTTP status codes:

- `409 CONFLICT` – Duplicate registration attempts, already-enrolled students, etc.
- `401 UNAUTHORIZED` – Invalid credentials or refresh tokens.
- `403 FORBIDDEN` – Blocked or inactive accounts attempting access.
- `404 NOT FOUND` – Missing resources such as courses, instructors, or enrollments.
- `422 UNPROCESSABLE ENTITY` – Bean validation failures with field-level error details.
- `500 INTERNAL SERVER ERROR` – Any unexpected errors.

All error responses use the `ErrorResponse` DTO with a consistent shape: `{ status, message, details }`.

### Database Migrations

Flyway migrations live in `ulearner-backend/src/main/resources/db/migration` and currently include:

1. `V1__create_users_and_roles.sql` – Creates user and role tables plus join table.
2. `V2__create_refresh_tokens.sql` – Adds persistent refresh-token storage.

When running with the `test` profile the database is initialized in-memory via H2 (`application-test.yml` disables Flyway and auto-creates schema for fast tests).

## Testing Strategy

The backend includes a comprehensive automated test suite:

- **Unit tests (JUnit 5 + Mockito)** cover core services such as `AuthServiceImpl`, `CourseServiceImpl`, and `EnrollmentServiceImpl`.
- **Repository tests (@DataJpaTest)** verify custom queries for user, course, and enrollment repositories against the H2 database.
- **Integration tests (SpringBootTest + MockMvc)** exercise REST controllers end-to-end, ensuring serialization, mappings, and persistence interactions function correctly.

Run the full backend suite with:

```bash
cd ulearner-backend
./mvnw test
```

The test profile automatically uses H2; no additional infrastructure is required. Frontend tests (if added) can be executed with `npm test` from the repository root.

## API Documentation

The backend exposes an interactive Swagger UI powered by `springdoc-openapi`. When the Spring Boot application is running, navigate to `http://localhost:8080/swagger-ui.html` to inspect and manually execute endpoints. OpenAPI documents are available under `/v3/api-docs`.

## Local Development

### Frontend

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with the UI during development.

### Backend

```bash
cd ulearner-backend
./mvnw spring-boot:run
```

The application uses the `application-dev.yml` profile by default; configure database credentials as needed. Health checks are exposed at `/actuator/health`.

---

For architecture decisions, operational notes, and future enhancements consult the documents in the [`docs`](docs) directory.
