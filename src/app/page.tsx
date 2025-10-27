import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import { courses } from "@/data/courses";
import { testimonials } from "@/data/testimonials";
import TestimonialCard from "@/components/TestimonialCard";
import { instructors } from "@/data/instructors";
import InstructorCard from "@/components/InstructorCard";
import AnimatedSection from "@/components/AnimatedSection";

const totalLessons = courses.reduce(
  (accumulator, course) => accumulator + course.lessons.length,
  0
);
const uniqueInstructors = new Set(courses.map((course) => course.instructor)).size;
const featuredCourse = courses[0] ?? null;

export default function Home() {
  return (
    <>
      <AnimatedSection className="hero-section py-5 py-lg-6 position-relative overflow-hidden">
        <div className="hero-blur" aria-hidden />
        <div className="container position-relative">
          <div className="row align-items-center gy-5">
            <div className="col-lg-7">
              <div className="hero-pill mb-4">New cohort launches every Monday</div>
              <h1 className="display-4 fw-bold mb-4">
                Supercharge your career with immersive, guided learning experiences.
              </h1>
              <p className="lead mb-4">
                Learn at your own pace with modular video lessons, hands-on projects, and support from mentors who ship real products.
              </p>
              <ul className="hero-checklist list-unstyled mb-4">
                <li>Live mentor feedback on every project</li>
                <li>Curated tracks for frontend, backend, and product design</li>
                <li>Community events, office hours, and career support</li>
              </ul>
              <div className="d-flex flex-wrap gap-3">
                <Link href="/courses" className="btn btn-primary btn-lg px-4">
                  Browse courses
                </Link>
                <Link href="/signup" className="btn btn-outline-secondary btn-lg px-4">
                  Start free trial
                </Link>
              </div>
              <section className="hero-metrics glass mt-5 p-4 rounded-4">
                <div className="hero-metric">
                  <p className="display-6 fw-bold mb-1">{courses.length}+</p>
                  <span>In-depth courses across tech</span>
                </div>
                <div className="hero-metric">
                  <p className="display-6 fw-bold mb-1">{totalLessons}</p>
                  <span>Lessons ready to explore today</span>
                </div>
                <div className="hero-metric">
                  <p className="display-6 fw-bold mb-1">{uniqueInstructors}</p>
                  <span>World-class mentors on call</span>
                </div>
              </section>
            </div>
            {featuredCourse && (
              <div className="col-lg-5">
                <article className="hero-card card border-0">
                  <div className="card-body p-4 p-lg-5 d-flex flex-column gap-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge rounded-pill text-uppercase small text-primary-emphasis bg-primary-subtle">
                        Featured track
                      </span>
                      <span className="badge rounded-pill bg-dark-subtle text-white-75">
                        ${featuredCourse.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <h2 className="h4 fw-bold mb-0">{featuredCourse.title}</h2>
                      <p className="text-secondary mb-0">{featuredCourse.description}</p>
                    </div>
                    <ul className="list-unstyled hero-card-list mb-0 d-flex flex-column gap-2 text-secondary small">
                      <li>
                        <span className="hero-card-dot" aria-hidden /> {featuredCourse.lessons.length} lessons led by{" "}
                        {featuredCourse.instructor}
                      </li>
                      <li>
                        <span className="hero-card-dot" aria-hidden /> Lifetime access, updated monthly
                      </li>
                      <li>
                        <span className="hero-card-dot" aria-hidden /> Project templates and mentor feedback
                      </li>
                    </ul>
                    <Link href={`/courses/${featuredCourse.id}`} className="btn btn-primary w-100">
                      Explore track
                    </Link>
                  </div>
                </article>
              </div>
            )}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="container py-5" id="courses">
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
          <div>
            <h2 className="h3 fw-bold mb-2">Trending courses</h2>
            <p className="text-secondary mb-0">
              Hand-picked modules to sharpen your skills in development, design, and product.
            </p>
          </div>
          <Link href="/signup" className="text-decoration-none fw-semibold text-primary">
            Become a member →
          </Link>
        </div>
        <div className="row g-4 mt-1">
          {courses.map((course) => (
            <div key={course.id} className="col-md-6 col-lg-4">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="container py-5" id="testimonials">
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
          <div>
            <h2 className="h3 fw-bold mb-2">What our students are saying</h2>
            <p className="text-secondary mb-0">
              Hear from learners who have transformed their careers with uLearner.
            </p>
          </div>
          <Link href="/signup" className="text-decoration-none fw-semibold text-primary">
            Join the community →
          </Link>
        </div>
        <div className="row g-4 mt-1">
          {testimonials.map((testimonial) => (
            <div key={testimonial.user.id} className="col-md-6 col-lg-4">
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="container py-5" id="instructors">
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
          <div>
            <h2 className="h3 fw-bold mb-2">Meet the instructors</h2>
            <p className="text-secondary mb-0">
              Learn from industry experts who are passionate about teaching.
            </p>
          </div>
          <Link href="/signup" className="text-decoration-none fw-semibold text-primary">
            View all instructors →
          </Link>
        </div>
        <div className="row g-4 mt-1">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="col-md-6 col-lg-4">
              <InstructorCard instructor={instructor} />
            </div>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection className="features-section py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card h-100 p-4 rounded-4">
                <h3 className="h5 fw-semibold mb-2">Project-based learning</h3>
                <p className="text-secondary mb-0">
                  Apply new concepts with downloadable templates and guided projects for each module.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card h-100 p-4 rounded-4">
                <h3 className="h5 fw-semibold mb-2">Flexible pace</h3>
                <p className="text-secondary mb-0">
                  Bite-sized lessons help you make progress in the time you have—on desktop or mobile.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card h-100 p-4 rounded-4">
                <h3 className="h5 fw-semibold mb-2">Community support</h3>
                <p className="text-secondary mb-0">
                  Get feedback from instructors and peers with forums, live sessions, and office hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
