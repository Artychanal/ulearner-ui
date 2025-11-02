CREATE TABLE courses (
    id             BIGSERIAL PRIMARY KEY,
    title          VARCHAR(200) NOT NULL,
    description    VARCHAR(2000),
    thumbnail_url  VARCHAR(500),
    created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    instructor_id  BIGINT NOT NULL REFERENCES users (id)
);

CREATE TABLE lessons (
    id         BIGSERIAL PRIMARY KEY,
    title      VARCHAR(200) NOT NULL,
    content    TEXT,
    position   INTEGER NOT NULL,
    course_id  BIGINT NOT NULL REFERENCES courses (id) ON DELETE CASCADE
);

CREATE TABLE enrollments (
    id           BIGSERIAL PRIMARY KEY,
    student_id   BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    course_id    BIGINT NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    status       VARCHAR(50) NOT NULL,
    enrolled_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_enrollments_student_course UNIQUE (student_id, course_id)
);

CREATE INDEX idx_lessons_course ON lessons (course_id);
CREATE INDEX idx_enrollments_course ON enrollments (course_id);
CREATE INDEX idx_enrollments_student ON enrollments (student_id);
