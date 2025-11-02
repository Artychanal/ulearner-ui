'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import type { FavoriteCourse } from "@/types/user";

type FavoriteButtonProps = {
  courseId: number | string;
  origin: FavoriteCourse["origin"];
  className?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.5 4.42 3 7.5 3c1.74 0 3.41 0.97 4.5 2.5C13.59 3.97 15.26 3 17 3 20.08 3 22.5 5.5 22.5 8.5c0 3.78-3.4 6.86-8.55 11.53L12 21.35z" />
    </svg>
  );
}

export default function FavoriteButton({
  courseId,
  origin,
  className,
  size = "sm",
  showLabel = false,
}: FavoriteButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { authState, toggleFavorite } = useAuth();
  const [undoState, setUndoState] = useState<{ remaining: number } | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const undoDeadlineRef = useRef<number>(0);

  const { isFavorite, isDisabled } = useMemo(() => {
    if (authState.status !== "authenticated") {
      return { isFavorite: false, isDisabled: authState.status === "loading" };
    }

    const favorite = authState.user.favoriteCourses?.some(
      (entry) => String(entry.courseId) === String(courseId) && entry.origin === origin,
    );

    return { isFavorite: Boolean(favorite), isDisabled: false };
  }, [authState, courseId, origin]);

  const clearUndoTimers = useCallback(() => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const beginUndoCountdown = useCallback(() => {
    clearUndoTimers();
    undoDeadlineRef.current = Date.now() + 5000;
    setUndoState({ remaining: 5 });

    countdownIntervalRef.current = setInterval(() => {
      const msLeft = undoDeadlineRef.current - Date.now();
      const nextRemaining = Math.max(0, Math.ceil(msLeft / 1000));

      setUndoState((previous) => {
        if (!previous) {
          return previous;
        }

        if (nextRemaining === previous.remaining) {
          return previous;
        }

        if (nextRemaining <= 0) {
          return null;
        }

        return { remaining: nextRemaining };
      });

      if (msLeft <= 0) {
        clearUndoTimers();
      }
    }, 200);

    undoTimeoutRef.current = setTimeout(() => {
      clearUndoTimers();
      setUndoState(null);
    }, 5000);
  }, [clearUndoTimers]);

  const handleUndo = useCallback(() => {
    if (authState.status !== "authenticated") {
      setUndoState(null);
      clearUndoTimers();
      return;
    }

    toggleFavorite(courseId, origin);
    setUndoState(null);
    clearUndoTimers();
  }, [authState.status, clearUndoTimers, courseId, origin, toggleFavorite]);

  const handleCloseUndo = useCallback(() => {
    setUndoState(null);
    clearUndoTimers();
  }, [clearUndoTimers]);

  const handleClick = () => {
    if (authState.status === "loading") {
      return;
    }

    if (authState.status !== "authenticated") {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.push(`/login${next}`);
      return;
    }

    if (isFavorite) {
      const confirmed = window.confirm("Remove this course from favorites?");
      if (!confirmed) {
        return;
      }

      toggleFavorite(courseId, origin);
      beginUndoCountdown();
      return;
    }

    handleCloseUndo();
    toggleFavorite(courseId, origin);
  };

  const label = isFavorite ? "Remove from favorites" : "Add to favorites";

  useEffect(() => {
    return () => {
      clearUndoTimers();
    };
  }, [clearUndoTimers]);

  useEffect(() => {
    if (isFavorite) {
      clearUndoTimers();
    }
  }, [clearUndoTimers, isFavorite]);

  return (
    <>
      <button
        type="button"
        className={[
          "btn d-inline-flex align-items-center gap-2",
          size === "sm" ? "btn-sm" : "",
          isFavorite ? "btn-primary text-white" : "btn-ghost",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")
          .trim()}
        onClick={handleClick}
        aria-pressed={isFavorite}
        aria-label={label}
        title={label}
        disabled={isDisabled}
      >
        <HeartIcon filled={isFavorite} />
        {showLabel && <span>{isFavorite ? "Saved" : "Save"}</span>}
      </button>
      {undoState && !isFavorite && typeof document !== "undefined"
        ? createPortal(
            <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1080 }}>
              <div className="card shadow border-0" role="status" aria-live="polite">
                <div className="card-body py-3 px-4 d-flex align-items-center gap-3">
                  <div>
                    <p className="mb-0 fw-semibold">Removed from favorites</p>
                    <p className="mb-0 text-secondary small">Undo within {undoState.remaining} sec</p>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleUndo}>
                      Undo
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-secondary text-decoration-none"
                      onClick={handleCloseUndo}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
