'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface EnrollButtonProps {
  courseId: number | string;
  className?: string;
}

export default function EnrollButton({ courseId, className }: EnrollButtonProps) {
  const router = useRouter();
  const { authState, joinCourse } = useAuth();
  const [isJoining, setIsJoining] = useState(false);

  const handleClick = () => {
    if (authState.status === "unauthenticated") {
      router.push(`/login?next=/courses/${courseId}`);
      return;
    }

    if (authState.status !== "authenticated") {
      return;
    }

    const alreadyJoined = authState.user.enrolledCourses.some(
      (progress) => String(progress.courseId) === String(courseId),
    );

    if (alreadyJoined) {
      router.push(`/dashboard/courses/${courseId}/learn`);
      return;
    }

    setIsJoining(true);
    joinCourse(courseId);
    setIsJoining(false);
    router.push(`/dashboard/courses/${courseId}/learn`);
  };

  return (
    <button type="button" className={className ?? "btn btn-primary"} onClick={handleClick} disabled={isJoining}>
      {isJoining ? "Joining..." : "Join this course"}
    </button>
  );
}

