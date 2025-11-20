'use client';

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setError(null);
    const success = await requestPasswordReset(email.trim());
    setIsSubmitting(false);
    if (success) {
      setStatus("success");
    } else {
      setStatus("error");
      setError("We couldn't send the reset email. Please try again in a moment.");
    }
  };

  return (
    <section className="py-5 py-lg-6">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-xl-5">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-lg-5">
                <h1 className="h3 fw-bold mb-3">Forgot password?</h1>
                <p className="text-secondary mb-4">
                  Enter the email you use for ULearner and we&apos;ll send a reset link.
                </p>

                {status === "success" && (
                  <div className="alert alert-success" role="alert">
                    If an account exists with <strong>{email}</strong>, we just sent instructions to reset your
                    password. The link is valid for 30 minutes.
                  </div>
                )}

                {status === "error" && error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="resetEmail" className="form-label fw-semibold">
                      Email
                    </label>
                    <input
                      id="resetEmail"
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send reset link"}
                  </button>
                </form>

                <p className="text-center text-secondary mt-4 mb-0">
                  Remembered your password?{" "}
                  <Link href="/login" className="fw-semibold text-primary text-decoration-none">
                    Back to login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
