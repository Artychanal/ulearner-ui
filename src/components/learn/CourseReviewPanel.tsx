"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCourseReviews } from "@/lib/course-reviews-service";
import type { CourseReviewSummary } from "@/types/course";
import { useAuth } from "@/context/AuthContext";

function renderStars(value: number) {
  return Array.from({ length: 5 }).map((_, index) => (
    <span
      key={index}
      className={index < value ? "text-warning" : "text-secondary"}
      aria-hidden
    >
      ★
    </span>
  ));
}

function clampRating(rating: number) {
  if (rating < 1) {
    return 1;
  }
  if (rating > 5) {
    return 5;
  }
  return rating;
}

type CourseReviewPanelProps = {
  courseId: string;
  canReview: boolean;
  currentUserId?: string;
};

export default function CourseReviewPanel({ courseId, canReview, currentUserId }: CourseReviewPanelProps) {
  const [summary, setSummary] = useState<CourseReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { submitCourseReview } = useAuth();

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCourseReviews(courseId);
      setSummary(data);
      if (currentUserId) {
        const mine = data.reviews.find((review) => review.author.id === currentUserId);
        if (mine) {
          setRating(mine.rating);
          setComment(mine.comment ?? "");
        }
      }
    } catch (loadError) {
      console.error(loadError);
      setError("Couldn't load reviews");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, currentUserId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const userReview = useMemo(() => {
    if (!summary || !currentUserId) {
      return null;
    }
    return summary.reviews.find((review) => review.author.id === currentUserId) ?? null;
  }, [summary, currentUserId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canReview) {
      return;
    }
    setIsSaving(true);
    setFeedback(null);
    try {
      await submitCourseReview(courseId, {
        rating: clampRating(rating),
        comment: comment.trim() || undefined,
      });
      await loadReviews();
      setFeedback("Review saved");
    } catch (submitError) {
      console.error(submitError);
      setFeedback("Couldn't save review. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4 p-lg-5 d-flex flex-column gap-4">
        <div className="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center">
          <div>
            <h2 className="h5 fw-semibold mb-1">Course reviews</h2>
            {summary ? (
              <p className="text-secondary mb-0">
                Average rating: <strong>{summary.averageRating.toFixed(1)}</strong> ({summary.totalReviews} reviews)
              </p>
            ) : (
              <p className="text-secondary mb-0">Loading summary…</p>
            )}
          </div>
          {summary && (
            <div className="display-6 fw-bold text-warning" aria-label={`${summary.averageRating} out of 5`}>
              {summary.averageRating ? renderStars(Math.round(summary.averageRating)) : renderStars(0)}
            </div>
          )}
        </div>

        {canReview ? (
          <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
            <div>
              <label className="form-label fw-semibold">Your rating</label>
              <div className="d-flex align-items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`btn btn-sm ${rating > index ? "btn-warning" : "btn-outline-secondary"}`}
                    onClick={() => setRating(index + 1)}
                    aria-label={`Set rating to ${index + 1}`}
                  >
                    ★
                  </button>
                ))}
                <span className="small text-secondary">{rating} / 5</span>
              </div>
            </div>
            <div>
              <label htmlFor="courseReviewComment" className="form-label">
                Your feedback (optional)
              </label>
              <textarea
                id="courseReviewComment"
                className="form-control"
                rows={3}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share what you liked or what could be improved"
              />
            </div>
            <div className="d-flex flex-column gap-2">
              <button type="submit" className="btn btn-primary w-auto" disabled={isSaving}>
                {isSaving ? "Saving…" : userReview ? "Update review" : "Submit review"}
              </button>
              {feedback && <span className="text-secondary small">{feedback}</span>}
            </div>
          </form>
        ) : (
          <p className="text-secondary mb-0">Complete this course to leave a review.</p>
        )}

        <div className="d-flex flex-column gap-3">
          <h3 className="h6 fw-semibold mb-0">What learners are saying</h3>
          {isLoading ? (
            <p className="text-secondary">Loading reviews…</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : summary && summary.reviews.length === 0 ? (
            <p className="text-secondary">No reviews yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {summary?.reviews.map((review) => (
                <article key={review.id} className="border rounded-4 p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="fw-semibold mb-1">{review.author.name}</p>
                      <div className="text-warning" aria-label={`Rating ${review.rating} out of 5`}>
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-secondary small">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && <p className="text-secondary mb-0 mt-2">{review.comment}</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
