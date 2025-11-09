"use client";

import { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthState, FavoriteCourse, UserProfile } from "@/types/user";
import type { AuthoredCourse, CourseSummary, EnrolledCourseProgress } from "@/types/course";
import { demoAccounts, initialUserProfile } from "@/lib/mockData";
import { clearStoredUser, loadUserFromStorage, persistUserToStorage } from "@/lib/storage";
import { generateId } from "@/lib/id";
import { fetchCatalogCourses } from "@/lib/catalog-service";
import { adaptCatalogCourse } from "@/lib/catalog-adapter";

type AuthContextValue = {
  authState: AuthState;
  catalog: CourseSummary[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (input: { name: string; email: string; password: string; bio?: string; avatarUrl?: string }) => Promise<boolean>;
  logout: () => void;
  joinCourse: (courseId: number | string) => void;
  updateProgress: (progress: EnrolledCourseProgress) => void;
  createCourse: (course: Omit<AuthoredCourse, "id" | "lastUpdated">) => string;
  updateCourse: (course: AuthoredCourse) => void;
  updateProfile: (updates: Partial<Pick<UserProfile, "name" | "email" | "avatarUrl" | "bio" | "password">>) => void;
  toggleFavorite: (courseId: number | string, origin: FavoriteCourse["origin"]) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeProgress(progress: EnrolledCourseProgress): EnrolledCourseProgress {
  return {
    ...progress,
    completedLessons: progress.completedLessons ?? [],
    quizAttempts: progress.quizAttempts ?? [],
  };
}

function normalizeUserProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    enrolledCourses: (profile.enrolledCourses ?? []).map(normalizeProgress),
    authoredCourses: profile.authoredCourses ?? [],
    favoriteCourses: profile.favoriteCourses ?? [],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });
  const [catalog, setCatalog] = useState<CourseSummary[]>([]);

  useEffect(() => {
    const stored = loadUserFromStorage<UserProfile | null>(null);
    startTransition(() => {
      if (stored) {
        setAuthState({ status: "authenticated", user: normalizeUserProfile(stored) });
      } else {
        setAuthState({ status: "unauthenticated" });
      }
    });
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      try {
        const response = await fetchCatalogCourses({ limit: 200 });
        if (active) {
          setCatalog(response.items.map(adaptCatalogCourse));
        }
      } catch (error) {
        console.error("Failed to load catalog", error);
      }
    }

    loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  const syncUser = useCallback((user: UserProfile) => {
    const normalized = normalizeUserProfile(user);
    persistUserToStorage(normalized);
    setAuthState({ status: "authenticated", user: normalized });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const stored = loadUserFromStorage<UserProfile | null>(null);

      if (stored && stored.email.toLowerCase() === email.toLowerCase() && stored.password === password) {
        syncUser(stored);
        return true;
      }

      const match = demoAccounts.find(
        (account) => account.email.toLowerCase() === email.toLowerCase() && account.password === password,
      );

      if (!match) {
        return false;
      }

      const profile = normalizeUserProfile(initialUserProfile());
      profile.name = match.name;
      profile.email = match.email;
      profile.avatarUrl = match.avatarUrl;
      profile.password = match.password;

      syncUser(profile);
      return true;
    },
    [syncUser],
  );

  const register = useCallback(
    async ({ name, email, password, bio, avatarUrl }: { name: string; email: string; password: string; bio?: string; avatarUrl?: string }) => {
      const profile: UserProfile = {
        id: generateId("user"),
        name,
        email,
        avatarUrl: avatarUrl ?? "https://www.gravatar.com/avatar/?d=identicon",
        password,
        bio,
        enrolledCourses: [],
        authoredCourses: [],
        favoriteCourses: [],
      };

      syncUser(profile);
      return true;
    },
    [syncUser],
  );

  const logout = useCallback(() => {
    clearStoredUser();
    setAuthState({ status: "unauthenticated" });
    router.push("/login");
  }, [router]);

  const joinCourse = useCallback(
    (courseId: number | string) => {
      if (authState.status !== "authenticated") {
        return;
      }

      const alreadyJoined = authState.user.enrolledCourses.some(
        (progress) => String(progress.courseId) === String(courseId),
      );

      if (alreadyJoined) {
        return;
      }

      const isCatalogCourse = catalog.some((course) => String(course.id) === String(courseId));

      const updatedUser: UserProfile = {
        ...authState.user,
        enrolledCourses: [
          ...authState.user.enrolledCourses,
          {
            courseId,
            progress: 0,
            completedLessons: [],
            quizAttempts: [],
            lastAccessed: new Date().toISOString(),
            origin: isCatalogCourse ? "catalog" : "authored",
          },
        ],
      };

      syncUser(updatedUser);
    },
    [authState, catalog, syncUser],
  );

  const updateProgress = useCallback(
    (progressUpdate: EnrolledCourseProgress) => {
      if (authState.status !== "authenticated") {
        return;
      }

      const updatedUser: UserProfile = {
        ...authState.user,
        enrolledCourses: authState.user.enrolledCourses.map((progress) =>
          normalizeProgress(
            String(progress.courseId) === String(progressUpdate.courseId)
              ? { ...progress, ...progressUpdate, lastAccessed: new Date().toISOString() }
              : progress,
          ),
        ),
      };

      syncUser(updatedUser);
    },
    [authState, syncUser],
  );

  const createCourse = useCallback(
    (draft: Omit<AuthoredCourse, "id" | "lastUpdated">) => {
      if (authState.status !== "authenticated") {
        throw new Error("User must be authenticated to create a course");
      }

      const id = generateId("course");
      const newCourse: AuthoredCourse = {
        ...draft,
        id,
        lastUpdated: new Date().toISOString(),
      };

      const updatedUser: UserProfile = {
        ...authState.user,
        authoredCourses: [newCourse, ...authState.user.authoredCourses],
      };

      syncUser(updatedUser);
      return id;
    },
    [authState, syncUser],
  );

  const updateCourse = useCallback(
    (course: AuthoredCourse) => {
      if (authState.status !== "authenticated") {
        return;
      }

      const updatedCourse: AuthoredCourse = {
        ...course,
        lastUpdated: new Date().toISOString(),
      };

      const updatedUser: UserProfile = {
        ...authState.user,
        authoredCourses: authState.user.authoredCourses.map((existing) =>
          existing.id === updatedCourse.id ? updatedCourse : existing,
        ),
      };

      syncUser(updatedUser);
    },
    [authState, syncUser],
  );

  const updateProfile = useCallback(
    (updates: Partial<Pick<UserProfile, "name" | "email" | "avatarUrl" | "bio" | "password">>) => {
      if (authState.status !== "authenticated") {
        return;
      }

      const cleanedUpdates = {
        ...updates,
        name: updates.name?.trim(),
        email: updates.email?.trim().toLowerCase(),
        avatarUrl: updates.avatarUrl?.trim(),
        bio: updates.bio?.trim(),
        password: updates.password?.trim(),
      };

      const updatedUser: UserProfile = {
        ...authState.user,
        ...Object.fromEntries(
          Object.entries(cleanedUpdates).filter(([, value]) => value !== undefined),
        ),
      };

      syncUser(updatedUser);
    },
    [authState, syncUser],
  );

  const toggleFavorite = useCallback(
    (courseId: number | string, origin: FavoriteCourse["origin"]) => {
      if (authState.status !== "authenticated") {
        return;
      }

      const favorites = authState.user.favoriteCourses ?? [];
      const existingIndex = favorites.findIndex(
        (favorite) => String(favorite.courseId) === String(courseId) && favorite.origin === origin,
      );

      let updatedFavorites: FavoriteCourse[];

      if (existingIndex >= 0) {
        updatedFavorites = favorites.filter((_, index) => index !== existingIndex);
      } else {
        updatedFavorites = [
          ...favorites,
          {
            courseId,
            origin,
            addedAt: new Date().toISOString(),
          },
        ];
      }

      const updatedUser: UserProfile = {
        ...authState.user,
        favoriteCourses: updatedFavorites,
      };

      syncUser(updatedUser);
    },
    [authState, syncUser],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      authState,
      catalog,
      login,
      register,
      logout,
      joinCourse,
      updateProgress,
      createCourse,
      updateCourse,
      updateProfile,
      toggleFavorite,
    }),
    [
      authState,
      catalog,
      login,
      register,
      logout,
      joinCourse,
      updateProgress,
      createCourse,
      updateCourse,
      updateProfile,
      toggleFavorite,
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
