import { redirect } from "next/navigation";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  redirect(`/dashboard/courses/${courseId}/learn`);
}
