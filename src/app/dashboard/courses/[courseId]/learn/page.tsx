import CourseLearnScreen from "./CourseLearnScreen";

export default async function CourseLearnPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return <CourseLearnScreen courseId={courseId} />;
}

