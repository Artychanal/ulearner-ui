"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthState, FavoriteCourse, UserProfile } from "@/types/user";
import type {
  AuthoredCourse,
  CourseReview,
  CourseSummary,
  EnrolledCourseProgress,
  QuizAttempt,
} from "@/types/course";
import { fetchCatalogCourses } from "@/lib/catalog-service";
import { adaptCatalogCourse } from "@/lib/catalog-adapter";
import {
  loadAuthTokens,
  persistAuthTokens,
  clearAuthTokens as removeStoredTokens,
  type AuthTokens,
} from "@/lib/auth-storage";
import {
  loginUser,
  registerUser,
  refreshSession,
  fetchCurrentUser,
  updateUserProfile as updateUserProfileApi,
  requestPasswordReset as requestPasswordResetApi,
  resetPasswordWithToken,
  loginWithGoogle as loginWithGoogleApi,
} from "@/lib/auth-service";
import {
  fetchEnrollments,
  joinCourse as joinCourseApi,
  updateEnrollmentProgress,
} from "@/lib/enrollment-service";
import {
  fetchFavorites as fetchFavoritesApi,
  toggleFavorite as toggleFavoriteApi,
} from "@/lib/favorites-service";
import { uploadMedia as uploadMediaApi, type MediaUploadResponse } from "@/lib/media-service";
import {
  fetchAuthoredCourses,
  createAuthoredCourse,
  updateAuthoredCourse,
  deleteAuthoredCourse,
  fetchAuthoredCourseAnalytics,
  type CourseAnalytics,
} from "@/lib/authored-courses-service";
import { submitCourseReview as submitCourseReviewApi } from "@/lib/course-reviews-service";
import type { ApiUser, EnrollmentApi, FavoriteApi, ApiAuthoredCourse } from "@/types/api";
import type { ApiError } from "@/lib/api";

const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp";

type AuthContextValue = {
  authState: AuthState;
  catalog: CourseSummary[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; error?: string }>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    bio?: string;
    avatarUrl?: string;
  }) => Promise<boolean>;
  logout: () => void;
  joinCourse: (courseId: number | string) => Promise<boolean>;
  updateProgress: (progress: EnrolledCourseProgress) => Promise<void>;
  createCourse: (course: Omit<AuthoredCourse, "id" | "lastUpdated">) => Promise<string>;
  updateCourse: (course: AuthoredCourse) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  fetchCourseAnalytics: (courseId: string) => Promise<CourseAnalytics>;
  updateProfile: (
    updates: Partial<Pick<UserProfile, "name" | "email" | "avatarUrl" | "bio" | "password">>,
  ) => Promise<boolean>;
  toggleFavorite: (courseId: number | string, origin: FavoriteCourse["origin"]) => Promise<void>;
  uploadMedia: (file: File) => Promise<MediaUploadResponse>;
  submitCourseReview: (courseId: string, payload: { rating: number; comment?: string }) => Promise<CourseReview>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  completePasswordReset: (token: string, password: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isUnauthorized(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as ApiError).status === 401;
}

function transformEnrollment(enrollment: EnrollmentApi): EnrolledCourseProgress {
  return {
    enrollmentId: enrollment.id,
    courseId: enrollment.course.id,
    progress: enrollment.progress ?? 0,
    completedLessons: enrollment.completedLessons ?? [],
    quizAttempts: (enrollment.quizAttempts ?? []) as QuizAttempt[],
    lastAccessed: enrollment.lastAccessed ?? new Date().toISOString(),
    origin: enrollment.origin ?? "catalog",
    certificate: enrollment.certificate
      ? {
          id: enrollment.certificate.id,
          certificateNumber: enrollment.certificate.certificateNumber,
          courseTitle: enrollment.certificate.courseTitle,
          instructorName: enrollment.certificate.instructorName,
          recipientName: enrollment.certificate.recipientName,
          courseDurationMinutes: enrollment.certificate.courseDurationMinutes,
          platformSignature: enrollment.certificate.platformSignature,
          issuedAt: enrollment.certificate.issuedAt,
        }
      : null,
  };
}

function transformFavorite(favorite: FavoriteApi): FavoriteCourse {
  return {
    id: favorite.id,
    courseId: favorite.course.id,
    origin: favorite.origin,
    addedAt: favorite.addedAt ?? new Date().toISOString(),
  };
}

