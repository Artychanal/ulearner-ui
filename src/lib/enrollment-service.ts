import { apiFetch } from '@/lib/api';
import type { EnrollmentApi } from '@/types/api';

export async function fetchEnrollments(accessToken: string) {
  return apiFetch<EnrollmentApi[]>('/enrollments/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function joinCourse(accessToken: string, payload: { courseId: string; origin?: 'catalog' | 'authored' }) {
  return apiFetch<EnrollmentApi>('/enrollments', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function updateEnrollmentProgress(
  accessToken: string,
  payload: { enrollmentId: string; progress: number; completedLessons: string[]; quizAttempts?: unknown[] },
) {
  return apiFetch<EnrollmentApi>('/enrollments/progress', {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
