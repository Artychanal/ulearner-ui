import { apiFetch } from '@/lib/api';
import type {
  CatalogCourse,
  CatalogCourseCollection,
  CatalogInstructor,
  CatalogTestimonial,
} from '@/types/catalog';

export type CourseFilters = {
  limit?: number;
  offset?: number;
  category?: string;
  search?: string;
  instructorId?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function fetchCatalogCourses(filters: CourseFilters = {}) {
  const safeLimit =
    filters.limit !== undefined && filters.limit !== null
      ? Math.min(100, Math.max(1, filters.limit))
      : undefined;
  return apiFetch<CatalogCourseCollection>('/courses', {
    query: {
      limit: safeLimit,
      offset: filters.offset,
      category: filters.category,
      search: filters.search,
      instructorId: filters.instructorId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    },
  });
}

export async function fetchCatalogCourse(courseId: string) {
  return apiFetch<CatalogCourse>(`/courses/${courseId}`);
}

export async function fetchCatalogInstructors() {
  return apiFetch<CatalogInstructor[]>('/instructors');
}

export async function fetchCatalogTestimonials(filters: { limit?: number; offset?: number } = {}) {
  return apiFetch<{
    items: CatalogTestimonial[];
    meta: { total: number; limit: number; offset: number };
  }>('/testimonials', {
    query: {
      limit: filters.limit,
      offset: filters.offset,
    },
  });
}
