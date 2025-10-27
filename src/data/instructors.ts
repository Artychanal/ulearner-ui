
export type Instructor = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  bio: string;
  social: {
    twitter?: string;
    linkedin?: string;
  };
};

export const instructors: Instructor[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.d@example.com',
    avatar: 'https://i.pravatar.cc/150?u=john_doe',
    title: 'Lead Instructor, Web Development',
    bio: 'John is a seasoned web developer with over 10 years of experience building scalable and performant web applications. He specializes in Next.js and the React ecosystem.',
    social: {
      twitter: 'johndoe',
      linkedin: 'johndoe',
    },
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.s@example.com',
    avatar: 'https://i.pravatar.cc/150?u=jane_smith',
    title: 'Senior Software Engineer & Instructor',
    bio: 'Jane is a TypeScript enthusiast and a core contributor to several open-source libraries. She is passionate about sharing her knowledge and helping others write clean, maintainable code.',
    social: {
      twitter: 'janesmith',
      linkedin: 'janesmith',
    },
  },
  {
    id: '3',
    name: 'Peter Jones',
    email: 'peter.j@example.com',
    avatar: 'https://i.pravatar.cc/150?u=peter_jones',
    title: 'Staff Software Engineer, Meta',
    bio: 'Peter is an expert in state management and has worked on large-scale React applications at Meta. He is the author of a popular book on React performance optimization.',
    social: {
      twitter: 'peterjones',
      linkedin: 'peterjones',
    },
  },
];
