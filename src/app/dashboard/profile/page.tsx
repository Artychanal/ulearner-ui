'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=identicon";

type Feedback =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

type FormState = {
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  password: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { authState, updateProfile, logout, uploadMedia } = useAuth();
  const [formState, setFormState] = useState<FormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (authState.status === "unauthenticated") {
      router.replace("/login");
    }
  }, [authState.status, router]);

  useEffect(() => {
    if (authState.status === "authenticated") {
      const { user } = authState;
      setFormState({
        name: user.name ?? "",
        email: user.email ?? "",
        avatarUrl: user.avatarUrl || DEFAULT_AVATAR,
        bio: user.bio ?? "",
        password: "",
      });
    }
  }, [authState]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const suggestedAvatars = useMemo(() => {
    if (authState.status !== "authenticated") {
      return [];
    }

    const baseHandle = authState.user.email || authState.user.name || "learner";

    return [
      `https://i.pravatar.cc/300?u=${encodeURIComponent(baseHandle)}`,
      "https://i.pravatar.cc/300?img=47",
      "https://i.pravatar.cc/300?img=52",
      "https://www.gravatar.com/avatar/?d=identicon",
    ];
  }, [authState]);

  if (authState.status !== "authenticated" || !formState) {
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

  const { user } = authState;
  const currentAvatarSrc = avatarPreviewUrl ?? (formState.avatarUrl || DEFAULT_AVATAR);

  const handleAvatarUrlChange = (avatarUrl: string) => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
    }
    setPendingAvatarFile(null);
    setFormState((previous) => (previous ? { ...previous, avatarUrl } : previous));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target;
    setFormState((previous) => (previous ? { ...previous, [id]: value } : previous));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", message: "Upload an image file (PNG or JPG)." });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setPendingAvatarFile(file);
    setAvatarPreviewUrl(previewUrl);
    setFormState((previous) => (previous ? { ...previous, avatarUrl: previewUrl } : previous));
    setFeedback({ type: "success", message: "Avatar preview updated. Save changes to keep it." });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const initialAvatar = pendingAvatarFile
        ? avatarPreviewUrl ?? formState.avatarUrl ?? DEFAULT_AVATAR
        : formState.avatarUrl || avatarPreviewUrl || DEFAULT_AVATAR;
      const payload: Partial<Pick<FormState, "name" | "email" | "avatarUrl" | "bio" | "password">> = {
        name: formState.name,
        email: formState.email,
        avatarUrl: initialAvatar,
        bio: formState.bio,
      };

      if (formState.password.trim()) {
        payload.password = formState.password;
      }

      let finalAvatarUrl = payload.avatarUrl;
      if (pendingAvatarFile) {
        try {
          const uploaded = await uploadMedia(pendingAvatarFile);
          console.log('Upload completed', uploaded);
          finalAvatarUrl = uploaded;
          handleAvatarUrlChange(uploaded);
          setPendingAvatarFile(null);
        } catch (uploadError) {
          console.error(uploadError);
          setFeedback({ type: "error", message: "We couldn't upload the image. Try again." });
          setIsSaving(false);
          return;
        } finally {
          if (avatarPreviewUrl) {
            URL.revokeObjectURL(avatarPreviewUrl);
            setAvatarPreviewUrl(null);
          }
        }
      }

      console.log('Submitting profile update', {
        ...payload,
        avatarUrl: finalAvatarUrl,
        hasPendingFile: Boolean(pendingAvatarFile),
      });

      const success = await updateProfile({
        ...payload,
        avatarUrl: finalAvatarUrl,
      });

      if (!success) {
        throw new Error("Profile update failed");
      }

      setFeedback({ type: "success", message: "Profile updated successfully." });
      setFormState((previous) =>
        previous
          ? {
              ...previous,
              password: "",
            }
          : previous,
      );
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", message: "We couldn't update your profile. Try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="py-5">
      <div className="container">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
          <div>
            <h1 className="display-6 fw-bold mb-1">Your profile</h1>
            <p className="text-secondary mb-0">Manage how others see you across ULearner.</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link href="/dashboard" className="btn btn-outline-secondary">
              Back to dashboard
            </Link>
            <button type="button" className="btn btn-outline-danger" onClick={logout}>
              Log out
            </button>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 d-flex flex-column gap-4">
                <div className="text-center">
                  <div className="mx-auto rounded-circle overflow-hidden border" style={{ width: 160, height: 160 }}>
                    <Image
                      src={currentAvatarSrc}
                      alt={formState.name || "Profile avatar"}
                      width={160}
                      height={160}
                      priority
                      unoptimized
                      className="object-fit-cover w-100 h-100"
                    />
                  </div>
                  <p className="text-secondary small mt-3 mb-0">Recommended: square image, at least 160px.</p>
                </div>

                <div className="d-flex flex-column gap-3">
                  <p className="text-secondary small mb-0">
                    Upload a photo from your device or pick one of the presets below. The exact link to the uploaded image is
                    stored securely on the server.
                  </p>
                  <div>
                    <label htmlFor="avatarUpload" className="btn btn-sm btn-outline-primary w-100">
                      Upload image
                      <input
                        id="avatarUpload"
                        type="file"
                        accept="image/*"
                        className="visually-hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {suggestedAvatars.map((url) => (
                      <button
                        key={url}
                        type="button"
                        className={`btn btn-sm ${formState.avatarUrl === url ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => handleAvatarUrlChange(url)}
                      >
                        Use this
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleAvatarUrlChange(DEFAULT_AVATAR)}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-lg-5">
                <form className="d-flex flex-column gap-4" onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label htmlFor="name" className="form-label fw-semibold">
                        Full name
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Ada Lovelace"
                        value={formState.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label fw-semibold">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="form-control form-control-lg"
                        value={formState.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="form-label fw-semibold">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      className="form-control form-control-lg"
                      value={formState.bio}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell learners about your goals, skills, and interests."
                    />
                    <span className="text-secondary small d-block mt-1">
                      Your bio appears on the courses you teach and your learner profile.
                    </span>
                  </div>

                  <div>
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="form-control form-control-lg"
                      value={formState.password}
                      minLength={6}
                      onChange={handleChange}
                      placeholder="Enter a new password"
                    />
                    <span className="text-secondary small d-block mt-1">Leave blank to keep your current password.</span>
                  </div>

                  {feedback && (
                    <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"} mb-0`} role="alert">
                      {feedback.message}
                    </div>
                  )}

                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary btn-lg" disabled={isSaving}>
                      {isSaving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body p-4">
                <h2 className="h5 fw-semibold mb-3">Account details</h2>
                <dl className="row mb-0">
                  <dt className="col-sm-4 text-secondary">Account ID</dt>
                  <dd className="col-sm-8 font-monospace">{user.id}</dd>
                  <dt className="col-sm-4 text-secondary">Courses joined</dt>
                  <dd className="col-sm-8">{user.enrolledCourses.length}</dd>
                  <dt className="col-sm-4 text-secondary">Courses authored</dt>
                  <dd className="col-sm-8">{user.authoredCourses.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
