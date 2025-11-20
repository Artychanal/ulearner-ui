import Link from "next/link";
import { notFound } from "next/navigation";
import type { CertificateApi } from "@/types/api";
import { getApiBaseUrl } from "@/lib/api";

async function fetchCertificate(certificateNumber: string): Promise<CertificateApi> {
  const response = await fetch(`${getApiBaseUrl()}/certificates/${certificateNumber}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to load certificate");
  }

  const payload = await response.json();
  return "data" in payload ? (payload.data as CertificateApi) : (payload as CertificateApi);
}

function formatHours(minutes: number) {
  if (!minutes || minutes <= 0) {
    return "1";
  }
  const hours = minutes / 60;
  const rounded = Math.max(1, Number(hours.toFixed(1)));
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
}

type CertificatePageProps = {
  params: Promise<{ certificateNumber: string }>;
};

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { certificateNumber } = await params;
  const certificate = await fetchCertificate(certificateNumber);
  const hours = formatHours(certificate.courseDurationMinutes);
  const downloadUrl = `${getApiBaseUrl()}/certificates/${certificate.certificateNumber}/pdf`;

  return (
    <section className="py-5 bg-light min-vh-100">
      <div className="container">
        <div className="mb-4">
          <Link href="/" className="text-decoration-none text-primary">
            ← Back to uLearner
          </Link>
        </div>
        <div className="card border-0 shadow-lg">
          <div className="card-body p-5">
            <p className="text-uppercase text-secondary small mb-2">Certificate #{certificate.certificateNumber}</p>
            <h1 className="h3 fw-bold mb-1">Certificate of Completion</h1>
            <p className="text-secondary mb-4">{certificate.platformSignature}</p>

            <p className="text-secondary small text-uppercase mb-2">Awarded to</p>
            <h2 className="display-6 fw-semibold mb-4">{certificate.recipientName}</h2>

            <p className="mb-2">
              Has successfully completed the course <strong>{certificate.courseTitle}</strong> instructed by{" "}
              <strong>{certificate.instructorName}</strong>.
            </p>
            <p className="mb-3">Total study time: approximately {hours} hours.</p>

            <p className="text-secondary mb-4">
              Issued on {new Date(certificate.issuedAt).toLocaleDateString()} · Verified by ULearner
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3">
              <Link href="/" className="btn btn-primary">
                Explore more courses
              </Link>
              <Link href={`/dashboard`} className="btn btn-outline-secondary">
                Go to dashboard
              </Link>
              <a href={downloadUrl} target="_blank" rel="noreferrer" className="btn btn-outline-dark">
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
