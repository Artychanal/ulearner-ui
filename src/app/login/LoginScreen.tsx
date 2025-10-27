'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const demoAccounts = [
  { email: "learner@example.com", password: "password123" },
  { email: "mentor@example.com", password: "mentor123" },
];

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authState, login } = useAuth();
  const [email, setEmail] = useState(demoAccounts[0].email);
  const [password, setPassword] = useState(demoAccounts[0].password);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authState.status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [authState.status, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const success = await login(email, password);
    setIsSubmitting(false);

    if (!success) {
      setError("Invalid email or password. Use one of the demo accounts below.");
      return;
    }

    const redirectTo = searchParams.get("next") ?? "/dashboard";
    router.replace(redirectTo);
  };

  return (
    <section className="py-5 py-lg-6">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-xl-5">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-lg-5">
                <h1 className="h3 fw-bold mb-3">Welcome back</h1>
                <p className="text-secondary mb-4">
                  Log in with your email to continue learning.
                </p>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in…" : "Log in"}
                  </button>
                </form>

                <div className="border rounded-3 px-3 py-3 mt-4">
                  <p className="small text-secondary mb-2">Try the app with these demo accounts:</p>
                  <ul className="list-unstyled small mb-0">
                    {demoAccounts.map((account) => (
                      <li key={account.email} className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">{account.email}</span>
                        <span className="font-monospace text-secondary">{account.password}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-center text-secondary mt-4 mb-0">
                  New to ULearner?{" "}
                  <Link href="/signup" className="fw-semibold text-primary text-decoration-none">
                    Create an account
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
