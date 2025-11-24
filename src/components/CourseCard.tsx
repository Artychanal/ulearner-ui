
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import type { CourseSummary } from "@/types/course";

interface CourseCardProps {
  course: CourseSummary;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  if (course.status === "rejected") {
    return null;
  }
  const showStatus = course.status && course.status !== "approved";
  const statusLabel =
    course.status === "pending" ? "Pending review" : course.status === "approved" ? "Approved" : "Rejected";
  const statusClass =
    course.status === "pending" ? "badge bg-warning-subtle text-warning fw-semibold" : "badge bg-success-subtle text-success fw-semibold";

  return (
    <div className="card h-100 border-0 course-card elevated overflow-hidden position-relative">
      <span className="course-card-glow" aria-hidden />
      <div className="ratio ratio-16x9 position-relative overflow-hidden rounded-top">
        <img
          src={course.imageUrl ?? "/course-thumbnails/nextjs.svg"}
          alt={course.title}
          className="w-100 h-100 object-fit-cover"
          loading="lazy"
        />
        <Link
          href={`/courses/${course.id}`}
          className="stretched-link"
          aria-label={`Open ${course.title}`}
          title={`Open ${course.title}`}
        >
          <span className="visually-hidden">Open {course.title}</span>
        </Link>
      </div>
      <div className="card-body d-flex flex-column p-4 gap-3">
        <div className="d-flex justify-content-between align-items-center">
          <span className="badge rounded-pill fw-semibold text-uppercase small">
            {course.category}
          </span>
          <span className="price-chip">
            ${course.price.toFixed(2)}
          </span>
        </div>
        {course.status === "approved" && (
          <div className="d-flex align-items-center gap-2 text-success fw-semibold small">
            <span className="badge bg-success-subtle text-success fw-semibold">Trusted</span>
            <span>Approved by moderators</span>
          </div>
        )}
        {showStatus && (
          <div className="d-flex align-items-center gap-2 text-secondary small">
            <span className={statusClass}>{statusLabel}</span>
          </div>
        )}
        <div className="d-flex align-items-center gap-2 text-secondary small">
          <span className="fw-semibold">{course.instructor}</span>
          <span className="bullet" aria-hidden />
          <span>{course.lessons.length} lessons</span>
        </div>
        <h3 className="h5 fw-bold mb-0">
          <Link href={`/courses/${course.id}`} className="text-decoration-none text-reset">
            {course.title}
          </Link>
        </h3>
        <p className="text-secondary mb-0 flex-grow-1">{course.description}</p>
        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-light-subtle">
          <FavoriteButton courseId={course.id} origin="catalog" size="sm" />
          <Link href={`/courses/${course.id}`} className="btn btn-sm btn-outline-secondary px-3">
            View course
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
