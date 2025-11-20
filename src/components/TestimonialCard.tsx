import Image from "next/image";
import type { CatalogTestimonial } from "@/types/catalog";

interface TestimonialCardProps {
  testimonial: CatalogTestimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const avatarSrc = testimonial.userAvatar ?? "https://www.gravatar.com/avatar/?d=mp";
  return (
    <div className="testimonial-card card h-100 border-0 position-relative overflow-hidden">
      <span className="testimonial-card-accent" aria-hidden />
      <div className="card-body d-flex flex-column gap-4">
        <div className="d-flex align-items-center gap-2 text-accent">
          <span className="quote-badge" aria-hidden>
            “
          </span>
          <span className="small fw-semibold text-uppercase letter-spacing-wide">Success story</span>
        </div>
        <p className="testimonial-quote mb-0">{testimonial.statement}</p>
        <div className="d-flex align-items-center gap-3 mt-auto">
          <Image src={avatarSrc} alt={testimonial.userName} width={48} height={48} className="rounded-circle" />
          <div>
            <p className="fw-semibold mb-0">{testimonial.userName}</p>
            <p className="text-secondary small mb-0">uLearner Student</p>
          </div>
        </div>
      </div>
    </div>
  );
}
