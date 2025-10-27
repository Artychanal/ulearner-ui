
export type Testimonial = {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  statement: string;
};

export const testimonials: Testimonial[] = [
  {
    user: {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      avatar: 'https://i.pravatar.cc/150?u=sarah_johnson',
    },
    statement:
      "uLearner has been a game-changer for my career. The courses are top-notch and the instructors are industry experts. I've been able to apply my new skills immediately at work.",
  },
  {
    user: {
      id: '2',
      name: 'David Martinez',
      email: 'david.m@example.com',
      avatar: 'https://i.pravatar.cc/150?u=david_martinez',
    },
    statement:
      'The project-based learning approach is fantastic. I actually built things while learning, which made the concepts stick. Highly recommend for anyone looking to level up their skills.',
  },
  {
    user: {
      id: '3',
      name: 'Emily Chen',
      email: 'emily.c@example.com',
      avatar: 'https://i.pravatar.cc/150?u=emily_chen',
    },
    statement:
      "I love the flexibility of uLearner. I can learn at my own pace, on any device. The community support is also a huge plus – it's great to have a network of peers to learn with.",
  },
];
