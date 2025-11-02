# ADR 0001 – Testing and API Documentation Stack

## Status

Accepted

## Context

The ULearner backend initially shipped without meaningful automated tests or API documentation. As the number of services (authentication, courses, enrollments) and custom repositories grew, manual verification became error-prone. We also needed a fast feedback loop that works in local environments and CI without requiring external infrastructure.

## Decision

1. **Testing Strategy**
   - Adopt JUnit 5 with Mockito for unit testing service classes. These tests focus on business rules and exception handling without touching the database.
   - Use Spring Boot's `@SpringBootTest` + MockMvc for lightweight integration tests that hit REST controllers end-to-end.
   - Cover persistence logic via `@DataJpaTest`, relying on Spring's slice testing to bootstrap repositories quickly.
   - Standardize on the existing H2 in-memory profile (`application-test.yml`) configured in PostgreSQL compatibility mode. This keeps the feedback loop fast while remaining faithful to production schemas.

2. **API Documentation**
   - Add the `springdoc-openapi` starter to auto-generate an OpenAPI 3 specification and serve Swagger UI at runtime.
   - Publish OpenAPI metadata (title, description, security scheme) via a dedicated configuration class so consumers can explore endpoints without digging through code.

## Consequences

- Developers can run `./mvnw test` locally or in CI to validate services, repositories, and controller contracts.
- Test isolation is maintained because each test uses the in-memory H2 database and disables Flyway migrations when the `test` profile is active.
- Consumers and QA engineers can browse and manually execute endpoints using Swagger UI, accelerating feedback during integration testing.
- Introducing additional modules will require keeping the documentation and tests in sync, but the tooling now makes that process straightforward.
