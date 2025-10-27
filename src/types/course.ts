export type Lesson = {
  id: string;
  title: string;
  duration: string;
};

export type CourseSummary = {
  id: number;
  title: string;
  instructor: string;
  description: string;
  price: number;
  imageUrl: string;
  lessons: Lesson[];
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

export type CourseContentItem = TextContent | VideoContent | QuizContent;

export type CourseModule = {
  id: string;
  title: string;
  description?: string;
  items: CourseContentItem[];
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
  modules: CourseModule[];
  lastUpdated: string;
};

export type EnrolledCourseProgress = {
  courseId: number | string;
  progress: number;
  completedLessons: string[];
  quizAttempts: QuizAttempt[];
  lastAccessed: string;
  origin?: "catalog" | "authored";
};
