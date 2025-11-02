package com.ulearner.backend.repository;

import com.ulearner.backend.domain.Course;
import com.ulearner.backend.domain.Lesson;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByCourseOrderByPositionAsc(Course course);
}
