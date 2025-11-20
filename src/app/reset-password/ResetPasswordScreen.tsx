'use client';

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ResetPasswordScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { completePasswordReset } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <section className="py-5 py-lg-6">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-xl-5">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 p-lg-5 text-center">
                  <h1 className="h4 fw-bold mb-3">Reset link expired</h1>
                  <p className="text-secondary">
                    The link you followed is missing or invalid. Please request a new password reset.
                  </p>
                  <Link href="/forgot-password" className="btn btn-primary mt-3">
                    Request new link
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const success = await completePasswordReset(token, password);
    setIsSubmitting(false);
    if (!success) {
      setError("We could not update your password. The link may have expired.");
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <section className="py-5 py-lg-6">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-xl-5">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-lg-5">
                <h1 className="h3 fw-bold mb-3">Set a new password</h1>
                <p className="text-secondary mb-4">Choose a strong password to secure your account.</p>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="newPassword" className="form-label fw-semibold">
                      New password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="form-label fw-semibold">
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100" disabled={isSubmitting}>
                    {isSubmitting ? "Updating…" : "Update password"}
                  </button>
                </form>

                <p className="text-center text-secondary mt-4 mb-0">
                  Need a new link?{" "}
                  <Link href="/forgot-password" className="fw-semibold text-primary text-decoration-none">
                    Request reset
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
