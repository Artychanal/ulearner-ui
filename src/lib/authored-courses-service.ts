import { apiFetch } from '@/lib/api';
import type { ApiAuthoredCourse } from '@/types/api';

export type AuthoredCoursePayload = {
  title: string;
  instructor: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isPublished: boolean;
  modules: unknown;
};

export async function fetchAuthoredCourses(accessToken: string) {
  return apiFetch<ApiAuthoredCourse[]>('/me/courses', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function createAuthoredCourse(accessToken: string, payload: AuthoredCoursePayload) {
  return apiFetch<ApiAuthoredCourse>('/me/courses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateAuthoredCourse(
  accessToken: string,
  courseId: string,
  payload: Partial<AuthoredCoursePayload>,
) {
  return apiFetch<ApiAuthoredCourse>(`/me/courses/${courseId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteAuthoredCourse(accessToken: string, courseId: string) {
  return apiFetch<{ id: string }>(`/me/courses/${courseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
