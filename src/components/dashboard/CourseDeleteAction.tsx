'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type CourseDeleteActionProps = {
  courseId: string;
  courseTitle: string;
};

export default function CourseDeleteAction({ courseId, courseTitle }: CourseDeleteActionProps) {
  const { deleteCourse } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfirming) {
      return;
    }
    setCooldown(5);
    const timer = window.setInterval(() => {
      setCooldown((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isConfirming]);

  const handleStart = () => {
    setError(null);
    setIsConfirming(true);
  };

  const handleCancel = () => {
    setIsConfirming(false);
    setCooldown(0);
    setError(null);
  };

  const handleConfirm = async () => {
    if (cooldown > 0 || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await deleteCourse(courseId);
      setIsConfirming(false);
    } catch (err) {
      console.error("Failed to delete course", err);
      setError("We couldn't delete this course. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isConfirming) {
    return (
      <button type="button" className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" onClick={handleStart}>
        <span aria-hidden>🗑️</span>
        Delete
      </button>
    );
  }

  return (
    <div className="position-relative d-inline-block">
      <div
        className="shadow-lg border rounded-4 bg-white"
        style={{
          minWidth: 300,
          maxWidth: 380,
          position: "absolute",
          right: 0,
          top: "110%",
          zIndex: 20,
          borderColor: "var(--bs-danger-bg-subtle)",
        }}
      >
        <div className="d-flex align-items-start gap-3 p-3 pb-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 34, height: 34, background: "rgba(220,53,69,0.1)", color: "#dc3545", fontWeight: 700 }}
            aria-hidden
          >
            !
          </div>
          <div className="flex-grow-1">
            <div className="fw-semibold text-danger">Delete “{courseTitle}”?</div>
            <p className="text-secondary small mb-2 mb-sm-3">
              This will remove the course and all of its lessons. This action can&apos;t be undone.
            </p>
            {error ? (
              <div className="alert alert-danger py-2 px-3 small mb-2">{error}</div>
            ) : null}
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-between gap-2 px-3 pb-3">
          <div className="text-secondary small">
            {cooldown > 0 ? (
              <span className="badge rounded-pill text-bg-light">Ready in {cooldown}s</span>
            ) : (
              <span className="text-success">Ready to delete</span>
            )}
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleCancel}>
              Keep course
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              disabled={cooldown > 0 || isDeleting}
              onClick={handleConfirm}
            >
              {isDeleting
                ? "Deleting..."
                : cooldown > 0
                  ? `Delete in ${cooldown}s`
                  : "Delete course"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
