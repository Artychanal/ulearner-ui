import type { CatalogCourse } from '@/types/catalog';
import type { CourseSummary, Lesson } from '@/types/course';
import { formatMinutes } from '@/lib/formatters';

function normalizeLessons(course: CatalogCourse): Lesson[] {
  return [...course.lessons]
    .sort((a, b) => a.position - b.position)
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      duration: formatMinutes(lesson.durationMinutes),
      durationMinutes: lesson.durationMinutes,
      videoUrl: lesson.videoUrl ?? undefined,
    }));
}

export function adaptCatalogCourse(course: CatalogCourse): CourseSummary {
  return {
    id: course.id,
    title: course.title,
    instructor: course.instructor?.name ?? 'ULearner Mentor',
    instructorId: course.instructor?.id,
    description: course.description,
    price: Number(course.price),
    category: course.category,
    imageUrl: course.imageUrl ?? undefined,
    lessons: normalizeLessons(course),
  };
}

export function adaptCatalogCourses(courses: CatalogCourse[]): CourseSummary[] {
  return courses.map(adaptCatalogCourse);
}

export function extractCourseCategories(courses: CourseSummary[]): string[] {
  return Array.from(new Set(courses.map((course) => course.category))).sort((a, b) =>
    a.localeCompare(b),
  );
}
