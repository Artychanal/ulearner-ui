'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CourseEditor, { CourseEditorValues } from "@/components/dashboard/CourseEditor";
import { useAuth } from "@/context/AuthContext";

export default function NewCoursePage() {
  const router = useRouter();
  const { authState, createCourse } = useAuth();

  useEffect(() => {
    if (authState.status === "unauthenticated") {
      router.replace("/login");
    }
  }, [authState.status, router]);

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

  const handleSave = (course: CourseEditorValues) => {
    const { id, ...rest } = course;
    void id;
    const newId = createCourse(rest);
    router.push(`/dashboard/courses/${newId}/edit`);
  };

  return (
    <section className="py-5">
      <div className="container d-flex flex-column gap-4">
        <div>
          <h1 className="display-6 fw-bold mb-1">Create a new course</h1>
          <p className="text-secondary mb-0">
            Outline modules, upload content, and save to publish when you&apos;re ready.
          </p>
        </div>
        <CourseEditor submitLabel="Create course" onSave={handleSave} onCancel={() => router.push("/dashboard")} />
      </div>
    </section>
  );
}
