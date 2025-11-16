import type { CourseModule, CourseSummary } from '@/types/course';
import { getApiBaseUrl } from '@/lib/api';

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
      const resolvedVideoUrl =
        lesson.videoUrl ??
        (lesson.videoMediaId ? `${getApiBaseUrl()}/media/${lesson.videoMediaId}` : undefined);

      if (resolvedVideoUrl) {
        items.push({
          id: `lesson-${lesson.id}-video`,
          type: 'video',
          title: lesson.title,
          url: resolvedVideoUrl,
          duration: lesson.duration,
          mediaId: lesson.videoMediaId,
        });
      } else {
        items.push({
          id: `lesson-${lesson.id}-content`,
          type: 'text',
          title: lesson.title,
          body: `Work through the "${lesson.title}" lesson as part of ${course.title}.`,
        });
      }
      return items;
    })(),
  }));
}
