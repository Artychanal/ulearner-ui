import type { CourseModule, CourseSummary } from '@/types/course';

export function buildModulesFromLessons(course: CourseSummary): CourseModule[] {
  if (!course.lessons.length) {
    return [];
  }

  return course.lessons.map((lesson, index) => ({
    id: `lesson-${lesson.id}`,
    title: `${index + 1}. ${lesson.title}`,
    description: `Estimated duration: ${lesson.duration}`,
    items: [
      {
        id: `lesson-${lesson.id}-content`,
        type: 'text',
        title: lesson.title,
        body: `Work through the "${lesson.title}" lesson as part of ${course.title}.`,
      },
    ],
  }));
}
