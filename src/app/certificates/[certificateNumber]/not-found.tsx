import Link from "next/link";

export default function CertificateNotFound() {
  return (
    <section className="py-5">
      <div className="container text-center">
        <h1 className="h3 fw-bold mb-3">Certificate not found</h1>
        <p className="text-secondary mb-4">We couldn&apos;t find a certificate with that number. Double-check and try again.</p>
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    </section>
  );
}
