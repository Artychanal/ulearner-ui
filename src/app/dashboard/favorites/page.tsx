'use client';

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import { useAuth } from "@/context/AuthContext";
import type { FavoriteCourse } from "@/types/user";

type FavoriteDisplay = {
  key: string;
  courseId: number | string;
  origin: FavoriteCourse["origin"];
  addedAt: string;
  title: string;
  description: string;
  meta: string;
  imageUrl: string;
  href: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

export default function FavoritesPage() {
  const router = useRouter();
  const { authState, catalog } = useAuth();

  useEffect(() => {
    if (authState.status === "unauthenticated") {
      router.replace("/login");
    }
  }, [authState.status, router]);

  const favorites = useMemo<FavoriteDisplay[]>(() => {
    if (authState.status !== "authenticated") {
      return [];
    }

    const entries = authState.user.favoriteCourses ?? [];
    const authoredCourses = authState.user.authoredCourses;

    return (
      entries
      .map((entry) => {
        if (entry.origin === "catalog") {
          const match = catalog.find((course) => String(course.id) === String(entry.courseId));
          if (!match) {
            return null;
          }

          return {
            key: `catalog-${match.id}`,
            courseId: match.id,
            origin: entry.origin,
            addedAt: entry.addedAt,
            title: match.title,
            description: match.description,
            meta: match.instructor,
            imageUrl: match.imageUrl,
            href: `/courses/${match.id}`,
          } satisfies FavoriteDisplay;
        }

        const match = authoredCourses.find((course) => course.id === String(entry.courseId));
        if (!match) {
          return null;
        }

        return {
          key: `authored-${match.id}`,
          courseId: match.id,
          origin: entry.origin,
          addedAt: entry.addedAt,
          title: match.title,
          description: match.description,
          meta: match.category,
          imageUrl: match.imageUrl,
          href: `/dashboard/courses/${match.id}/edit`,
        } satisfies FavoriteDisplay;
      })
      .filter((item): item is FavoriteDisplay => item !== null)
      .sort((a, b) => new Date(b.addedAt).valueOf() - new Date(a.addedAt).valueOf())
    );
  }, [authState, catalog]);

  if (authState.status !== "authenticated") {
    return (
      <section className="py-5">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5">
      <div className="container d-flex flex-column gap-4">
        <header className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <h1 className="display-6 fw-bold mb-1">Favorite courses</h1>
            <p className="text-secondary mb-0">Quick access to the classes you want to revisit or enroll next.</p>
          </div>
          <Link href="/courses" className="btn btn-outline-primary">
            Browse catalog
          </Link>
        </header>

        {favorites.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-5 text-center">
              <h2 className="h5 fw-semibold mb-2">No favorites yet</h2>
              <p className="text-secondary mb-4">Mark a course with the heart icon to keep it handy for later.</p>
              <div className="d-flex justify-content-center gap-2">
                <Link href="/courses" className="btn btn-primary">
                  Explore courses
                </Link>
                <Link href="/dashboard" className="btn btn-outline-secondary">
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {favorites.map((favorite) => (
              <div key={favorite.key} className="col-md-6 col-xl-4 d-flex">
                <article className="card border-0 shadow-sm h-100 w-100 overflow-hidden">
                  <div className="ratio ratio-16x9 position-relative">
                    <Image
                      src={favorite.imageUrl}
                      alt={favorite.title}
                      fill
                      sizes="(min-width: 1200px) 400px, (min-width: 768px) 50vw, 100vw"
                      className="object-fit-cover"
                    />
                  </div>
                  <div className="card-body p-4 d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <span
                          className={`badge ${favorite.origin === "catalog" ? "bg-primary-subtle text-primary" : "bg-info-subtle text-info"} fw-semibold mb-2`}
                        >
                          {favorite.origin === "catalog" ? "Catalog" : "My course"}
                        </span>
                        <h2 className="h5 fw-semibold mb-1">{favorite.title}</h2>
                        <p className="text-secondary small mb-0">{favorite.meta}</p>
                      </div>
                      <FavoriteButton courseId={favorite.courseId} origin={favorite.origin} />
                    </div>
                    <p className="text-secondary mb-0">{favorite.description}</p>
                    <div className="d-flex justify-content-between align-items-center text-secondary small">
                      <span>Added {formatDate(favorite.addedAt)}</span>
                      <Link href={favorite.href} className="fw-semibold text-decoration-none">
                        {favorite.origin === "catalog" ? "View course →" : "Edit course →"}
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
