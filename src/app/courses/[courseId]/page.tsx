import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EnrollButton from "@/components/EnrollButton";
import FavoriteButton from "@/components/FavoriteButton";
import { fetchCatalogCourse } from "@/lib/catalog-service";
import { adaptCatalogCourse } from "@/lib/catalog-adapter";
import type { CourseSummary } from "@/types/course";
import type { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

type CourseParams = Promise<{
  courseId: string;
}>;

async function loadCourse(courseId: string): Promise<CourseSummary | null> {
  try {
    const course = await fetchCatalogCourse(courseId);
    return adaptCatalogCourse(course);
  } catch (error) {
    const isNotFound =
      typeof error === "object" && error !== null && (error as ApiError).status === 404;
    if (!isNotFound) {
      console.error("Failed to load course", error);
    }
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: CourseParams;
}): Promise<Metadata> {
  const { courseId } = await params;
  const course = await loadCourse(courseId);

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
  const course = await loadCourse(courseId);

  if (!course) {
    notFound();
  }

  const lessonList = course.lessons;
  const heroImage = course.imageUrl ?? "/course-thumbnails/nextjs.svg";

  return (
    <section className="course-hero py-5">
      <div className="container">
        <Link href="/courses" className="text-decoration-none text-secondary d-inline-flex align-items-center mb-4">
          <span aria-hidden className="me-1">←</span>
          Back to courses
        </Link>

        <div className="row g-4 align-items-start">
          <div className="col-lg-8">
            <article className="card border-0 shadow-sm overflow-hidden h-100">
              <div className="position-relative" style={{ height: "280px" }}>
                <Image
                  src={heroImage}
                  alt={course.title}
                  fill
                  sizes="(min-width: 992px) 60vw, 100vw"
                  className="object-fit-cover"
                  priority
                />
              </div>
              <div className="card-body p-4 p-md-5">
                <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                  <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">
                    {course.instructor}
                  </span>
                  <span className="text-secondary small">{course.category}</span>
                </div>
                <h1 className="display-6 fw-bold mb-3">{course.title}</h1>
                <p className="text-secondary mb-4 lh-lg">{course.description}</p>

                <section>
                  <h2 className="h5 fw-semibold mb-3">Course outline</h2>
                  {lessonList.length > 0 ? (
                    <ul className="list-group list-group-flush lesson-list">
                      {lessonList.map((lesson) => (
                        <li key={lesson.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="fw-medium">{lesson.title}</span>
                          <span className="badge rounded-pill">{lesson.duration}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-secondary mb-0">Lesson plan will be published soon.</p>
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
                  <span className="h3 fw-bold mb-0">${course.price.toFixed(2)}</span>
                  <span className="text-secondary">one-time payment</span>
                </div>
                <div className="d-flex flex-column gap-2 mb-3">
                  <EnrollButton courseId={course.id} className="btn btn-primary w-100" />
                  <FavoriteButton courseId={course.id} origin="catalog" className="w-100" size="md" showLabel />
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
