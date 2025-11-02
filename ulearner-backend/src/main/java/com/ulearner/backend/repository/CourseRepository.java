package com.ulearner.backend.repository;

import com.ulearner.backend.domain.Course;
import com.ulearner.backend.domain.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructor(User instructor);
}
