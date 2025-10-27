'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const learningTracks = [
  "Frontend Development",
  "Backend Development",
  "Data & Analytics",
  "Product Design",
];

export default function SignupScreen() {
  const router = useRouter();
  const { authState, register } = useAuth();
  const [firstName, setFirstName] = useState("Ada");
  const [lastName, setLastName] = useState("Lovelace");
  const [email, setEmail] = useState("you@example.com");
  const [password, setPassword] = useState("learn1234");
  const [track, setTrack] = useState(learningTracks[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authState.status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [authState.status, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    const success = await register({
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: email.trim().toLowerCase(),
      password,
      bio: `Focused on ${track}`,
    });

    setIsSubmitting(false);

    if (!success) {
      setError("We couldn't create your account. Try again later.");
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <section className="py-5 py-lg-6">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-xl-6">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-lg-5">
                <h1 className="h3 fw-bold mb-3">Join ULearner</h1>
                <p className="text-secondary mb-4">
                  Create an account to unlock curated learning paths, community feedback, and course progress tracking.
                </p>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="firstName" className="form-label fw-semibold">
                        First name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Ada"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="lastName" className="form-label fw-semibold">
                        Last name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Lovelace"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signupEmail" className="form-label fw-semibold">
                      Email
                    </label>
                    <input
                      id="signupEmail"
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="signupPassword" className="form-label fw-semibold">
                      Password
                    </label>
                    <input
                      id="signupPassword"
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="track" className="form-label fw-semibold">
                      Primary learning track
                    </label>
                    <select
                      id="track"
                      className="form-select form-select-lg"
                      value={track}
                      onChange={(event) => setTrack(event.target.value)}
                    >
                      {learningTracks.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-check form-switch mt-2">
                    <input className="form-check-input" type="checkbox" role="switch" id="newsletter" defaultChecked />
                    <label className="form-check-label text-secondary" htmlFor="newsletter">
                      Send me updates about new courses and workshops
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg w-100 mt-3" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account…" : "Create account"}
                  </button>
                </form>

                <div className="border rounded-3 px-3 py-3 mt-4 bg-light">
                  <p className="small text-secondary mb-2">Demo accounts you can use right away:</p>
                  <ul className="list-unstyled small mb-0">
                    <li className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">learner@example.com</span>
                      <span className="font-monospace text-secondary">password123</span>
                    </li>
                    <li className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">mentor@example.com</span>
                      <span className="font-monospace text-secondary">mentor123</span>
                    </li>
                  </ul>
                </div>

                <p className="text-center text-secondary mt-4 mb-0">
                  Already have an account?{" "}
                  <Link href="/login" className="fw-semibold text-primary text-decoration-none">
                    Log in
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
