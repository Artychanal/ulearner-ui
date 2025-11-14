import type { CatalogCourse } from '@/types/catalog';

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
};

export type EnrollmentApi = {
  id: string;
  progress: number;
  completedLessons: string[];
  quizAttempts: unknown[];
  lastAccessed: string;
  origin: 'catalog' | 'authored';
  course: CatalogCourse;
};

export type FavoriteApi = {
  id: string;
  origin: 'catalog' | 'authored';
  addedAt: string;
  course: CatalogCourse;
};

export type ApiAuthoredCourse = {
  id: string;
  title: string;
  instructor: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isPublished: boolean;
  modules: unknown;
  createdAt: string;
  updatedAt: string;
};
