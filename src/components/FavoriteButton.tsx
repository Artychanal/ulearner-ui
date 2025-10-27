'use client';

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
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
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-6.5-4.35-9.17-8.12C-0.84 7.8 1.14 3 5 3c2.14 0 3.63 1.37 4.5 2.62C10.37 4.37 11.86 3 14 3c3.86 0 5.84 4.8 2.17 9.88C18.5 16.65 12 21 12 21z" />
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

  const { isFavorite, isDisabled } = useMemo(() => {
    if (authState.status !== "authenticated") {
      return { isFavorite: false, isDisabled: authState.status === "loading" };
    }

    const favorite = authState.user.favoriteCourses?.some(
      (entry) => String(entry.courseId) === String(courseId) && entry.origin === origin,
    );

    return { isFavorite: Boolean(favorite), isDisabled: false };
  }, [authState, courseId, origin]);

  const handleClick = () => {
    if (authState.status === "loading") {
      return;
    }

    if (authState.status !== "authenticated") {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.push(`/login${next}`);
      return;
    }

    toggleFavorite(courseId, origin);
  };

  const label = isFavorite ? "Remove from favorites" : "Add to favorites";

  return (
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
  );
}
