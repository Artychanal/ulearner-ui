import type { ResourceWithOptions } from 'adminjs';
import { CourseEntity } from '../courses/entities/course.entity';
import { LessonEntity } from '../lessons/entities/lesson.entity';
import { InstructorEntity } from '../instructors/entities/instructor.entity';
import { UserEntity } from '../users/entities/user.entity';
import { TestimonialEntity } from '../testimonials/entities/testimonial.entity';
import { MediaEntity } from '../media/entities/media.entity';
import { CourseReviewEntity } from '../course-reviews/entities/course-review.entity';

const hideFromForms = {
  isVisible: { list: false, filter: false, show: false, edit: false },
};

type AdminComponentIds = {
  imagePreview: string;
  videoPreview: string;
  imageUploadEdit: string;
};

export const buildAdminResources = (components: AdminComponentIds): ResourceWithOptions[] => {
  const courseResource: ResourceWithOptions = {
    resource: CourseEntity,
    options: {
      navigation: 'Learning content',
      listProperties: ['title', 'imageUrl', 'category', 'price', 'isPublished', 'instructorId', 'updatedAt'],
      filterProperties: ['title', 'category', 'instructorId', 'isPublished'],
      showProperties: [
        'id',
        'title',
        'description',
        'category',
        'price',
        'isPublished',
        'instructorId',
        'imageUrl',
        'lessons',
        'createdAt',
        'updatedAt',
      ],
      editProperties: ['title', 'description', 'category', 'price', 'imageUrl', 'isPublished', 'instructorId'],
      properties: {
        description: { type: 'richtext' },
        lessons: { isVisible: { list: false, edit: false } },
        owner: { isVisible: false },
        modules: hideFromForms,
        editorModules: hideFromForms,
        instructorId: {
          reference: 'InstructorEntity',
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        imageUrl: {
          components: {
            list: components.imagePreview,
            show: components.imagePreview,
            edit: components.imageUploadEdit,
          },
          custom: {
            preview: {
              maxWidth: 200,
              emptyLabel: 'No cover',
            },
          },
        },
      },
      actions: {
        delete: {
          guard: 'Deleting a course permanently removes all related lessons.',
        },
      },
    },
  };

  const lessonResource: ResourceWithOptions = {
    resource: LessonEntity,
    options: {
      navigation: 'Learning content',
      listProperties: ['title', 'courseId', 'videoUrl', 'durationMinutes', 'position', 'updatedAt'],
      filterProperties: ['title', 'courseId'],
      editProperties: ['title', 'durationMinutes', 'position', 'videoUrl', 'videoMediaId', 'courseId'],
      properties: {
        courseId: {
          reference: 'CourseEntity',
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        videoUrl: {
          components: {
            list: components.videoPreview,
            show: components.videoPreview,
          },
        },
      },
    },
  };

  const instructorResource: ResourceWithOptions = {
    resource: InstructorEntity,
    options: {
      navigation: 'People',
      listProperties: ['name', 'email', 'title', 'updatedAt'],
      editProperties: ['name', 'email', 'title', 'avatarUrl', 'bio', 'twitter', 'linkedin'],
    },
  };

  const userResource: ResourceWithOptions = {
    resource: UserEntity,
    options: {
      navigation: 'People',
      listProperties: ['avatarUrl', 'name', 'email', 'roles', 'createdAt'],
      showProperties: ['id', 'name', 'email', 'avatarUrl', 'bio', 'roles', 'createdAt', 'updatedAt'],
      properties: {
        passwordHash: hideFromForms,
        avatarUrl: {
          components: {
            list: components.imagePreview,
            show: components.imagePreview,
          },
          custom: {
            preview: {
              rounded: true,
              maxWidth: 80,
              emptyLabel: 'No avatar',
            },
          },
        },
      },
      actions: {
        delete: {
          guard: 'This action cannot be undone. Delete user?',
        },
      },
    },
  };

  const testimonialResource: ResourceWithOptions = {
    resource: TestimonialEntity,
    options: {
      navigation: 'Social proof',
      listProperties: ['userName', 'userEmail', 'courseId', 'updatedAt'],
      properties: {
        courseId: {
          reference: 'CourseEntity',
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
      },
    },
  };

  const reviewResource: ResourceWithOptions = {
    resource: CourseReviewEntity,
    options: {
      navigation: 'Social proof',
      listProperties: ['rating', 'comment', 'courseId', 'authorId', 'updatedAt'],
      filterProperties: ['courseId', 'authorId', 'rating'],
      showProperties: ['id', 'rating', 'comment', 'courseId', 'authorId', 'createdAt', 'updatedAt'],
      editProperties: ['rating', 'comment', 'courseId', 'authorId'],
      properties: {
        courseId: {
          reference: 'CourseEntity',
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        authorId: {
          reference: 'UserEntity',
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
      },
      actions: {
        delete: {
          guard: 'Delete this review permanently?',
        },
      },
    },
  };

  const mediaResource: ResourceWithOptions = {
    resource: MediaEntity,
    options: {
      navigation: 'Media',
      listProperties: ['filename', 'mimeType', 'size', 'createdAt'],
      properties: {
        data: hideFromForms,
        storagePath: hideFromForms,
      },
    },
  };

  return [
    courseResource,
    lessonResource,
    instructorResource,
    userResource,
    testimonialResource,
    reviewResource,
    mediaResource,
  ];
};
