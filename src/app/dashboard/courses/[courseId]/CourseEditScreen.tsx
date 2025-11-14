'use client';

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import CourseEditor, { CourseEditorValues } from "@/components/dashboard/CourseEditor";
import { useAuth } from "@/context/AuthContext";

export default function CourseEditScreen({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { authState, updateCourse } = useAuth();

  useEffect(() => {
    if (authState.status === "unauthenticated") {
      router.replace("/login");
    }
  }, [authState.status, router]);

  const course = useMemo(() => {
    if (authState.status !== "authenticated") {
      return null;
    }
    return authState.user.authoredCourses.find((item) => item.id === courseId) ?? null;
  }, [authState, courseId]);

  const editorInitialCourse = useMemo(() => {
    if (!course) {
      return null;
    }
    const { lastUpdated, ...rest } = course;
    void lastUpdated;
    return rest;
  }, [course]);

  useEffect(() => {
    if (authState.status === "authenticated" && !course) {
      router.replace("/dashboard");
    }
  }, [authState.status, course, router]);

  if (authState.status !== "authenticated" || !course) {
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

  const handleSave = async (values: CourseEditorValues) => {
    await updateCourse({
      ...course,
      ...values,
    });
    router.push("/dashboard");
  };

  return (
    <section className="py-5">
      <div className="container d-flex flex-column gap-4">
        <div>
          <h1 className="display-6 fw-bold mb-1">Edit course</h1>
          <p className="text-secondary mb-0">
            Update modules, add new content, and keep your students engaged.
          </p>
        </div>
        <CourseEditor
          initialCourse={editorInitialCourse ?? undefined}
          submitLabel="Save changes"
          onSave={handleSave}
          onCancel={() => router.push("/dashboard")}
        />
      </div>
    </section>
  );
}
