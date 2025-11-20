import AppDataSource from './data-source';
import { InstructorEntity } from '../instructors/entities/instructor.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { LessonEntity } from '../lessons/entities/lesson.entity';
import { TestimonialEntity } from '../testimonials/entities/testimonial.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EnrollmentEntity } from '../enrollments/entities/enrollment.entity';
import { FavoriteEntity } from '../favorites/entities/favorite.entity';
import { RefreshTokenEntity } from '../auth/entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';

const instructorSeed = [
  {
    name: 'John Doe',
    email: 'john.d@example.com',
    title: 'Lead Instructor, Web Development',
    bio: 'John is a seasoned web developer with over 10 years of experience building scalable and performant web applications. He specializes in Next.js and the React ecosystem.',
    avatarUrl: 'https://i.pravatar.cc/150?u=john_doe',
    twitter: 'johndoe',
    linkedin: 'johndoe',
  },
  {
    name: 'Jane Smith',
    email: 'jane.s@example.com',
    title: 'Senior Software Engineer & Instructor',
    bio: 'Jane is a TypeScript enthusiast and a core contributor to several open-source libraries. She is passionate about sharing her knowledge and helping others write clean, maintainable code.',
    avatarUrl: 'https://i.pravatar.cc/150?u=jane_smith',
    twitter: 'janesmith',
    linkedin: 'janesmith',
  },
  {
    name: 'Peter Jones',
    email: 'peter.j@example.com',
    title: 'Staff Software Engineer, Meta',
    bio: 'Peter is an expert in state management and has worked on large-scale React applications at Meta. He is the author of a popular book on React performance optimization.',
    avatarUrl: 'https://i.pravatar.cc/150?u=peter_jones',
    twitter: 'peterjones',
    linkedin: 'peterjones',
  },
  {
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    title: 'Principal Engineer, Backend Systems',
    bio: 'Alice builds resilient APIs for high-growth startups and loves teaching backend best practices.',
    avatarUrl: 'https://i.pravatar.cc/150?u=alice_johnson',
    twitter: 'alicejohnson',
    linkedin: 'alicejohnson',
  },
  {
    name: 'Bob Brown',
    email: 'bob.b@example.com',
    title: 'Staff Product Designer',
    bio: 'Bob has mentored hundreds of designers transitioning into product roles.',
    avatarUrl: 'https://i.pravatar.cc/150?u=bob_brown',
  },
  {
    name: 'Charlie Davis',
    email: 'charlie.d@example.com',
    title: 'GraphQL Advocate',
    bio: 'Charlie works on developer relations and focuses on API design.',
    avatarUrl: 'https://i.pravatar.cc/150?u=charlie_davis',
  },
];

const courseSeed = [
  {
    title: 'Introduction to Next.js',
    instructorEmail: 'john.d@example.com',
    description:
      'Learn the fundamentals of Next.js and build modern web applications.',
    price: 49.99,
    category: 'Web Development',
    imageUrl: '/course-thumbnails/nextjs.svg',
    lessons: [
      { title: 'Getting Started', durationMinutes: 10 },
      { title: 'Pages and Routing', durationMinutes: 15 },
      { title: 'Data Fetching', durationMinutes: 20 },
    ],
  },
  {
    title: 'Advanced TypeScript',
    instructorEmail: 'jane.s@example.com',
    description:
      'Master TypeScript with advanced concepts like generics, decorators, and more.',
    price: 79.99,
    category: 'Programming Languages',
    imageUrl: '/course-thumbnails/typescript.svg',
    lessons: [
      { title: 'Generics', durationMinutes: 12 },
      { title: 'Decorators', durationMinutes: 18 },
      { title: 'Advanced Types', durationMinutes: 22 },
    ],
  },
  {
    title: 'React State Management',
    instructorEmail: 'peter.j@example.com',
    description:
      'Learn different state management solutions for React, including Redux and Zustand.',
    price: 59.99,
    category: 'Frontend Development',
    imageUrl: '/course-thumbnails/react-state.svg',
    lessons: [
      { title: 'Introduction to State', durationMinutes: 8 },
      { title: 'Redux Toolkit', durationMinutes: 25 },
      { title: 'Zustand', durationMinutes: 15 },
    ],
  },
  {
    title: 'Building REST APIs with Node.js',
    instructorEmail: 'alice.j@example.com',
    description:
      'A comprehensive guide to building robust REST APIs using Node.js and Express.',
    price: 69.99,
    category: 'Backend Development',
    imageUrl: '/course-thumbnails/node-api.svg',
    lessons: [
      { title: 'Introduction to Node.js', durationMinutes: 10 },
      { title: 'Express Basics', durationMinutes: 15 },
      { title: 'Database Integration', durationMinutes: 25 },
    ],
  },
  {
    title: 'CSS Grid and Flexbox',
    instructorEmail: 'bob.b@example.com',
    description:
      'Master modern CSS layouts with Grid and Flexbox for responsive web design.',
    price: 39.99,
    category: 'Frontend Development',
    imageUrl: '/course-thumbnails/css-layout.svg',
    lessons: [
      { title: 'Flexbox Fundamentals', durationMinutes: 15 },
      { title: 'Advanced Flexbox', durationMinutes: 20 },
      { title: 'CSS Grid Essentials', durationMinutes: 25 },
    ],
  },
  {
    title: 'GraphQL for Beginners',
    instructorEmail: 'charlie.d@example.com',
    description: 'Get started with GraphQL and build powerful, flexible APIs.',
    price: 59.99,
    category: 'Backend Development',
    imageUrl: '/course-thumbnails/graphql.svg',
    lessons: [
      { title: 'What is GraphQL?', durationMinutes: 10 },
      { title: 'Queries and Mutations', durationMinutes: 20 },
      { title: 'Building a GraphQL Server', durationMinutes: 30 },
    ],
  },
];

