"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type CertificateListItem = {
  certificateNumber: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
  downloadUrl: string;
};

export default function CertificatesPage() {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authState.status === "unauthenticated") {
      router.replace("/login");
    }
  }, [authState.status, router]);

  const certificates: CertificateListItem[] = useMemo(() => {
    if (authState.status !== "authenticated") {
      return [];
    }
    return authState.user.enrolledCourses
      .filter((progress) => Boolean(progress.certificate))
      .map((progress) => {
        const certificate = progress.certificate!;
        return {
          certificateNumber: certificate.certificateNumber,
          courseTitle: certificate.courseTitle,
          instructorName: certificate.instructorName,
          issuedAt: certificate.issuedAt,
          downloadUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1"}/certificates/${certificate.certificateNumber}/pdf`,
        } satisfies CertificateListItem;
      })
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }, [authState]);

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
            <h1 className="display-6 fw-bold mb-1">Your certificates</h1>
            <p className="text-secondary mb-0">All certificates you&apos;ve earned across ULearner courses.</p>
          </div>
          <Link href="/dashboard" className="btn btn-outline-secondary">
            Back to dashboard
          </Link>
        </header>

        {certificates.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-5 text-center">
              <p className="text-secondary mb-3">You don&apos;t have any certificates yet.</p>
              <Link href="/courses" className="btn btn-primary">
                Browse courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {certificates.map((certificate) => (
              <div key={certificate.certificateNumber} className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4 d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <p className="text-secondary small text-uppercase mb-1">Certificate #{certificate.certificateNumber}</p>
                        <h2 className="h5 fw-semibold mb-1">{certificate.courseTitle}</h2>
                        <p className="text-secondary mb-0">Instructor: {certificate.instructorName}</p>
                      </div>
                      <span className="badge rounded-pill text-bg-light">PDF</span>
                    </div>
                    <p className="text-secondary small mb-0">Issued on {new Date(certificate.issuedAt).toLocaleDateString()}</p>
                    <div className="d-flex flex-wrap gap-2 mt-auto">
                      <Link
                        href={`/certificates/${certificate.certificateNumber}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        View
                      </Link>
                      <a
                        href={certificate.downloadUrl}
                        className="btn btn-sm btn-outline-dark"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download PDF
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
