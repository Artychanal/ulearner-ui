import { apiFetch } from '@/lib/api';
import type { CourseReview, CourseReviewSummary } from '@/types/course';

export async function fetchCourseReviews(courseId: string) {
  return apiFetch<CourseReviewSummary>(`/courses/${courseId}/reviews`);
}

export async function submitCourseReview(
  accessToken: string,
  courseId: string,
  payload: { rating: number; comment?: string },
) {
  return apiFetch<CourseReview>(`/courses/${courseId}/reviews`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}
