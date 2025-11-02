package com.ulearner.backend.repository;

import com.ulearner.backend.domain.Course;
import com.ulearner.backend.domain.Enrollment;
import com.ulearner.backend.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByStudentAndCourse(User student, Course course);

    List<Enrollment> findAllByStudent(User student);

    List<Enrollment> findAllByCourse(Course course);
}
