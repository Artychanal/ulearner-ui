'use client';

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import QuizRunner from "@/components/learn/QuizRunner";
import type { CourseContentItem, CourseModule, QuizAttempt } from "@/types/course";
import { getCatalogCourseModules } from "@/lib/mockData";

type CourseLearnScreenProps = {
  courseId: string;
};

function flattenItems(modules: CourseModule[]) {
  return modules.reduce<CourseContentItem[]>((acc, module) => acc.concat(module.items), []);
}

export default function CourseLearnScreen({ courseId }: CourseLearnScreenProps) {
  const router = useRouter();
  const { authState, catalog, updateProgress } = useAuth();
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  useEffect(() => {
    if (authState.status === "unauthenticated") {
      router.replace(`/login?next=/dashboard/courses/${courseId}/learn`);
    }
  }, [authState.status, courseId, router]);

  const enrollment = useMemo(() => {
    if (authState.status !== "authenticated") {
      return null;
    }
    return (
      authState.user.enrolledCourses.find((progress) => String(progress.courseId) === String(courseId)) ?? null
    );
  }, [authState, courseId]);

  const courseData = useMemo(() => {
    if (authState.status !== "authenticated") {
      return null;
    }

    const authoredCourse = authState.user.authoredCourses.find((course) => course.id === courseId);
    if (authoredCourse) {
      return {
        title: authoredCourse.title,
        description: authoredCourse.description,
        instructor: authoredCourse.instructor,
        modules: authoredCourse.modules,
        origin: "authored" as const,
      };
    }

    const summary = catalog.find((course) => String(course.id) === String(courseId));
    if (summary) {
      return {
        title: summary.title,
        description: summary.description,
        instructor: summary.instructor,
        modules: getCatalogCourseModules(Number(summary.id)),
        origin: "catalog" as const,
      };
    }

    return null;
  }, [authState, catalog, courseId]);

  useEffect(() => {
    if (!enrollment && authState.status === "authenticated") {
      router.replace(`/courses/${courseId}`);
    }
  }, [authState.status, courseId, enrollment, router]);

  useEffect(() => {
    if (!courseData) {
      return;
    }
    const firstModule = courseData.modules[0];
    startTransition(() => {
      setActiveModuleId((prev) => prev ?? firstModule?.id ?? null);
      setActiveItemId((prev) => prev ?? firstModule?.items[0]?.id ?? null);
    });
  }, [courseData]);

  if (authState.status !== "authenticated" || !courseData || !enrollment) {
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

  const modules = courseData.modules;
  const activeModule = modules.find((module) => module.id === activeModuleId) ?? modules[0];
  const activeItem = activeModule?.items.find((item) => item.id === activeItemId) ?? activeModule?.items[0];
  const completedSet = new Set(enrollment.completedLessons);
  const totalItems = flattenItems(modules).length || 1;

  const handleSelectItem = (moduleId: string, itemId: string) => {
    setActiveModuleId(moduleId);
    setActiveItemId(itemId);
  };

  const handleMarkComplete = (itemId: string, extras?: Partial<{ quizAttempts: QuizAttempt[] }>) => {
    const updatedCompleted = new Set(enrollment.completedLessons);
    updatedCompleted.add(itemId);
    const completeCount = updatedCompleted.size;
    const progress = Math.min(100, Math.round((completeCount / totalItems) * 100));

    updateProgress({
      ...enrollment,
      ...extras,
      completedLessons: Array.from(updatedCompleted),
      progress,
    });
  };

  const handleQuizSubmit = (quizId: string, submission: { selectedOptionIndexes: number[]; scoredPoints: number; totalPoints: number }) => {
    const updatedAttempts = [...enrollment.quizAttempts];
    const attemptPayload: QuizAttempt = {
      quizId,
      selectedOptionIndexes: submission.selectedOptionIndexes,
      scoredPoints: submission.scoredPoints,
      totalPoints: submission.totalPoints,
      completedAt: new Date().toISOString(),
    };

    const existingIndex = updatedAttempts.findIndex((attempt) => attempt.quizId === quizId);
    if (existingIndex >= 0) {
      updatedAttempts[existingIndex] = attemptPayload;
    } else {
      updatedAttempts.push(attemptPayload);
    }

    handleMarkComplete(quizId, { quizAttempts: updatedAttempts });
  };

  const renderContent = (item: CourseContentItem | undefined) => {
    if (!item) {
      return <p className="text-secondary">Select a lesson to get started.</p>;
    }

    switch (item.type) {
      case "text":
        return (
          <article className="d-flex flex-column gap-3">
            <h2 className="h4 fw-semibold">{item.title}</h2>
            <p className="text-secondary">{item.body}</p>
          </article>
        );
      case "video":
        return (
          <div className="d-flex flex-column gap-3">
            <h2 className="h4 fw-semibold">{item.title}</h2>
            <div className="ratio ratio-16x9 rounded-4 overflow-hidden">
              <iframe
                src={item.url}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <span className="text-secondary small">Duration: {item.duration}</span>
          </div>
        );
      case "quiz":
        {
          const attempt = enrollment.quizAttempts.find((candidate) => candidate.quizId === item.id) ?? null;
          return <QuizRunner quiz={item} attempt={attempt} onSubmit={(payload) => handleQuizSubmit(item.id, payload)} />;
        }
      default:
        return null;
    }
  };

  return (
    <section className="py-5">
      <div className="container">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
          <div>
            <p className="text-secondary small mb-1">Instructor: {courseData.instructor}</p>
            <h1 className="h3 fw-bold mb-2">{courseData.title}</h1>
            <p className="text-secondary mb-0">{courseData.description}</p>
          </div>
          <div className="text-end">
            <span className="d-block fw-semibold">Progress</span>
            <div className="progress" style={{ width: "220px" }} aria-valuenow={enrollment.progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-bar" style={{ width: `${enrollment.progress}%` }}>
                {enrollment.progress}%
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h2 className="h5 fw-semibold mb-3">Modules</h2>
                <div className="d-flex flex-column gap-3">
                  {modules.map((module) => (
                    <div key={module.id}>
                      <button
                        type="button"
                        className={`btn btn-light w-100 text-start fw-semibold${module.id === activeModule?.id ? " active" : ""}`}
                        onClick={() => handleSelectItem(module.id, module.items[0]?.id ?? module.id)}
                      >
                        {module.title}
                      </button>
                      <ul className="list-unstyled ms-3 mt-2 small d-flex flex-column gap-2">
                        {module.items.map((item) => {
                          const isCompleted = completedSet.has(item.id);
                          const quizAttempt = item.type === "quiz" ? enrollment.quizAttempts.find((attempt) => attempt.quizId === item.id) ?? null : null;
                          return (
                            <li key={item.id}>
                              <button
                                type="button"
                                className={`btn btn-sm w-100 text-start d-flex justify-content-between align-items-center ${
                                  item.id === activeItem?.id ? "btn-outline-primary" : "btn-outline-secondary"
                                }`}
                                onClick={() => handleSelectItem(module.id, item.id)}
                              >
                                <span className="d-flex flex-column align-items-start">
                                  <span>{item.title}</span>
                                  {item.type === "quiz" && (
                                    <span className="text-secondary small">
                                      {quizAttempt ? `Результат: ${quizAttempt.scoredPoints}/${quizAttempt.totalPoints}` : "Ще не пройдено"}
                                    </span>
                                  )}
                                </span>
                                {(() => {
                                  if (item.type === "quiz") {
                                    if (quizAttempt) {
                                      return (
                                        <span className="badge bg-warning-subtle text-warning">
                                          {quizAttempt.scoredPoints}/{quizAttempt.totalPoints}
                                        </span>
                                      );
                                    }
                                    if (isCompleted) {
                                      return <span className="badge bg-success-subtle text-success">Done</span>;
                                    }
                                    return null;
                                  }

                                  return isCompleted ? <span className="badge bg-success-subtle text-success">Done</span> : null;
                                })()}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 p-lg-5 d-flex flex-column gap-4">
                {renderContent(activeItem)}
                {activeItem && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary small">
                      Module {(() => {
                        const index = modules.findIndex((module) => module.id === activeModule?.id);
                        return index >= 0 ? index + 1 : "-";
                      })()} ·{" "}
                      Lesson {(() => {
                        if (!activeModule) {
                          return "-";
                        }
                        const lessonIndex = activeModule.items.findIndex((item) => item.id === activeItem.id);
                        return lessonIndex >= 0 ? lessonIndex + 1 : "-";
                      })()}
                    </span>
                    {(() => {
                      if (activeItem.type === "quiz") {
                        return completedSet.has(activeItem.id) ? (
                          <span className="badge bg-success-subtle text-success">Вікторина пройдена</span>
                        ) : (
                          <span className="text-secondary small">Надішли відповіді, щоб зарахувати вікторину</span>
                        );
                      }

                      if (completedSet.has(activeItem.id)) {
                        return <span className="badge bg-success-subtle text-success">Completed</span>;
                      }

                      return (
                        <button type="button" className="btn btn-primary" onClick={() => handleMarkComplete(activeItem.id)}>
                          Mark as completed
                        </button>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
