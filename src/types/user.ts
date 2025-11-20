import type {
  AuthoredCourse,
  EnrolledCourseProgress,
} from "@/types/course";

export type FavoriteCourse = {
  id?: string;
  courseId: number | string;
  origin: "catalog" | "authored";
  addedAt: string;
};

export type DemoAccount = {
  email: string;
  password: string;
  name: string;
  avatarUrl: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  password?: string;
  enrolledCourses: EnrolledCourseProgress[];
  authoredCourses: AuthoredCourse[];
  favoriteCourses: FavoriteCourse[];
};

export type AuthState =
  | {
      status: "authenticated";
      user: UserProfile;
    }
  | {
      status: "unauthenticated";
    }
  | {
      status: "loading";
    };
