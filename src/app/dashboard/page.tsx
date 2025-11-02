'use client';

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FavoriteButton from "@/components/FavoriteButton";
import type { CourseSummary } from "@/types/course";

function formatDate(iso: string) {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString();
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const { authState, catalog } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authState.status === "unauthenticated") {
      router.replace("/login");
    }
  }, [authState, router]);

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

  const { user } = authState;

  const enrolled = user.enrolledCourses
    .map((progress) => {
      const catalogCourse = catalog.find((courseItem) => String(courseItem.id) === String(progress.courseId));
      if (catalogCourse) {
        return {
          variant: "catalog" as const,
          progress,
          course: catalogCourse,
        };
      }

      const authoredCourse = user.authoredCourses.find((courseItem) => courseItem.id === String(progress.courseId));
      if (authoredCourse) {
        return {
          variant: "authored" as const,
          progress,
          course: authoredCourse,
        };
      }

      return null;
    })
    .filter(
      (item): item is { variant: "catalog"; progress: (typeof user.enrolledCourses)[number]; course: CourseSummary } | { variant: "authored"; progress: (typeof user.enrolledCourses)[number]; course: (typeof user.authoredCourses)[number] } =>
        Boolean(item),
    );

  return (
    <section className="py-5">
      <div className="container d-flex flex-column gap-5">
        <header className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <h1 className="display-6 fw-bold mb-1">Welcome back, {user.name}</h1>
            <p className="text-secondary mb-0">Track your learning progress and refine the courses you teach.</p>
          </div>
          <Link href="/dashboard/courses/new" className="btn btn-primary btn-lg">
            Create new course
          </Link>
        </header>

        <section className="card border-0 shadow-sm dashboard-teach-card">
          <div className="card-body p-4 p-lg-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 fw-semibold mb-0">Learning progress</h2>
              <span className="text-secondary small">{enrolled.length} active courses</span>
            </div>
            {enrolled.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <p className="mb-3">You haven&apos;t joined any courses yet.</p>
                <Link href="/courses" className="btn btn-outline-primary">
                  Browse catalog
                </Link>
              </div>
            ) : (
              <div className="row g-4">
                {enrolled.map(({ variant, progress, course }) => {
                  const courseId = String(progress.courseId);

                  if (variant === "catalog") {
                    const summary = course;
                    const totalLessons = summary.lessons.length || 1;

                    return (
                      <div key={courseId} className="col-md-6">
                        <div className="border rounded-4 p-4 h-100 d-flex flex-column gap-3">
                          <div>
                            <h3 className="h5 fw-semibold mb-1">{summary.title}</h3>
                            <p className="text-secondary small mb-0">{summary.instructor}</p>
                          </div>
                          <p className="text-secondary mb-0">{summary.description}</p>
                          <div className="progress" role="progressbar" aria-valuenow={progress.progress} aria-valuemin={0} aria-valuemax={100}>
                            <div className="progress-bar" style={{ width: `${progress.progress}%` }}>
                              {progress.progress}%
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center text-secondary small">
                            <span>Lessons completed: {progress.completedLessons.length}/{totalLessons}</span>
                            <span>Updated {formatDate(progress.lastAccessed)}</span>
                          </div>
                          <div className="d-flex gap-2">
                            <Link href={`/dashboard/courses/${courseId}/learn`} className="btn btn-sm btn-outline-primary">
                              Open course
                            </Link>
                            <FavoriteButton courseId={courseId} origin="catalog" />
                            <button type="button" className="btn btn-sm btn-outline-secondary">Add note</button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const authored = course;
                  const totalLessons = authored.modules.reduce((acc, module) => acc + module.items.length, 0) || 1;

                  return (
                    <div key={courseId} className="col-md-6">
                      <div className="border rounded-4 p-4 h-100 d-flex flex-column gap-3">
                        <div>
                          <h3 className="h5 fw-semibold mb-1">{authored.title}</h3>
                          <p className="text-secondary small mb-0">{authored.instructor}</p>
                        </div>
                        <p className="text-secondary mb-0">{authored.description}</p>
                        <div className="progress" role="progressbar" aria-valuenow={progress.progress} aria-valuemin={0} aria-valuemax={100}>
                          <div className="progress-bar" style={{ width: `${progress.progress}%` }}>
                            {progress.progress}%
                          </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center text-secondary small">
                          <span>Lessons completed: {progress.completedLessons.length}/{totalLessons}</span>
                          <span>Updated {formatDate(progress.lastAccessed)}</span>
                        </div>
                        <div className="d-flex gap-2">
                          <Link href={`/dashboard/courses/${courseId}/learn`} className="btn btn-sm btn-outline-primary">
                            Open course
                          </Link>
                          <Link href={`/dashboard/courses/${courseId}/edit`} className="btn btn-sm btn-outline-secondary">
                            Edit
                          </Link>
                          <FavoriteButton courseId={courseId} origin="authored" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="card border-0 shadow-sm">
          <div className="card-body p-4 p-lg-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 fw-semibold mb-0">Courses you teach</h2>
              <span className="text-secondary small">{user.authoredCourses.length} total</span>
            </div>
            {user.authoredCourses.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <p className="mb-3">You haven&apos;t created any courses yet.</p>
                <Link href="/dashboard/courses/new" className="btn btn-outline-primary">
                  Create your first course
                </Link>
              </div>
            ) : (
              <div className="table-responsive dashboard-teach-table-wrapper">
                <table className="table align-middle dashboard-teach-table mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Course</th>
                      <th scope="col">Status</th>
                      <th scope="col">Modules</th>
                      <th scope="col">Last updated</th>
                      <th scope="col" className="text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.authoredCourses.map((course) => (
                      <tr key={course.id}>
                        <td>
                          <div className="fw-semibold">{course.title}</div>
                          <div className="text-secondary small">{course.category}</div>
                        </td>
                        <td>
                          <span className={`badge ${course.isPublished ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}>
                            {course.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td>{course.modules.length}</td>
                        <td>{formatDate(course.lastUpdated)}</td>
                        <td className="text-end">
                          <Link href={`/dashboard/courses/${course.id}/edit`} className="btn btn-sm btn-outline-primary me-2">
                            Edit
                          </Link>
                          <button type="button" className="btn btn-sm btn-outline-secondary">
                            View analytics
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
