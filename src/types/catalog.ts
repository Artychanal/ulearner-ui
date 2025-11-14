export type CatalogInstructor = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  title: string;
  bio?: string;
  twitter?: string;
  linkedin?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CatalogLesson = {
  id: string;
  title: string;
  durationMinutes: number;
  position: number;
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CatalogCourse = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  instructor: CatalogInstructor;
  lessons: CatalogLesson[];
  createdAt?: string;
  updatedAt?: string;
};

export type CatalogCourseCollection = {
  items: CatalogCourse[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};

export type CatalogTestimonial = {
  id: string;
  statement: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  course?: CatalogCourse | null;
  createdAt?: string;
  updatedAt?: string;
};
