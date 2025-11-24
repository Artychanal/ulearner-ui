export type Lesson = {
  id: string;
  title: string;
  duration: string;
  durationMinutes?: number;
  videoUrl?: string;
  videoMediaId?: string;
};

export type CourseSummary = {
  id: string;
  title: string;
  instructor: string;
  instructorId?: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  lessons: Lesson[];
  modules?: CourseModule[];
  status?: 'pending' | 'approved' | 'rejected';
};

export type ContentType = "text" | "video" | "quiz";

export type BaseContent = {
  id: string;
  title: string;
  type: ContentType;
};

export type TextContent = BaseContent & {
  type: "text";
  body: string;
};

export type VideoContent = BaseContent & {
  type: "video";
  url: string;
  duration: string;
  mediaId?: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  points: number;
};

export type QuizContent = BaseContent & {
  type: "quiz";
  questions: QuizQuestion[];
  totalPoints: number;
};

export type QuizAttempt = {
  quizId: string;
  selectedOptionIndexes: number[];
  scoredPoints: number;
  totalPoints: number;
  completedAt: string;
};

export type CourseCertificate = {
  id: string;
  certificateNumber: string;
  courseTitle: string;
  instructorName: string;
  recipientName: string;
  courseDurationMinutes: number;
  platformSignature: string;
  issuedAt: string;
};

export type CourseContentItem = TextContent | VideoContent | QuizContent;

export type CourseModule = {
  id: string;
  title: string;
  description?: string;
  items: CourseContentItem[];
};

export type CourseReview = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
};

export type CourseReviewSummary = {
  averageRating: number;
  totalReviews: number;
  reviews: CourseReview[];
};

export type AuthoredCourse = {
  id: string;
  title: string;
  instructor: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isPublished: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  modules: CourseModule[];
  lastUpdated: string;
};

export type EnrolledCourseProgress = {
  courseId: number | string;
  enrollmentId?: string;
  progress: number;
  completedLessons: string[];
  quizAttempts: QuizAttempt[];
  lastAccessed: string;
  origin?: "catalog" | "authored";
  certificate?: CourseCertificate | null;
};
