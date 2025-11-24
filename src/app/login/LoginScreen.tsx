'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authState, login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const googleButtonId = "google-signin-button";

  useEffect(() => {
    if (authState.status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [authState.status, router]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    type GoogleIdentity = {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (elem: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };

    const existing = document.getElementById("google-identity-script");
    const renderButton = () => {
      const googleIdentity = (window as typeof window & { google?: GoogleIdentity }).google;
      if (!googleIdentity || document.getElementById(`${googleButtonId}-rendered`)) {
        return;
      }
      googleIdentity.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) {
            setError("Google sign-in failed. Please try again.");
            return;
          }
          setIsSubmitting(true);
          const result = await loginWithGoogle(response.credential);
          setIsSubmitting(false);
          if (!result.success) {
            setError(result.error ?? "Google sign-in failed. Please try again.");
            return;
          }
          const redirectTo = searchParams.get("next") ?? "/dashboard";
          router.replace(redirectTo);
        },
      });
      const container = document.getElementById(googleButtonId);
      if (container) {
        googleIdentity.accounts.id.renderButton(container, {
          theme: "outline",
          size: "large",
          width: 360,
          shape: "pill",
          logo_alignment: "left",
          text: "continue_with",
        });
        container.id = `${googleButtonId}-rendered`;
        setIsGoogleReady(true);
      }
    };

    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.id = "google-identity-script";
      script.onload = renderButton;
      document.body.appendChild(script);
    } else {
      renderButton();
    }
  }, [loginWithGoogle, router, searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Invalid email or password. Please try again.");
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
                    <div className="text-end mt-2">
                      <Link href="/forgot-password" className="small text-decoration-none">
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in…" : "Log in"}
                  </button>
                </form>

                <div className="text-center my-3 text-secondary">or</div>
                <div className="d-flex justify-content-center mb-3">
                  <div id={googleButtonId} aria-disabled={!isGoogleReady} />
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