function adaptAuthoredCourse(course: ApiAuthoredCourse): AuthoredCourse {
  const modulesArray = Array.isArray(course.modules) ? (course.modules as AuthoredCourse["modules"]) : [];
  return {
    id: course.id,
    title: course.title,
    instructor: course.instructor,
    description: course.description,
    price: course.price,
    category: course.category,
    imageUrl: course.imageUrl ?? "/course-thumbnails/nextjs.svg",
    isPublished: course.isPublished,
    modules: modulesArray,
    lastUpdated: course.updatedAt,
  };
}

function mapUserProfile(
  apiUser: ApiUser,
  enrolledCourses: EnrolledCourseProgress[],
  favoriteCourses: FavoriteCourse[],
  authoredCourses: AuthoredCourse[],
): UserProfile {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    avatarUrl: apiUser.avatarUrl || DEFAULT_AVATAR,
    bio: apiUser.bio,
    enrolledCourses,
    authoredCourses,
    favoriteCourses,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });
  const [catalog, setCatalog] = useState<CourseSummary[]>([]);
  const [authTokens, setAuthTokensState] = useState<AuthTokens | null>(null);

  const persistTokens = useCallback((tokens: AuthTokens | null) => {
    setAuthTokensState(tokens);
    if (tokens) {
      persistAuthTokens(tokens);
    } else {
      removeStoredTokens();
    }
  }, []);

  const mergeCatalogCourses = useCallback((courses: CourseSummary[]) => {
    if (courses.length === 0) {
      return;
    }
    setCatalog((current) => {
      const map = new Map(current.map((course) => [String(course.id), course]));
      let changed = false;
      courses.forEach((course) => {
        const key = String(course.id);
        const existing = map.get(key);
        if (!existing || existing !== course) {
          map.set(key, course);
          changed = true;
        }
      });
      return changed ? Array.from(map.values()) : current;
    });
  }, []);

  const hydrateSession = useCallback(
    async (tokens: AuthTokens) => {
      const [userDto, enrollmentsDto, favoritesDto, authoredCoursesDto] = await Promise.all([
        fetchCurrentUser(tokens.accessToken),
        fetchEnrollments(tokens.accessToken),
        fetchFavoritesApi(tokens.accessToken),
        fetchAuthoredCourses(tokens.accessToken),
      ]);

      const relatedCourses = [
        ...enrollmentsDto.map((enrollment) => adaptCatalogCourse(enrollment.course)),
        ...favoritesDto.map((favorite) => adaptCatalogCourse(favorite.course)),
      ];
      mergeCatalogCourses(relatedCourses);

      const enrolledCourses = enrollmentsDto.map(transformEnrollment);
      const favoriteCourses = favoritesDto.map(transformFavorite);
      const authoredCourses = authoredCoursesDto.map(adaptAuthoredCourse);

      setAuthState({
        status: "authenticated",
        user: mapUserProfile(userDto, enrolledCourses, favoriteCourses, authoredCourses),
      });
    },
    [mergeCatalogCourses],
  );

  const resetSession = useCallback(() => {
    persistTokens(null);
    setAuthState({ status: "unauthenticated" });
  }, [persistTokens]);

  const refreshTokens = useCallback(
    async (refreshToken: string) => {
      const response = await refreshSession(refreshToken);
      const tokens = { accessToken: response.accessToken, refreshToken: response.refreshToken };
      persistTokens(tokens);
      setAuthState((previous) => {
        if (previous.status !== "authenticated") {
          return previous;
        }
        return {
          status: "authenticated",
          user: {
            ...previous.user,
            name: response.user.name,
            email: response.user.email,
            avatarUrl: response.user.avatarUrl || previous.user.avatarUrl,
            bio: response.user.bio ?? previous.user.bio,
          },
        };
      });
      return tokens;
    },
    [persistTokens],
  );

  const performAuthedRequest = useCallback(
    async <T,>(operation: (tokens: AuthTokens) => Promise<T>): Promise<T> => {
      if (!authTokens) {
        throw new Error("Not authenticated");
      }
      try {
        return await operation(authTokens);
      } catch (error) {
        if (isUnauthorized(error) && authTokens.refreshToken) {
          const nextTokens = await refreshTokens(authTokens.refreshToken);
          return operation(nextTokens);
        }
        throw error;
      }
    },
    [authTokens, refreshTokens],
  );

  useEffect(() => {
    let active = true;

    async function loadCatalogData() {
      try {
        const response = await fetchCatalogCourses({ limit: 200 });
        if (active) {
          setCatalog(response.items.map(adaptCatalogCourse));
        }
      } catch (error) {
        console.error("Failed to load catalog", error);
      }
    }

    loadCatalogData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrapSession() {
      const storedTokens = loadAuthTokens();
      if (!storedTokens) {
        setAuthState({ status: "unauthenticated" });
        return;
      }

      persistTokens(storedTokens);
      try {
        await hydrateSession(storedTokens);
      } catch (error) {
        console.error("Failed to hydrate session", error);
        if (mounted) {
          resetSession();
        }
      }
    }

    startTransition(() => {
      bootstrapSession();
    });

    return () => {
      mounted = false;
    };
  }, [hydrateSession, persistTokens, resetSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await loginUser({ email, password });
        const tokens = { accessToken: response.accessToken, refreshToken: response.refreshToken };
        persistTokens(tokens);
        await hydrateSession(tokens);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        console.error("Login failed", error);
        resetSession();
        return { success: false, error: message };
      }
    },
    [hydrateSession, persistTokens, resetSession],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      try {
        const response = await loginWithGoogleApi({ idToken });
        const tokens = { accessToken: response.accessToken, refreshToken: response.refreshToken };
        persistTokens(tokens);
        await hydrateSession(tokens);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Google login failed";
        console.error("Google login failed", error);
        resetSession();
        return { success: false, error: message };
      }
    },
    [hydrateSession, persistTokens, resetSession],
  );

  const register = useCallback(
    async ({ name, email, password, bio, avatarUrl }: { name: string; email: string; password: string; bio?: string; avatarUrl?: string }) => {
      try {
        const response = await registerUser({ name, email, password, bio, avatarUrl });
        const tokens = { accessToken: response.accessToken, refreshToken: response.refreshToken };
        persistTokens(tokens);
        await hydrateSession(tokens);
        return true;
      } catch (error) {
        console.error("Registration failed", error);
        resetSession();
        return false;
      }
    },
    [hydrateSession, persistTokens, resetSession],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      await requestPasswordResetApi({ email });
      return true;
    } catch (error) {
      console.error("Failed to request password reset", error);
      return false;
    }
  }, []);

  const completePasswordReset = useCallback(
    async (token: string, password: string) => {
      try {
        const response = await resetPasswordWithToken({ token, password });
        const tokens = { accessToken: response.accessToken, refreshToken: response.refreshToken };
        persistTokens(tokens);
        await hydrateSession(tokens);
        return true;
      } catch (error) {
        console.error("Failed to reset password", error);
        resetSession();
        return false;
      }
    },
    [hydrateSession, persistTokens, resetSession],
  );

  const logout = useCallback(() => {
    resetSession();
    router.push("/login");
  }, [resetSession, router]);

  const joinCourse = useCallback(
    async (courseId: number | string) => {
      if (authState.status !== "authenticated") {
        return false;
      }

      const alreadyJoined = authState.user.enrolledCourses.some(
        (progress) => String(progress.courseId) === String(courseId),
      );
      if (alreadyJoined) {
        return true;
      }

      try {
        const enrollment = await performAuthedRequest((tokens) =>
          joinCourseApi(tokens.accessToken, { courseId: String(courseId), origin: "catalog" }),
        );
        const courseSummary = adaptCatalogCourse(enrollment.course);
        mergeCatalogCourses([courseSummary]);
        const normalized = transformEnrollment(enrollment);

        setAuthState((previous) => {
          if (previous.status !== "authenticated") {
            return previous;
          }
          return {
            status: "authenticated",
            user: {
              ...previous.user,
              enrolledCourses: [...previous.user.enrolledCourses, normalized],
            },
          };
        });
        return true;
      } catch (error) {
        if (isUnauthorized(error)) {
          resetSession();
        }
        console.error("Failed to join course", error);
        return false;
      }
    },
    [authState, mergeCatalogCourses, performAuthedRequest, resetSession],
  );

  const updateProgress = useCallback(
    async (progressUpdate: EnrolledCourseProgress) => {
      if (authState.status !== "authenticated") {
        return;
      }

      const enrollmentId =
        progressUpdate.enrollmentId ||
        authState.user.enrolledCourses.find(
          (progress) => String(progress.courseId) === String(progressUpdate.courseId),
        )?.enrollmentId;

      if (!enrollmentId) {
        return;
      }

      try {
        const enrollment = await performAuthedRequest((tokens) =>
          updateEnrollmentProgress(tokens.accessToken, {
            enrollmentId,
            progress: progressUpdate.progress,
            completedLessons: progressUpdate.completedLessons,
            quizAttempts: progressUpdate.quizAttempts,
          }),
        );
        const normalized = transformEnrollment(enrollment);

        setAuthState((previous) => {
          if (previous.status !== "authenticated") {
            return previous;
          }
          return {
            status: "authenticated",
            user: {
              ...previous.user,
              enrolledCourses: previous.user.enrolledCourses.map((progress) =>
                progress.enrollmentId === normalized.enrollmentId
                  ? normalized
                  : progress,
              ),
            },
          };
        });
      } catch (error) {
        if (isUnauthorized(error)) {
          resetSession();
        }
        console.error("Failed to update progress", error);
      }
    },
    [authState, performAuthedRequest, resetSession],
  );

  const createCourse = useCallback(
    async (draft: Omit<AuthoredCourse, "id" | "lastUpdated">) => {
      if (authState.status !== "authenticated") {
        throw new Error("User must be authenticated to create a course");
      }

      try {
        const course = await performAuthedRequest((tokens) =>
          createAuthoredCourse(tokens.accessToken, {
            title: draft.title,
            instructor: draft.instructor,
            description: draft.description,
            price: draft.price,
            category: draft.category,
            imageUrl: draft.imageUrl,
            isPublished: draft.isPublished,
            modules: draft.modules,
          }),
        );
        const normalized = adaptAuthoredCourse(course);

        setAuthState((previous) => {
          if (previous.status !== "authenticated") {
            return previous;
          }
          return {
            status: "authenticated",
            user: {
              ...previous.user,
              authoredCourses: [normalized, ...previous.user.authoredCourses],
            },
          };
        });

        return normalized.id;
      } catch (error) {
        if (isUnauthorized(error)) {
          resetSession();
        }
        console.error("Failed to create course", error);
        throw error;
      }
    },
    [authState.status, performAuthedRequest, resetSession],
  );

  const updateCourse = useCallback(
    async (course: AuthoredCourse) => {
      try {
        const updated = await performAuthedRequest((tokens) =>
          updateAuthoredCourse(tokens.accessToken, course.id, {
            title: course.title,
            instructor: course.instructor,
            description: course.description,
            price: course.price,
            category: course.category,
            imageUrl: course.imageUrl,
            isPublished: course.isPublished,
            modules: course.modules,
          }),
        );
        const normalized = adaptAuthoredCourse(updated);

        setAuthState((previous) => {
          if (previous.status !== "authenticated") {
            return previous;
          }

          return {
            status: "authenticated",
            user: {
              ...previous.user,
              authoredCourses: previous.user.authoredCourses.map((existing) =>
                existing.id === normalized.id ? normalized : existing,
              ),
            },
          };
        });
      } catch (error) {
        if (isUnauthorized(error)) {
          resetSession();
        }
        console.error("Failed to update course", error);
        throw error;
      }
    },
    [performAuthedRequest, resetSession],
  );

  const deleteCourse = useCallback(
    async (courseId: string) => {
      try {
        await performAuthedRequest((tokens) => deleteAuthoredCourse(tokens.accessToken, courseId));

        setAuthState((previous) => {
          if (previous.status !== "authenticated") {
            return previous;
          }
          const courseIdStr = String(courseId);
          return {
            status: "authenticated",
            user: {
              ...previous.user,
              authoredCourses: previous.user.authoredCourses.filter(
                (existing) => String(existing.id) !== courseIdStr,
              ),
              enrolledCourses: previous.user.enrolledCourses.filter(
                (enrollment) => String(enrollment.courseId) !== courseIdStr,
              ),
              favoriteCourses: previous.user.favoriteCourses.filter(
                (favorite) => String(favorite.courseId) !== courseIdStr,
              ),
            },
          };
        });

        setCatalog((current) => current.filter((course) => String(course.id) !== String(courseId)));
      } catch (error) {
        if (isUnauthorized(error)) {
          resetSession();
        }
        console.error("Failed to delete course", error);
        throw error;
      }
    },
    [performAuthedRequest, resetSession],
  );

  const fetchCourseAnalytics = useCallback(
    async (courseId: string) => {
      return performAuthedRequest((tokens) => fetchAuthoredCourseAnalytics(tokens.accessToken, courseId));
    },
    [performAuthedRequest],
  );

  const updateProfile = useCallback(
    async (updates: Partial<Pick<UserProfile, "name" | "email" | "avatarUrl" | "bio" | "password">>) => {
      if (authState.status !== "authenticated") {
        return false;
      }

      const cleanedUpdates = {
        ...updates,
        name: updates.name?.trim(),
        email: updates.email?.trim().toLowerCase(),
        avatarUrl: updates.avatarUrl?.trim(),
        bio: updates.bio?.trim(),
        password: updates.password?.trim(),
      };

      try {
        const user = await performAuthedRequest((tokens) =>
          updateUserProfileApi(tokens.accessToken, cleanedUpdates),
        );

        setAuthState((previous) => {
          if (previous.status !== "authenticated") {
            return previous;
          }
          return {
            status: "authenticated",
            user: {
              ...previous.user,
              name: user.name,
              email: user.email,
              avatarUrl: user.avatarUrl ?? cleanedUpdates.avatarUrl ?? previous.user.avatarUrl,
              bio: user.bio ?? cleanedUpdates.bio ?? previous.user.bio,
            },
          };
        });
        return true;
      } catch (error) {
        if (isUnauthorized(error)) {
          resetSession();
        }
        console.error("Failed to update profile", error);
        return false;
      }
    },
    [authState.status, performAuthedRequest, resetSession],
  );

  const toggleFavorite = useCallback(
    async (courseId: number | string, origin: FavoriteCourse["origin"]) => {
      if (authState.status !== "authenticated") {
        return;
      }

      try {
        const result = await performAuthedRequest((tokens) =>
          toggleFavoriteApi(tokens.accessToken, { courseId: String(courseId), origin }),
        );

        if (!result.removed && result.favorite) {
          mergeCatalogCourses([adaptCatalogCourse(result.favorite.course)]);
        }

        setAuthState((previous) => {
          if (previous.status !== "authenticated") {
            return previous;
          }

          if (result.removed) {
            return {
              status: "authenticated",
              user: {
                ...previous.user,
                favoriteCourses: previous.user.favoriteCourses.filter(
                  (favorite) =>
                    !(String(favorite.courseId) === String(courseId) && favorite.origin === origin),
                ),
              },
            };
          }

          const nextFavorite = result.favorite ? transformFavorite(result.favorite) : null;

          return {
            status: "authenticated",
            user: {
              ...previous.user,
              favoriteCourses: nextFavorite
                ? [...previous.user.favoriteCourses, nextFavorite]
                : previous.user.favoriteCourses,
            },
          };
        });
      } catch (error) {
        if (isUnauthorized(error)) {
          resetSession();
        }
        console.error("Failed to toggle favorite", error);
      }
    },
    [authState.status, mergeCatalogCourses, performAuthedRequest, resetSession],
  );

  const uploadMedia = useCallback(
    async (file: File) => {
      if (authState.status !== "authenticated") {
        throw new Error("You must be logged in to upload media");
      }
      return performAuthedRequest((tokens) => uploadMediaApi(tokens.accessToken, file));
    },
    [authState.status, performAuthedRequest],
  );

  const submitCourseReview = useCallback(
    async (courseId: string, payload: { rating: number; comment?: string }) => {
      if (authState.status !== "authenticated") {
        throw new Error("You must be logged in to leave a review");
      }
      return performAuthedRequest((tokens) =>
        submitCourseReviewApi(tokens.accessToken, courseId, payload),
      );
    },
    [authState.status, performAuthedRequest],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      authState,
      catalog,
      login,
      loginWithGoogle,
      register,
      requestPasswordReset,
      completePasswordReset,
      logout,
      joinCourse,
      updateProgress,
      createCourse,
      updateCourse,
      deleteCourse,
      fetchCourseAnalytics,
      updateProfile,
      toggleFavorite,
      uploadMedia,
      submitCourseReview,
    }),
    [
      authState,
      catalog,
      login,
      loginWithGoogle,
      register,
      requestPasswordReset,
      completePasswordReset,
      logout,
      joinCourse,
      updateProgress,
      createCourse,
      updateCourse,
      deleteCourse,
      fetchCourseAnalytics,
      updateProfile,
      toggleFavorite,
      uploadMedia,
      submitCourseReview,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
