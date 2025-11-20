'use client';

import { ChangeEvent, startTransition, useEffect, useState } from "react";
import type { AuthoredCourse, CourseContentItem, CourseModule } from "@/types/course";
import { generateId } from "@/lib/id";
import { useAuth } from "@/context/AuthContext";

export type CourseEditorValues = Omit<AuthoredCourse, "lastUpdated">;

type CourseEditorProps = {
  initialCourse?: CourseEditorValues;
  onSave: (course: CourseEditorValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
};

type VideoUploadState = {
  status: "idle" | "uploading" | "success" | "error";
  error?: string;
};

type QuizQuestionEditorState = {
  question: string;
  points: number;
  options: string[];
  answerIndex: number;
};

const defaultCourse = (instructorName = "You"): CourseEditorValues => ({
  id: generateId("course-draft"),
  title: "Untitled course",
  instructor: instructorName,
  description: "",
  price: 0,
  category: "General",
  imageUrl: "/course-thumbnails/nextjs.svg",
  isPublished: false,
  modules: [
    {
      id: generateId("module"),
      title: "Module 1",
      description: "",
      items: [],
    },
  ],
});

const createQuizQuestion = (overrides?: Partial<QuizQuestionEditorState>) => ({
  id: generateId("quiz-question"),
  question: overrides?.question ?? "New question",
  points: overrides?.points ?? 1,
  options: overrides?.options ?? ["Option A", "Option B"],
  answerIndex: overrides?.answerIndex ?? 0,
});

const normalizeQuizQuestion = (question: QuizQuestionEditorState & { id: string }) => {
  const options =
    Array.isArray(question.options) && question.options.length >= 2 ? question.options : ["Option A", "Option B"];
  const answerIndex =
    typeof question.answerIndex === "number" && question.answerIndex >= 0 && question.answerIndex < options.length
      ? question.answerIndex
      : 0;
  return {
    ...question,
    options,
    answerIndex,
    points: typeof question.points === "number" ? question.points : 1,
  };
};

function normalizeCourseValues(course: CourseEditorValues): CourseEditorValues {
  return {
    ...course,
    modules: course.modules.map((module) => ({
      ...module,
      items: module.items.map((item) => {
        if (item.type !== "quiz") {
          return item;
        }
        const normalizedQuestions =
          item.questions && item.questions.length > 0
            ? item.questions.map((question) => normalizeQuizQuestion(question as QuizQuestionEditorState & { id: string }))
            : [createQuizQuestion()];
        const totalPoints =
          typeof item.totalPoints === "number" && item.totalPoints > 0
            ? item.totalPoints
            : normalizedQuestions.reduce((sum, question) => sum + (question.points ?? 0), 0);
        return {
          ...item,
          totalPoints,
          questions: normalizedQuestions,
        };
      }),
    })),
  };
}

export default function CourseEditor({
  initialCourse,
  onSave,
  onCancel,
  submitLabel = "Save course",
}: CourseEditorProps) {
  const { authState, uploadMedia } = useAuth();
  const authenticatedName =
    authState.status === "authenticated" ? authState.user.name : undefined;
  const resolvedInstructor = initialCourse?.instructor ?? authenticatedName;
  const [course, setCourse] = useState<CourseEditorValues>(
    initialCourse ? normalizeCourseValues(initialCourse) : defaultCourse(resolvedInstructor),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"title" | "description" | "imageUrl", string>>>({});
  const [videoUploads, setVideoUploads] = useState<Record<string, VideoUploadState>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const clearFieldError = (field: "title" | "description" | "imageUrl") =>
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });

  useEffect(() => {
    if (initialCourse) {
      startTransition(() => {
        setCourse(normalizeCourseValues(initialCourse));
      });
    }
  }, [initialCourse]);

  useEffect(() => {
    if (!initialCourse && authenticatedName) {
      setCourse((prev) => {
        if (prev.instructor && prev.instructor !== "You") {
          return prev;
        }
        return {
          ...prev,
          instructor: authenticatedName,
        };
      });
    }
  }, [authenticatedName, initialCourse]);

  const handleFieldChange = (field: keyof CourseEditorValues, value: CourseEditorValues[typeof field]) => {
    if (submitError) {
      setSubmitError(null);
    }
    clearFieldError(field as "title" | "description" | "imageUrl");
    setCourse((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleModuleChange = (moduleId: string, updatedModule: Partial<CourseModule>) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              ...updatedModule,
            }
          : module,
      ),
    }));
  };

  const handleCourseImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setIsUploadingImage(true);
    setImageUploadError(null);
    try {
      const media = await uploadMedia(file);
      clearFieldError("imageUrl");
      setCourse((prev) => ({
        ...prev,
        imageUrl: media.url,
      }));
    } catch (error) {
      console.error("Failed to upload course cover", error);
      setImageUploadError("Failed to upload the course cover. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleResetCourseImage = () => {
    clearFieldError("imageUrl");
    setCourse((prev) => ({
      ...prev,
      imageUrl: "/course-thumbnails/nextjs.svg",
    }));
    setImageUploadError(null);
  };

  const courseImagePreview = course.imageUrl || "/course-thumbnails/nextjs.svg";

  const handleAddModule = () => {
    setCourse((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          id: generateId("module"),
          title: `Module ${prev.modules.length + 1}`,
          description: "",
          items: [],
        },
      ],
    }));
  };

  const handleRemoveModule = (moduleId: string) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.filter((module) => module.id !== moduleId),
    }));
  };

  const handleAddItem = (moduleId: string, type: CourseContentItem["type"]) => {
    const newItem: CourseContentItem =
      type === "text"
        ? {
            id: generateId("item"),
            type: "text",
            title: "New text lesson",
            body: "",
          }
        : type === "video"
          ? {
              id: generateId("item"),
              type: "video",
              title: "New video lesson",
              url: "",
              duration: "00:00",
              mediaId: undefined,
            }
          : {
              id: generateId("item"),
              type: "quiz",
              title: "New quiz",
              totalPoints: 0,
              questions: [createQuizQuestion()],
            };

    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              items: [...module.items, newItem],
            }
          : module,
      ),
    }));
  };

  const handleItemChange = (
    moduleId: string,
    itemId: string,
    updater: (item: CourseContentItem) => CourseContentItem,
  ) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              items: module.items.map((item) => (item.id === itemId ? updater(item) : item)),
            }
          : module,
      ),
    }));
  };

  const handleRemoveItem = (moduleId: string, itemId: string) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              items: module.items.filter((item) => item.id !== itemId),
            }
          : module,
      ),
    }));
  };

  const handleClearVideoSource = (moduleId: string, itemId: string) => {
    handleItemChange(moduleId, itemId, (current) =>
      current.type === "video"
        ? {
            ...current,
            url: "",
            mediaId: undefined,
          }
        : current,
    );
    setVideoUploads((previous) => ({
      ...previous,
      [itemId]: { status: "idle" },
    }));
  };

  const handleVideoUploadChange = async (
    moduleId: string,
    itemId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setVideoUploads((previous) => ({
      ...previous,
      [itemId]: { status: "uploading" },
    }));

    try {
      const media = await uploadMedia(file);
      handleItemChange(moduleId, itemId, (current) =>
        current.type === "video"
          ? {
              ...current,
              url: media.url,
              mediaId: media.id,
            }
          : current,
      );
      setVideoUploads((previous) => ({
        ...previous,
        [itemId]: { status: "success" },
      }));
    } catch (error) {
      console.error("Failed to upload video", error);
      setVideoUploads((previous) => ({
        ...previous,
        [itemId]: {
          status: "error",
          error: "Не вдалося завантажити відео. Спробуйте ще раз.",
        },
      }));
    }
  };

  const updateQuizItem = (
    moduleId: string,
    itemId: string,
    updater: (quiz: Extract<CourseContentItem, { type: "quiz" }>) => Extract<CourseContentItem, { type: "quiz" }>,
  ) => {
    handleItemChange(moduleId, itemId, (current) => {
      if (current.type !== "quiz") {
        return current;
      }
      return updater(current);
    });
  };

  const handleAddQuizQuestion = (moduleId: string, itemId: string) => {
    updateQuizItem(moduleId, itemId, (quiz) => ({
      ...quiz,
      questions: [...quiz.questions, createQuizQuestion()],
    }));
  };

  const handleRemoveQuizQuestion = (moduleId: string, itemId: string, questionId: string) => {
    updateQuizItem(moduleId, itemId, (quiz) => ({
      ...quiz,
      questions: quiz.questions.filter((question) => question.id !== questionId),
    }));
  };

  const handleQuizQuestionChange = (
    moduleId: string,
    itemId: string,
    questionId: string,
    updater: (question: QuizQuestionEditorState & { id: string }) => QuizQuestionEditorState & { id: string },
  ) => {
    updateQuizItem(moduleId, itemId, (quiz) => ({
      ...quiz,
      questions: quiz.questions.map((question) => (question.id === questionId ? updater(question) : question)),
    }));
  };

  const handleQuizOptionChange = (
    moduleId: string,
    itemId: string,
    questionId: string,
    optionIndex: number,
    value: string,
  ) => {
    handleQuizQuestionChange(moduleId, itemId, questionId, (question) => {
      const options = [...question.options];
      options[optionIndex] = value;
      return { ...question, options };
    });
  };

  const handleAddQuizOption = (moduleId: string, itemId: string, questionId: string) => {
    handleQuizQuestionChange(moduleId, itemId, questionId, (question) => ({
      ...question,
      options: [...question.options, `Option ${String.fromCharCode(65 + question.options.length)}`],
    }));
  };

  const handleRemoveQuizOption = (
    moduleId: string,
    itemId: string,
    questionId: string,
    optionIndex: number,
  ) => {
    handleQuizQuestionChange(moduleId, itemId, questionId, (question) => {
      if (question.options.length <= 2) {
        return question;
      }
      const options = question.options.filter((_, index) => index !== optionIndex);
      let answerIndex = question.answerIndex;
      if (optionIndex === answerIndex) {
        answerIndex = 0;
      } else if (optionIndex < answerIndex) {
        answerIndex -= 1;
      }
      return { ...question, options, answerIndex };
    });
  };

  const handleQuizAnswerSelect = (
    moduleId: string,
    itemId: string,
    questionId: string,
    optionIndex: number,
  ) => {
    handleQuizQuestionChange(moduleId, itemId, questionId, (question) => ({
      ...question,
      answerIndex: optionIndex,
    }));
  };

  const recalcQuizTotalPoints = (moduleId: string, itemId: string) => {
    updateQuizItem(moduleId, itemId, (quiz) => ({
      ...quiz,
      totalPoints: quiz.questions.reduce((sum, question) => sum + (question.points ?? 0), 0),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors: Partial<Record<"title" | "description" | "imageUrl", string>> = {};
    if (!course.title?.trim()) {
      validationErrors.title = "Title is required.";
    }
    if (!course.description?.trim()) {
      validationErrors.description = "Description is required.";
    }
    if (!course.imageUrl?.trim()) {
      validationErrors.imageUrl = "Cover image is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    try {
      setIsSaving(true);
      setSubmitError(null);
      await onSave(course);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "We couldn’t save the course. Please check the fields and try again.";
      setSubmitError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-5">
      <section className="card border-0 shadow-sm">
        <div className="card-body p-4 p-lg-5">
          <h2 className="h4 fw-semibold mb-4">Course details</h2>
          {submitError ? (
            <div className="alert alert-danger d-flex align-items-start gap-2" role="alert">
              <span aria-hidden>⚠️</span>
              <div>{submitError}</div>
            </div>
          ) : null}
          <div className="row g-4">
            <div className="col-lg-7">
              <label htmlFor="courseTitle" className="form-label fw-semibold">
                Title <span className="text-danger">*</span>
              </label>
              <input
                id="courseTitle"
                type="text"
                className="form-control form-control-lg"
                value={course.title}
                onChange={(event) => handleFieldChange("title", event.target.value)}
              />
              {fieldErrors.title ? <div className="text-danger small mt-1">{fieldErrors.title}</div> : null}
            </div>
            <div className="col-lg-5">
              <label htmlFor="courseCategory" className="form-label fw-semibold">
                Category
              </label>
              <input
                id="courseCategory"
                type="text"
                className="form-control form-control-lg"
                value={course.category}
                onChange={(event) => handleFieldChange("category", event.target.value)}
              />
            </div>
            <div className="col-lg-8">
              <label htmlFor="courseDescription" className="form-label fw-semibold">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                id="courseDescription"
                className="form-control"
                rows={4}
                value={course.description}
                onChange={(event) => handleFieldChange("description", event.target.value)}
              />
              {fieldErrors.description ? (
                <div className="text-danger small mt-1">{fieldErrors.description}</div>
              ) : null}
            </div>
            <div className="col-lg-4">
              <label className="form-label fw-semibold">
                Cover image <span className="text-danger">*</span>
              </label>
              <div className="border rounded-4 overflow-hidden mb-3 bg-light-subtle" style={{ minHeight: "160px" }}>
                <img src={courseImagePreview} alt="Course cover" className="img-fluid w-100" />
              </div>
              <label className="form-label">Image URL</label>
              <input
                type="url"
                className="form-control"
                value={course.imageUrl}
                onChange={(event) => handleFieldChange("imageUrl", event.target.value)}
                placeholder="https://example.com/cover.jpg"
              />
              {fieldErrors.imageUrl ? (
                <div className="text-danger small mt-1">{fieldErrors.imageUrl}</div>
              ) : null}
              <div className="mt-3">
                <label className="form-label">Upload cover</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleCourseImageUpload}
                  disabled={isUploadingImage}
                />
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <small className="text-secondary">Use your own cover or leave the default one.</small>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleResetCourseImage}>
                    Reset
                  </button>
                </div>
                {isUploadingImage && <small className="text-primary d-block mt-2">Uploading cover...</small>}
                {imageUploadError && <small className="text-danger d-block mt-2">{imageUploadError}</small>}
              </div>
            </div>
            <div className="col-lg-4">
              <label htmlFor="coursePrice" className="form-label fw-semibold">
                Price (USD)
              </label>
              <input
                id="coursePrice"
                type="number"
                min={0}
                step="0.01"
                className="form-control form-control-lg"
                value={course.price}
                onChange={(event) => handleFieldChange("price", Number(event.target.value))}
              />
              <div className="form-check form-switch mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="coursePublished"
                  checked={course.isPublished}
                  onChange={(event) => handleFieldChange("isPublished", event.target.checked)}
                />
                <label className="form-check-label" htmlFor="coursePublished">
                  Publish immediately
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card border-0 shadow-sm">
        <div className="card-body p-4 p-lg-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h4 fw-semibold mb-0">Modules & content</h2>
            <button type="button" className="btn btn-outline-primary" onClick={handleAddModule}>
              Add module
            </button>
          </div>

          <div className="d-flex flex-column gap-4">
            {course.modules.map((module, index) => (
              <div key={module.id} className="border rounded-4 p-4">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <div className="flex-grow-1">
                    <label className="form-label fw-semibold">
                      Module {index + 1} title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={module.title}
                      onChange={(event) => handleModuleChange(module.id, { title: event.target.value })}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleRemoveModule(module.id)}
                    disabled={course.modules.length === 1}
                  >
                    Remove
                  </button>
                </div>
                <div className="mb-4">
                  <label className="form-label">Description (optional)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={module.description ?? ""}
                    onChange={(event) => handleModuleChange(module.id, { description: event.target.value })}
                  />
                </div>

                <div className="d-flex gap-2 mb-3">
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleAddItem(module.id, "text")}>
                    Add text
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleAddItem(module.id, "video")}>
                    Add video
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleAddItem(module.id, "quiz")}>
                    Add quiz
                  </button>
                </div>

                {module.items.length === 0 ? (
                  <p className="text-secondary small mb-0">No content yet. Add lessons or assessments above.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {module.items.map((item, itemIndex) => (
                      <div key={item.id} className="border rounded-3 p-3 bg-light-subtle">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold me-2">
                              {item.type.toUpperCase()}
                            </span>
                            <span className="fw-semibold">Lesson {itemIndex + 1}</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveItem(module.id, item.id)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-semibold">Title</label>
                          <input
                            type="text"
                            className="form-control"
                            value={item.title}
                            onChange={(event) =>
                              handleItemChange(module.id, item.id, (current) => ({
                                ...current,
                                title: event.target.value,
                              }))
                            }
                          />
                        </div>
                        {item.type === "text" && (
                          <div>
                            <label className="form-label">Content</label>
                            <textarea
                              className="form-control"
                              rows={4}
                              value={item.body}
                              onChange={(event) =>
                                handleItemChange(module.id, item.id, (current) =>
                                  current.type === "text" ? { ...current, body: event.target.value } : current,
                                )
                              }
                            />
                          </div>
                        )}
                        {item.type === "video" && (
                          <div className="row g-3">
                            <div className="col-md-8">
                              <label className="form-label">Video URL</label>
                              <input
                                type="url"
                                className="form-control"
                                value={item.url}
                                onChange={(event) =>
                                  handleItemChange(module.id, item.id, (current) =>
                                    current.type === "video" ? { ...current, url: event.target.value } : current,
                                  )
                                }
                                placeholder="Will be auto-filled after upload"
                              />
                              <div className="form-text">Paste a link or upload a file below.</div>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">Duration (mm:ss)</label>
                              <input
                                type="text"
                                className="form-control"
                                value={item.duration}
                                onChange={(event) =>
                                  handleItemChange(module.id, item.id, (current) =>
                                    current.type === "video" ? { ...current, duration: event.target.value } : current,
                                  )
                                }
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Upload video file</label>
                              <input
                                type="file"
                                accept="video/*"
                                className="form-control"
                                onChange={(event) => handleVideoUploadChange(module.id, item.id, event)}
                                disabled={videoUploads[item.id]?.status === "uploading"}
                              />
                              <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mt-2 gap-2">
                                <small className="text-secondary">
                                  {item.mediaId
                                    ? "Uploaded video is linked to this lesson."
                                    : "Upload your own video or keep using an external link."}
                                </small>
                                {(item.mediaId || item.url) && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleClearVideoSource(module.id, item.id)}
                                  >
                                    Clear video
                                  </button>
                                )}
                              </div>
                              {videoUploads[item.id]?.status === "uploading" && (
                                <small className="text-primary d-block mt-2">Uploading video...</small>
                              )}
                              {videoUploads[item.id]?.status === "success" && (
                                <small className="text-success d-block mt-2">
                                  Video uploaded successfully. URL updated automatically.
                                </small>
                              )}
                              {videoUploads[item.id]?.status === "error" && (
                                <small className="text-danger d-block mt-2">
                                  {videoUploads[item.id]?.error ?? "We couldn't upload this video. Try again."}
                                </small>
                              )}
                            </div>
                          </div>
                        )}
                        {item.type === "quiz" && (
                          <div className="d-flex flex-column gap-4">
                            <div className="row g-3 align-items-end">
                              <div className="col-md-4">
                                <label className="form-label">Total points</label>
                                <input
                                  type="number"
                                  min={0}
                                  className="form-control"
                                  value={item.totalPoints}
                                  onChange={(event) =>
                                    handleItemChange(module.id, item.id, (current) =>
                                      current.type === "quiz"
                                        ? { ...current, totalPoints: Number(event.target.value) }
                                        : current,
                                    )
                                  }
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary mt-2"
                                  onClick={() => recalcQuizTotalPoints(module.id, item.id)}
                                >
                                  Recalculate from questions
                                </button>
                              </div>
                              <div className="col-md-8">
                                <label className="form-label">Quiz overview</label>
                                <div className="p-3 border rounded-3 bg-light-subtle">
                                  <p className="mb-1 fw-semibold">Questions: {item.questions.length}</p>
                                  <p className="mb-0 text-secondary small">
                                    Number of points for the question:{" "}
                                    {item.questions.reduce((sum, question) => sum + (question.points ?? 0), 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="h6 fw-semibold mb-0">Questions</h4>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleAddQuizQuestion(module.id, item.id)}
                                >
                                  Add question
                                </button>
                              </div>
                              {item.questions.length === 0 ? (
                                <p className="text-secondary small mb-0">
                                  Немає питань. Додайте перше питання кнопкою вище.
                                </p>
                              ) : (
                                <div className="d-flex flex-column gap-3">
                                  {item.questions.map((question, questionIndex) => (
                                    <div key={question.id ?? `quiz-question-${questionIndex}`} className="border rounded-4 p-3 bg-light-subtle">
                                      <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="fw-semibold">Question {questionIndex + 1}</span>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleRemoveQuizQuestion(module.id, item.id, question.id)}
                                          disabled={item.questions.length === 1}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                      <div className="mb-3">
                                      <label className="form-label">Question text</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={question.question ?? ""}
                                          onChange={(event) =>
                                            handleQuizQuestionChange(module.id, item.id, question.id, (current) => ({
                                              ...current,
                                              question: event.target.value,
                                            }))
                                          }
                                        />
                                      </div>
                                      <div className="row g-3 mb-3">
                                        <div className="col-md-4">
                                          <label className="form-label">Points</label>
                                          <input
                                            type="number"
                                            min={0}
                                            className="form-control"
                                            value={question.points ?? 0}
                                            onChange={(event) =>
                                              handleQuizQuestionChange(module.id, item.id, question.id, (current) => ({
                                                ...current,
                                                points: Number(event.target.value),
                                              }))
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div className="d-flex flex-column gap-2">
                                        <label className="form-label mb-1">Answer options</label>
                                        {(question.options ?? ["Option A", "Option B"]).map((option = "", optionIndex) => (
                                          <div className="input-group" key={`${question.id}-${optionIndex}`}>
                                            <span className="input-group-text">
                                              <input
                                                type="radio"
                                                name={`${question.id}-answer`}
                                                checked={question.answerIndex === optionIndex}
                                                onChange={() =>
                                                  handleQuizAnswerSelect(module.id, item.id, question.id, optionIndex)
                                                }
                                                aria-label="Mark as correct answer"
                                              />
                                            </span>
                                            <input
                                              type="text"
                                              className="form-control"
                                              value={option}
                                              onChange={(event) =>
                                                handleQuizOptionChange(
                                                  module.id,
                                                  item.id,
                                                  question.id,
                                                  optionIndex,
                                                  event.target.value,
                                                )
                                              }
                                            />
                                            <button
                                              type="button"
                                              className="btn btn-outline-danger"
                                              disabled={question.options.length <= 2}
                                              onClick={() =>
                                                handleRemoveQuizOption(module.id, item.id, question.id, optionIndex)
                                              }
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        ))}
                                        <div className="d-flex justify-content-between align-items-center">
                                          <small className="text-secondary">Mark the correct answer with the radio button.</small>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => handleAddQuizOption(module.id, item.id, question.id)}
                                          >
                                            Add option
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="d-flex justify-content-end gap-3">
        {onCancel && (
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
