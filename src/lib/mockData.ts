import type {
  AuthoredCourse,
  CourseModule,
  EnrolledCourseProgress,
} from '@/types/course';
import type { DemoAccount, UserProfile } from '@/types/user';
import { generateId } from '@/lib/id';

const demoModules = (): CourseModule[] => [
  {
    id: generateId('module'),
    title: 'Welcome & foundations',
    description: 'Kick-off and key concepts to prepare you for the journey.',
    items: [
      {
        id: generateId('item'),
        type: 'text',
        title: 'Program overview',
        body:
          "In this module you'll review the program goals, expected outcomes, and how to make the most of each lesson.",
      },
      {
        id: generateId('item'),
        type: 'video',
        title: 'Getting set up',
        url: 'https://www.example.com/video/setup-intro',
        duration: '08:41',
      },
      {
        id: generateId('item'),
        type: 'quiz',
        title: 'Check your readiness',
        totalPoints: 15,
        questions: [
          {
            id: generateId('q'),
            question: 'Which command scaffolds a new Next.js project?',
            options: ['npm init next-app', 'npx create-next-app', 'npm init next', 'npx next new'],
            answerIndex: 1,
            points: 5,
          },
          {
            id: generateId('q'),
            question: 'What hook do you use to manage local component state in React?',
            options: ['useEffect', 'useState', 'useReducer', 'useMemo'],
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
    id: generateId('course'),
    title: 'Designing for Accessibility',
    instructor: 'Alex Mentor',
    description:
      'Bring inclusivity into your product workflow with practical accessibility techniques and audits.',
    price: 45,
    category: 'Product Design',
    imageUrl: '/course-thumbnails/css-layout.svg',
    isPublished: true,
    modules: demoModules(),
    lastUpdated: new Date().toISOString(),
  },
];

export const demoAccounts: DemoAccount[] = [
  {
    email: 'learner@example.com',
    password: 'password123',
    name: 'Taylor Learner',
    avatarUrl: 'https://www.gravatar.com/avatar/?d=mp',
  },
  {
    email: 'mentor@example.com',
    password: 'mentor123',
    name: 'Jordan Mentor',
    avatarUrl: 'https://www.gravatar.com/avatar/?d=identicon',
  },
];

export const demoProgress = (): EnrolledCourseProgress[] => [];

export const initialUserProfile = (): UserProfile => ({
  id: generateId('user'),
  name: 'Taylor Learner',
  email: 'learner@example.com',
  avatarUrl: 'https://www.gravatar.com/avatar/?d=mp',
  password: 'password123',
  bio: 'Frontend developer focused on crafting delightful learning experiences.',
  enrolledCourses: [],
  authoredCourses: demoAuthoredCourses(),
  favoriteCourses: [],
});
