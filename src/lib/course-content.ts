import type { CourseModule, CourseSummary } from '@/types/course';

export function buildModulesFromLessons(course: CourseSummary): CourseModule[] {
  if (!course.lessons.length) {
    return [];
  }

  return course.lessons.map((lesson, index) => ({
    id: `lesson-${lesson.id}`,
    title: `${index + 1}. ${lesson.title}`,
    description: `Estimated duration: ${lesson.duration}`,
    items: (() => {
      const items: CourseModule['items'] = [];
      if (lesson.videoUrl) {
        items.push({
          id: `lesson-${lesson.id}-video`,
          type: 'video',
          title: lesson.title,
          url: lesson.videoUrl,
          duration: lesson.duration,
        });
      }
      items.push({
        id: `lesson-${lesson.id}-content`,
        type: 'text',
        title: lesson.title,
        body: `Work through the "${lesson.title}" lesson as part of ${course.title}.`,
      });
      return items;
    })(),
  }));
}
