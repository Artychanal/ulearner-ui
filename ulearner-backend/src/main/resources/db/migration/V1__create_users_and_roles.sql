CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE users (
    id                       BIGSERIAL PRIMARY KEY,
    username                 VARCHAR(100) NOT NULL UNIQUE,
    password                 VARCHAR(255) NOT NULL,
    email                    VARCHAR(255) UNIQUE,
    enabled                  BOOLEAN      NOT NULL DEFAULT TRUE,
    account_non_expired      BOOLEAN      NOT NULL DEFAULT TRUE,
    account_non_locked       BOOLEAN      NOT NULL DEFAULT TRUE,
    credentials_non_expired  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_users_email ON users (email);
