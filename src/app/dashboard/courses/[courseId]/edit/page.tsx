import CourseEditScreen from "../CourseEditScreen";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return <CourseEditScreen courseId={courseId} />;
}