const testimonialSeed = [
  {
    userName: 'Sarah Johnson',
    userEmail: 'sarah.j@example.com',
    userAvatar: 'https://i.pravatar.cc/150?u=sarah_johnson',
    statement:
      "uLearner has been a game-changer for my career. The courses are top-notch and the instructors are industry experts. I've been able to apply my new skills immediately at work.",
    courseTitle: 'Introduction to Next.js',
  },
  {
    userName: 'David Martinez',
    userEmail: 'david.m@example.com',
    userAvatar: 'https://i.pravatar.cc/150?u=david_martinez',
    statement:
      'The project-based learning approach is fantastic. I actually built things while learning, which made the concepts stick. Highly recommend for anyone looking to level up their skills.',
    courseTitle: 'React State Management',
  },
  {
    userName: 'Emily Chen',
    userEmail: 'emily.c@example.com',
    userAvatar: 'https://i.pravatar.cc/150?u=emily_chen',
    statement:
      "I love the flexibility of uLearner. I can learn at my own pace, on any device. The community support is also a huge plus – it's great to have a network of peers to learn with.",
    courseTitle: 'Advanced TypeScript',
  },
];

const userSeed = [
  {
    name: 'Taylor Learner',
    email: 'learner@example.com',
    password: 'password123',
    avatarUrl: 'https://www.gravatar.com/avatar/?d=mp',
    bio: 'Frontend developer focused on crafting delightful learning experiences.',
  },
  {
    name: 'Jordan Mentor',
    email: 'mentor@example.com',
    password: 'mentor123',
    avatarUrl: 'https://www.gravatar.com/avatar/?d=identicon',
    bio: 'Mentor helping learners transition into tech.',
  },
];

async function seed() {
  await AppDataSource.initialize();
  const instructorRepository = AppDataSource.getRepository(InstructorEntity);
  const courseRepository = AppDataSource.getRepository(CourseEntity);
  const lessonRepository = AppDataSource.getRepository(LessonEntity);
  const testimonialRepository = AppDataSource.getRepository(TestimonialEntity);
  const userRepository = AppDataSource.getRepository(UserEntity);
  const enrollmentRepository = AppDataSource.getRepository(EnrollmentEntity);
  const favoriteRepository = AppDataSource.getRepository(FavoriteEntity);
  const refreshRepository = AppDataSource.getRepository(RefreshTokenEntity);

  await refreshRepository.createQueryBuilder().delete().execute();
  await favoriteRepository.createQueryBuilder().delete().execute();
  await enrollmentRepository.createQueryBuilder().delete().execute();
  await testimonialRepository.createQueryBuilder().delete().execute();
  await lessonRepository.createQueryBuilder().delete().execute();
  await courseRepository.createQueryBuilder().delete().execute();
  await instructorRepository.createQueryBuilder().delete().execute();
  await userRepository.createQueryBuilder().delete().execute();

  const instructors = await instructorRepository.save(
    instructorSeed.map((data) => instructorRepository.create(data)),
  );
  const instructorsByEmail = Object.fromEntries(instructors.map((i) => [i.email, i]));

  const courses = await courseRepository.save(
    courseSeed.map((course) =>
      courseRepository.create({
        title: course.title,
        description: course.description,
        price: course.price,
        category: course.category,
        imageUrl: course.imageUrl,
        instructor: instructorsByEmail[course.instructorEmail],
        lessons: course.lessons.map((lesson, index) =>
          lessonRepository.create({
            ...lesson,
            position: index + 1,
          }),
        ),
      }),
    ),
  );

  const courseByTitle = Object.fromEntries(courses.map((course) => [course.title, course]));

  await testimonialRepository.save(
    testimonialSeed.map((testimonial) =>
      testimonialRepository.create({
        userName: testimonial.userName,
        userEmail: testimonial.userEmail,
        userAvatar: testimonial.userAvatar,
        statement: testimonial.statement,
        course: courseByTitle[testimonial.courseTitle],
      }),
    ),
  );

  const users = await Promise.all(
    userSeed.map(async (user) => {
      const passwordHash = await bcrypt.hash(user.password, 10);
      return userRepository.save(
        userRepository.create({
          name: user.name,
          email: user.email.toLowerCase(),
          passwordHash,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          roles: ['student'],
        }),
      );
    }),
  );

  const usersByEmail = Object.fromEntries(users.map((user) => [user.email, user]));

  const sampleCourse = courseByTitle['Introduction to Next.js'];
  const sampleCompleted = sampleCourse?.lessons.slice(0, 2).map((lesson) => lesson.id) ?? [];

  await enrollmentRepository.save(
    enrollmentRepository.create({
      user: usersByEmail['learner@example.com'],
      course: sampleCourse,
      progress: 62,
      completedLessons: sampleCompleted,
      quizAttempts: [],
      origin: 'catalog',
    }),
  );

  await favoriteRepository.save(
    favoriteRepository.create({
      user: usersByEmail['learner@example.com'],
      course: courseByTitle['Advanced TypeScript'],
      origin: 'catalog',
    }),
  );

  console.log('✅ Database seeded with demo data');
  await AppDataSource.destroy();
}

seed().catch(async (error) => {
  console.error('Failed to seed database', error);
  await AppDataSource.destroy();
  process.exit(1);
});
