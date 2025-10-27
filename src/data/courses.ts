
export interface Course {
  id: number;
  title: string;
  instructor: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  lessons: { id: number; title: string; duration: string }[];
}

export const courses: Course[] = [
  {
    id: 1,
    title: 'Introduction to Next.js',
    instructor: 'John Doe',
    description: 'Learn the fundamentals of Next.js and build modern web applications.',
    price: 49.99,
    category: 'Web Development',
    imageUrl: '/course-thumbnails/nextjs.svg',
    lessons: [
      { id: 1, title: 'Getting Started', duration: '10:00' },
      { id: 2, title: 'Pages and Routing', duration: '15:00' },
      { id: 3, title: 'Data Fetching', duration: '20:00' },
    ],
  },
  {
    id: 2,
    title: 'Advanced TypeScript',
    instructor: 'Jane Smith',
    description: 'Master TypeScript with advanced concepts like generics, decorators, and more.',
    price: 79.99,
    category: 'Programming Languages',
    imageUrl: '/course-thumbnails/typescript.svg',
    lessons: [
      { id: 1, title: 'Generics', duration: '12:00' },
      { id: 2, title: 'Decorators', duration: '18:00' },
      { id: 3, title: 'Advanced Types', duration: '22:00' },
    ],
  },
  {
    id: 3,
    title: 'React State Management',
    instructor: 'Peter Jones',
    description: 'Learn different state management solutions for React, including Redux and Zustand.',
    price: 59.99,
    category: 'Frontend Development',
    imageUrl: '/course-thumbnails/react-state.svg',
    lessons: [
      { id: 1, title: 'Introduction to State', duration: '08:00' },
      { id: 2, title: 'Redux Toolkit', duration: '25:00' },
      { id: 3, title: 'Zustand', duration: '15:00' },
    ],
  },
    {
    id: 4,
    title: 'Building REST APIs with Node.js',
    instructor: 'Alice Johnson',
    description: 'A comprehensive guide to building robust REST APIs using Node.js and Express.',
    price: 69.99,
    category: 'Backend Development',
    imageUrl: '/course-thumbnails/node-api.svg',
    lessons: [
      { id: 1, title: 'Introduction to Node.js', duration: '10:00' },
      { id: 2, title: 'Express Basics', duration: '15:00' },
      { id: 3, title: 'Database Integration', duration: '25:00' },
    ],
  },
  {
    id: 5,
    title: 'CSS Grid and Flexbox',
    instructor: 'Bob Brown',
    description: 'Master modern CSS layouts with Grid and Flexbox for responsive web design.',
    price: 39.99,
    category: 'Frontend Development',
    imageUrl: '/course-thumbnails/css-layout.svg',
    lessons: [
      { id: 1, title: 'Flexbox Fundamentals', duration: '15:00' },
      { id: 2, title: 'Advanced Flexbox', duration: '20:00' },
      { id: 3, title: 'CSS Grid Essentials', duration: '25:00' },
    ],
  },
  {
    id: 6,
    title: 'GraphQL for Beginners',
    instructor: 'Charlie Davis',
    description: 'Get started with GraphQL and build powerful, flexible APIs.',
    price: 59.99,
    category: 'Backend Development',
    imageUrl: '/course-thumbnails/graphql.svg',
    lessons: [
      { id: 1, title: 'What is GraphQL?', duration: '10:00' },
      { id: 2, title: 'Queries and Mutations', duration: '20:00' },
      { id: 3, title: 'Building a GraphQL Server', duration: '30:00' },
    ],
  },
];

export const courseCategories = Array.from(new Set(courses.map((course) => course.category))).sort();
