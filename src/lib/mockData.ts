import type {
  AuthoredCourse,
  CourseModule,
  CourseSummary,
  EnrolledCourseProgress,
} from "@/types/course";
import type { DemoAccount, UserProfile } from "@/types/user";
import { generateId } from "@/lib/id";
import { courses } from "@/data/courses";

export const catalogCourses: CourseSummary[] = courses.map((course) => ({
  ...course,
  lessons: course.lessons.map((lesson) => ({
    ...lesson,
    id: String(lesson.id),
  })),
}));

const demoModules = (): CourseModule[] => [
  {
    id: generateId("module"),
    title: "Welcome & foundations",
    description: "Kick-off and key concepts to prepare you for the journey.",
    items: [
      {
        id: generateId("item"),
        type: "text",
        title: "Program overview",
        body:
          "In this module you'll review the program goals, expected outcomes, and how to make the most of each lesson.",
      },
      {
        id: generateId("item"),
        type: "video",
        title: "Getting set up",
        url: "https://www.example.com/video/setup-intro",
        duration: "08:41",
      },
      {
        id: generateId("item"),
        type: "quiz",
        title: "Check your readiness",
        totalPoints: 15,
        questions: [
          {
            id: generateId("q"),
            question: "Which command scaffolds a new Next.js project?",
            options: ["npm init next-app", "npx create-next-app", "npm init next", "npx next new"],
            answerIndex: 1,
            points: 5,
          },
          {
            id: generateId("q"),
            question: "What hook do you use to manage local component state in React?",
            options: ["useEffect", "useState", "useReducer", "useMemo"],
            answerIndex: 1,
            points: 10,
          },
        ],
      },
    ],
  },
];

export const demoAuthoredCourses = (): AuthoredCourse[] => [
  {
    id: generateId("course"),
    title: "Designing for Accessibility",
    instructor: "Alex Mentor",
    description:
      "Bring inclusivity into your product workflow with practical accessibility techniques and audits.",
    price: 45,
    category: "Product Design",
    imageUrl: "/course-thumbnails/css-layout.svg",
    isPublished: true,
    modules: demoModules(),
    lastUpdated: new Date().toISOString(),
  },
];

