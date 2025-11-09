import Image from "next/image";
import Link from "next/link";
import type { CatalogInstructor } from "@/types/catalog";

interface InstructorCardProps {
  instructor: CatalogInstructor;
}

export default function InstructorCard({ instructor }: InstructorCardProps) {
  const primaryDiscipline = instructor.title.includes(",")
    ? instructor.title.split(",")[0]?.trim() ?? instructor.title
    : instructor.title;
  const avatarSrc = instructor.avatarUrl ?? "https://www.gravatar.com/avatar/?d=identicon";
  const twitterHandle = instructor.twitter?.replace(/^@/, "");
  const linkedinHandle = instructor.linkedin?.replace(/^@/, "");

  return (
    <div className="instructor-card card h-100 border-0 position-relative overflow-hidden">
      <span className="instructor-card-accent" aria-hidden />
      <div className="card-body text-center d-flex flex-column gap-3">
        <div className="instructor-avatar-ring mx-auto">
          <Image src={avatarSrc} alt={instructor.name} width={96} height={96} className="rounded-circle" />
        </div>
        <span className="badge rounded-pill instructor-pill align-self-center">{primaryDiscipline}</span>
        <h3 className="h5 fw-bold mb-0">{instructor.name}</h3>
        <p className="text-accent small text-uppercase letter-spacing-wide mb-0">{instructor.title}</p>
        <p className="text-secondary small mb-0">{instructor.bio}</p>
        <div className="d-flex justify-content-center gap-3 mt-3">
          {twitterHandle && (
            <Link href={`https://twitter.com/${twitterHandle}`} target="_blank" className="btn btn-ghost btn-sm px-3">
              Twitter
            </Link>
          )}
          {linkedinHandle && (
            <Link href={`https://linkedin.com/in/${linkedinHandle}`} target="_blank" className="btn btn-ghost btn-sm px-3">
              LinkedIn
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
