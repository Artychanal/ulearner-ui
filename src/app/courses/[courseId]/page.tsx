import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { courses } from "@/data/courses";
import EnrollButton from "@/components/EnrollButton";
import FavoriteButton from "@/components/FavoriteButton";
import { getCatalogCourseModules } from "@/lib/mockData";

type CourseParams = Promise<{
  courseId: string;
}>;

function getCourse(courseId: string) {
  return courses.find((course) => course.id === Number(courseId));
}

export function generateStaticParams() {
  return courses.map((course) => ({
    courseId: course.id.toString(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: CourseParams;
}): Promise<Metadata> {
  const { courseId } = await params;
  const course = getCourse(courseId);

  if (!course) {
    return {
      title: "Course not found • ULearner",
    };
  }

  return {
    title: `${course.title} • ULearner`,
    description: course.description,
  };
}

export default async function CoursePage({ params }: { params: CourseParams }) {
  const { courseId } = await params;
  const course = getCourse(courseId);

  if (!course) {
    notFound();
  }

  const currentCourse = course;
  const modules = getCatalogCourseModules(currentCourse.id);

  return (
    <section className="course-hero py-5">
      <div className="container">
        <Link href="/" className="text-decoration-none text-secondary d-inline-flex align-items-center mb-4">
          <span aria-hidden className="me-1">←</span>
          Back to courses
        </Link>

        <div className="row g-4 align-items-start">
          <div className="col-lg-8">
            <article className="card border-0 shadow-sm overflow-hidden h-100">
              <div className="position-relative" style={{ height: "280px" }}>
                <Image
                  src={currentCourse.imageUrl}
                  alt={currentCourse.title}
                  fill
                  sizes="(min-width: 992px) 60vw, 100vw"
                  className="object-fit-cover"
                  priority
                />
              </div>
              <div className="card-body p-4 p-md-5">
                <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                  <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">
                    {currentCourse.instructor}
                  </span>
                  <span className="text-secondary small">Updated weekly • Intermediate level</span>
                </div>
                <h1 className="display-6 fw-bold mb-3">{currentCourse.title}</h1>
                <p className="text-secondary mb-4 lh-lg">{currentCourse.description}</p>

                <section>
                  <h2 className="h5 fw-semibold mb-3">Course outline</h2>
                  {modules.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {modules.map((module) => (
                        <div key={module.id} className="border rounded-4 p-3">
                          <h3 className="h6 fw-semibold mb-2">{module.title}</h3>
                          {module.description && <p className="text-secondary small mb-3">{module.description}</p>}
                          <ul className="list-unstyled mb-0 d-flex flex-column gap-2 text-secondary small">
                            {module.items.map((item) => (
                              <li key={item.id} className="d-flex justify-content-between align-items-center">
                                <span>{item.title}</span>
                                {item.type === "video" && <span className="badge bg-primary-subtle text-primary">Video</span>}
                                {item.type === "text" && <span className="badge bg-secondary-subtle text-secondary">Reading</span>}
                                {item.type === "quiz" && <span className="badge bg-warning-subtle text-warning">Quiz</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="list-group list-group-flush lesson-list">
                      {currentCourse.lessons.map((lesson) => (
                        <li key={lesson.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="fw-medium">{lesson.title}</span>
                          <span className="badge rounded-pill">{lesson.duration}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </article>
          </div>

          <aside className="col-lg-4">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: "96px" }}>
              <div className="card-body p-4">
                <p className="text-muted mb-2">Enroll now</p>
                <div className="d-flex align-items-baseline gap-2 mb-4">
                  <span className="h3 fw-bold mb-0">${currentCourse.price.toFixed(2)}</span>
                  <span className="text-secondary">one-time payment</span>
                </div>
                <div className="d-flex flex-column gap-2 mb-3">
                  <EnrollButton courseId={currentCourse.id} className="btn btn-primary w-100" />
                  <FavoriteButton courseId={currentCourse.id} origin="catalog" className="w-100" size="md" showLabel />
                </div>
                <p className="small text-secondary mb-4">
                  Gain lifetime access to the full course curriculum and downloadable assets.
                </p>
                <div className="border-top pt-3">
                  <p className="fw-semibold mb-2">This course includes:</p>
                  <ul className="list-unstyled text-secondary small mb-0">
                    <li>• Downloadable resources</li>
                    <li>• Completion certificate</li>
                    <li>• Community Q&amp;A support</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