const catalogCourseModules: Record<number, CourseModule[]> = {
  1: [
    {
      id: "nextjs-mod-1",
      title: "Getting started with Next.js",
      description: "Spin up your first application and learn the file-system router.",
      items: [
        {
          id: "nextjs-mod-1-text-1",
          type: "text",
          title: "Why choose Next.js?",
          body:
            "Next.js combines the best developer experience with all the features you need for production. In this lesson we explore when you should reach for it and what problems it solves.",
        },
        {
          id: "nextjs-mod-1-video-1",
          type: "video",
          title: "Project bootstrap walkthrough",
          url: "https://www.youtube.com/embed/1WmNXEVia8I",
          duration: "12:08",
        },
      ],
    },
    {
      id: "nextjs-mod-2",
      title: "Routing & data fetching",
      description: "Understand layouts, server components, and fetching patterns.",
      items: [
        {
          id: "nextjs-mod-2-text-1",
          type: "text",
          title: "App Router concepts",
          body:
            "Learn how the App Router composes layouts, pages, and loading states. We'll model a multi-section site and explore nested routing.",
        },
        {
          id: "nextjs-mod-2-quiz-1",
          type: "quiz",
          title: "Routing recap quiz",
          totalPoints: 20,
          questions: [
            {
              id: "nextjs-mod-2-quiz-1-q1",
              question: "Where do you define metadata for a route segment in the App Router?",
              options: ["layout.tsx", "page.tsx", "route.ts", "head.tsx"],
              answerIndex: 0,
              points: 10,
            },
            {
              id: "nextjs-mod-2-quiz-1-q2",
              question: "Which hook lets a Client Component access server-fetched data?",
              options: ["useLoaderData", "useServerData", "use", "useEffect"],
              answerIndex: 2,
              points: 10,
            },
          ],
        },
      ],
    },
  ],
  2: [
    {
      id: "ts-mod-1",
      title: "Advanced type fundamentals",
      items: [
        {
          id: "ts-mod-1-text-1",
          type: "text",
          title: "Mastering generics",
          body:
            "Generics unlock reusable, type-safe components. We'll cover constraints, default arguments, and conditional types with practical examples.",
        },
        {
          id: "ts-mod-1-video-1",
          type: "video",
          title: "Generics in real projects",
          url: "https://www.youtube.com/embed/bS70gl75U-c",
          duration: "09:32",
        },
      ],
    },
    {
      id: "ts-mod-2",
      title: "Decorators & metadata",
      items: [
        {
          id: "ts-mod-2-text-1",
          type: "text",
          title: "Decorator patterns",
          body:
            "Decorators are powerful for augmenting classes and methods. We look at common patterns and pitfalls when using them in modern apps.",
        },
        {
          id: "ts-mod-2-quiz-1",
          type: "quiz",
          title: "Type challenge",
          totalPoints: 15,
          questions: [
            {
              id: "ts-mod-2-quiz-q1",
              question: "Which keyword do you use to limit a generic to certain shapes?",
              options: ["extends", "implements", "infer", "keyof"],
              answerIndex: 0,
              points: 5,
            },
            {
              id: "ts-mod-2-quiz-q2",
              question: "What decorator type executes after a property is defined?",
              options: ["Accessor decorator", "Method decorator", "Property decorator", "Parameter decorator"],
              answerIndex: 1,
              points: 10,
            },
          ],
        },
      ],
    },
  ],
  3: [
    {
      id: "state-mod-1",
      title: "State architecture",
      items: [
        {
          id: "state-mod-1-text-1",
          type: "text",
          title: "State modeling fundamentals",
          body:
            "Before reaching for libraries, understand how to model state transitions and derive view state in plain React.",
        },
        {
          id: "state-mod-1-video-1",
          type: "video",
          title: "State machines in practice",
          url: "https://www.youtube.com/embed/yeKW9oR5O_k",
          duration: "11:52",
        },
      ],
    },
    {
      id: "state-mod-2",
      title: "Redux Toolkit deep dive",
      items: [
        {
          id: "state-mod-2-text-1",
          type: "text",
          title: "Slice organization",
          body:
            "We cover how to organize slices, keep logic colocated, and embrace immutable updates using createSlice.",
        },
        {
          id: "state-mod-2-quiz-1",
          type: "quiz",
          title: "Redux knowledge check",
          totalPoints: 20,
          questions: [
            {
              id: "state-mod-2-quiz-q1",
              question: "Which Redux Toolkit API simplifies async logic?",
              options: ["createSlice", "createAsyncThunk", "configureStore", "createEntityAdapter"],
              answerIndex: 1,
              points: 10,
            },
            {
              id: "state-mod-2-quiz-q2",
              question: "What is the recommended way to update nested state?",
              options: ["Mutate directly", "Return new state objects", "Use deep clones", "Only use immer"],
              answerIndex: 1,
              points: 10,
            },
          ],
        },
      ],
    },
  ],
  4: [
    {
      id: "node-mod-1",
      title: "API architecture",
      items: [
        {
          id: "node-mod-1-text-1",
          type: "text",
          title: "Designing resource routes",
          body:
            "Lay out RESTful endpoints and understand how to version your APIs while keeping the surface area maintainable.",
        },
        {
          id: "node-mod-1-video-1",
          type: "video",
          title: "Express middleware pipeline",
          url: "https://www.youtube.com/embed/L72fhGm1tfE",
          duration: "13:40",
        },
      ],
    },
    {
      id: "node-mod-2",
      title: "Database integration & auth",
      items: [
        {
          id: "node-mod-2-text-1",
          type: "text",
          title: "Secure access patterns",
          body:
            "Learn how to secure APIs with JWT and session tokens, and when to choose each approach.",
        },
        {
          id: "node-mod-2-quiz-1",
          type: "quiz",
          title: "Security checkpoints",
          totalPoints: 20,
          questions: [
            {
              id: "node-mod-2-quiz-q1",
              question: "Which HTTP status code represents an unauthorized request?",
              options: ["200", "201", "401", "403"],
              answerIndex: 2,
              points: 10,
            },
            {
              id: "node-mod-2-quiz-q2",
              question: "What is the recommended password hashing algorithm today?",
              options: ["MD5", "bcrypt", "SHA-1", "rot13"],
              answerIndex: 1,
              points: 10,
            },
          ],
        },
      ],
    },
  ],
  5: [
    {
      id: "css-mod-1",
      title: "Flexbox layouts",
      items: [
        {
          id: "css-mod-1-text-1",
          type: "text",
          title: "Flexbox mental model",
          body:
            "Master flex containers, items, axes, and how to combine properties to create adaptive layouts.",
        },
        {
          id: "css-mod-1-video-1",
          type: "video",
          title: "Building a dashboard with Flexbox",
          url: "https://www.youtube.com/embed/JJSoEo8JSnc",
          duration: "14:24",
        },
      ],
    },
    {
      id: "css-mod-2",
      title: "Grid for complex interfaces",
      items: [
        {
          id: "css-mod-2-text-1",
          type: "text",
          title: "Grid template mastery",
          body:
            "Learn naming conventions, repeat syntax, and how to build responsive grids that adapt gracefully.",
        },
        {
          id: "css-mod-2-quiz-1",
          type: "quiz",
          title: "Layout challenge",
          totalPoints: 15,
          questions: [
            {
              id: "css-mod-2-quiz-q1",
              question: "Which property defines named areas in CSS Grid?",
              options: ["grid-template-columns", "grid-template-areas", "grid-auto-flow", "justify-items"],
              answerIndex: 1,
              points: 5,
            },
            {
              id: "css-mod-2-quiz-q2",
              question: "What does `align-items: stretch` do in Flexbox?",
              options: [
                "Aligns items on the main axis",
                "Aligns items on the cross axis",
                "Centers items horizontally",
                "Adds spacing between items",
              ],
              answerIndex: 1,
              points: 10,
            },
          ],
        },
      ],
    },
  ],
  6: [
    {
      id: "graphql-mod-1",
      title: "Schema design",
      items: [
        {
          id: "graphql-mod-1-text-1",
          type: "text",
          title: "Modeling data for GraphQL",
          body:
            "Build an expressive schema that maps to your domain. We'll cover schema stitching and modularization strategies.",
        },
        {
          id: "graphql-mod-1-video-1",
          type: "video",
          title: "GraphQL playground tour",
          url: "https://www.youtube.com/embed/ed8SzALpx1Q",
          duration: "10:35",
        },
      ],
    },
    {
      id: "graphql-mod-2",
      title: "Queries, mutations & subscriptions",
      items: [
        {
          id: "graphql-mod-2-text-1",
          type: "text",
          title: "Resolver best practices",
          body:
            "Keep resolvers thin, reuse logic, and add authorization. We share patterns to avoid N+1 issues and handle caching.",
        },
        {
          id: "graphql-mod-2-quiz-1",
          type: "quiz",
          title: "Operations quiz",
          totalPoints: 20,
          questions: [
            {
              id: "graphql-mod-2-quiz-q1",
              question: "Which operation type do you use for writes?",
              options: ["Query", "Mutation", "Subscription", "Directive"],
              answerIndex: 1,
              points: 10,
            },
            {
              id: "graphql-mod-2-quiz-q2",
              question: "What tool helps avoid N+1 problems?",
              options: ["Resolvers", "Apollo Server", "DataLoader", "GraphiQL"],
              answerIndex: 2,
              points: 10,
            },
          ],
        },
      ],
    },
  ],
};

