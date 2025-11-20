'use client';

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { CourseAnalytics } from "@/lib/authored-courses-service";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function CourseAnalyticsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const router = useRouter();
  const { authState, fetchCourseAnalytics } = useAuth();
  const { courseId } = use(params);
  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authState.status === "unauthenticated") {
      router.replace("/login");
    }
  }, [authState.status, router]);

  const course = useMemo(() => {
    if (authState.status !== "authenticated") return null;
    return authState.user.authoredCourses.find((item) => item.id === courseId) ?? null;
  }, [authState, courseId]);

  useEffect(() => {
    if (authState.status === "authenticated" && !course) {
      router.replace("/dashboard");
    }
  }, [authState.status, course, router]);

  useEffect(() => {
    if (authState.status !== "authenticated" || !course) {
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchCourseAnalytics(course.id);
        if (active) {
          setAnalytics(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error("Failed to load analytics", err);
          setError("We couldn't load analytics right now. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [authState.status, course, fetchCourseAnalytics]);

  if (authState.status !== "authenticated" || !course) {
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

  const totalLessons = analytics?.lessonsCount ?? course.modules.reduce((sum, module) => sum + module.items.length, 0);
  const enrolledLearners = analytics?.enrolled ?? 0;
  const activeThisWeek = analytics?.activeThisWeek ?? 0;
  const avgCompletion = analytics?.completionRate ?? 0;
  const avgRating = analytics?.averageRating ?? 0;
  const reviewsCount = analytics?.reviewsCount ?? 0;

  return (
    <section className="py-5">
      <div className="container d-flex flex-column gap-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <p className="text-secondary mb-1 small d-flex align-items-center gap-2">
              <Link href="/dashboard" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">
                Dashboard
              </Link>
              <span aria-hidden>›</span>
              <Link
                href={`/dashboard/courses/${course.id}/edit`}
                className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover"
              >
                {course.title}
              </Link>
              <span aria-hidden>›</span>
              <span className="text-body">Analytics</span>
            </p>
            <h1 className="display-6 fw-bold mb-1">Analytics</h1>
            <p className="text-secondary mb-0">
              Track how learners engage with “{course.title}” and iterate with confidence.
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <Link href={`/dashboard/courses/${course.id}/edit`} className="btn btn-outline-primary">
              Edit course
            </Link>
            <Link href={`/dashboard/courses/${course.id}/learn`} className="btn btn-outline-secondary">
              Preview as learner
            </Link>
          </div>
        </div>

        {error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : null}

        <div className="row g-4">
          <div className="col-md-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <p className="text-secondary small mb-1">Enrolled learners</p>
                <h3 className="h2 fw-bold mb-0">
                  {loading ? <span className="placeholder col-6" /> : formatNumber(enrolledLearners)}
                </h3>
                <p className="text-success small mb-0">
                  {loading ? <span className="placeholder col-4" /> : `Active this week: ${activeThisWeek}`}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <p className="text-secondary small mb-1">Active this week</p>
                <h3 className="h2 fw-bold mb-0">
                  {loading ? <span className="placeholder col-6" /> : formatNumber(activeThisWeek)}
                </h3>
                <p className="text-secondary small mb-0">Logged in or watched a lesson</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <p className="text-secondary small mb-1">Avg completion</p>
                <h3 className="h2 fw-bold mb-0">
                  {loading ? <span className="placeholder col-5" /> : formatPercent(avgCompletion)}
                </h3>
                <p className="text-secondary small mb-0">Across {totalLessons} lessons</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <p className="text-secondary small mb-1">Reviews</p>
                <h3 className="h2 fw-bold mb-0">
                  {loading ? <span className="placeholder col-3" /> : avgRating.toFixed(1)}
                </h3>
                <p className="text-secondary small mb-0">
                  {loading ? <span className="placeholder col-4" /> : `${reviewsCount} total`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4 p-lg-5">
            <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
              <div>
                <h2 className="h5 fw-semibold mb-1">Engagement overview</h2>
                <p className="text-secondary mb-0">
                  High-level signals to spot what’s working. Updated{" "}
                  {analytics?.lastUpdated ? formatDate(String(analytics.lastUpdated)) : "–"}.
                </p>
              </div>
              <span className="badge text-bg-light text-secondary">
                {analytics?.lastEnrollment
                  ? `Last enrollment ${formatDate(String(analytics.lastEnrollment))}`
                  : "No enrollments yet"}
              </span>
            </div>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="border rounded-4 p-3 h-100 bg-light-subtle">
                  <h3 className="h6 fw-semibold mb-2">Top modules by completion</h3>
                  <ul className="list-unstyled mb-0">
                    {course.modules.slice(0, 3).map((module, index) => (
                      <li key={module.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge text-bg-primary-subtle text-primary">{index + 1}</span>
                          <span>{module.title}</span>
                        </div>
                        <span className="text-secondary small">~{formatPercent(Math.max(40, 75 - index * 10))}</span>
                      </li>
                    ))}
                    {course.modules.length === 0 ? <li className="text-secondary">No modules yet.</li> : null}
                  </ul>
                </div>
              </div>
              <div className="col-md-6">
                <div className="border rounded-4 p-3 h-100 bg-light-subtle">
                  <h3 className="h6 fw-semibold mb-2">Monthly activity</h3>
                  <p className="text-secondary small mb-3">
                    Placeholder activity trend. Connect real metrics to show spikes after releases or promos.
                  </p>
                  <div className="d-flex align-items-end gap-2" style={{ minHeight: 140 }}>
                    {[38, 55, 62, 48, 71, 65, 80, 76, 69, 74, 82, 79].map((value, idx) => (
                      <div
                        key={idx}
                        className="rounded-2"
                        style={{
                          width: "7%",
                          minWidth: 14,
                          height: `${value}%`,
                          background: "linear-gradient(180deg, #4f46e5 0%, #818cf8 100%)",
                          opacity: 0.9,
                        }}
                        aria-label={`Month ${idx + 1} activity ${value}%`}
                        title={`Month ${idx + 1}: ${value}% activity`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