export function getCatalogCourseModules(courseId: number): CourseModule[] {
  return catalogCourseModules[courseId] ?? [];
}

export const demoProgress = (): EnrolledCourseProgress[] => [
  {
    courseId: 1,
    progress: 62,
    completedLessons: ["1", "2"],
    quizAttempts: [],
    lastAccessed: new Date().toISOString(),
    origin: "catalog",
  },
  {
    courseId: 3,
    progress: 28,
    completedLessons: ["1"],
    quizAttempts: [],
    lastAccessed: new Date().toISOString(),
    origin: "catalog",
  },
];

export const demoAccounts: DemoAccount[] = [
  {
    email: "learner@example.com",
    password: "password123",
    name: "Taylor Learner",
    avatarUrl: "https://www.gravatar.com/avatar/?d=mp",
  },
  {
    email: "mentor@example.com",
    password: "mentor123",
    name: "Jordan Mentor",
    avatarUrl: "https://www.gravatar.com/avatar/?d=identicon",
  },
];

export const initialUserProfile = (): UserProfile => ({
  id: generateId("user"),
  name: "Taylor Learner",
  email: "learner@example.com",
  avatarUrl: "https://www.gravatar.com/avatar/?d=mp",
  password: "password123",
  bio: "Frontend developer focused on crafting delightful learning experiences.",
  enrolledCourses: demoProgress(),
  authoredCourses: demoAuthoredCourses(),
  favoriteCourses: [
    {
      courseId: 1,
      origin: "catalog",
      addedAt: new Date().toISOString(),
    },
  ],
});
