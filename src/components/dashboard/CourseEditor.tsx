'use client';

import { startTransition, useEffect, useState } from "react";
import type { AuthoredCourse, CourseContentItem, CourseModule } from "@/types/course";
import { generateId } from "@/lib/id";

export type CourseEditorValues = Omit<AuthoredCourse, "lastUpdated">;

type CourseEditorProps = {
  initialCourse?: CourseEditorValues;
  onSave: (course: CourseEditorValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
};

const defaultCourse = (): CourseEditorValues => ({
  id: generateId("course-draft"),
  title: "Untitled course",
  instructor: "You",
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

export default function CourseEditor({
  initialCourse,
  onSave,
  onCancel,
  submitLabel = "Save course",
}: CourseEditorProps) {
  const [course, setCourse] = useState<CourseEditorValues>(initialCourse ?? defaultCourse());

  useEffect(() => {
    if (initialCourse) {
      startTransition(() => {
        setCourse(initialCourse);
      });
    }
  }, [initialCourse]);

  const handleFieldChange = (field: keyof CourseEditorValues, value: CourseEditorValues[typeof field]) => {
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
            }
          : {
              id: generateId("item"),
              type: "quiz",
              title: "New quiz",
              totalPoints: 0,
              questions: [],
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

  const handleItemChange = (moduleId: string, itemId: string, itemPatch: Partial<CourseContentItem>) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              items: module.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      ...itemPatch,
                    }
                  : item,
              ),
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(course);
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-5">
      <section className="card border-0 shadow-sm">
        <div className="card-body p-4 p-lg-5">
          <h2 className="h4 fw-semibold mb-4">Course details</h2>
          <div className="row g-4">
            <div className="col-lg-7">
              <label htmlFor="courseTitle" className="form-label fw-semibold">
                Title
              </label>
              <input
                id="courseTitle"
                type="text"
                className="form-control form-control-lg"
                value={course.title}
                onChange={(event) => handleFieldChange("title", event.target.value)}
                required
              />
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
                Description
              </label>
              <textarea
                id="courseDescription"
                className="form-control"
                rows={4}
                value={course.description}
                onChange={(event) => handleFieldChange("description", event.target.value)}
              />
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
                            onChange={(event) => handleItemChange(module.id, item.id, { title: event.target.value })}
                          />
                        </div>
                        {item.type === "text" && (
                          <div>
                            <label className="form-label">Content</label>
                            <textarea
                              className="form-control"
                              rows={4}
                              value={item.body}
                              onChange={(event) => handleItemChange(module.id, item.id, { body: event.target.value })}
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
                                onChange={(event) => handleItemChange(module.id, item.id, { url: event.target.value })}
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">Duration (mm:ss)</label>
                              <input
                                type="text"
                                className="form-control"
                                value={item.duration}
                                onChange={(event) => handleItemChange(module.id, item.id, { duration: event.target.value })}
                              />
                            </div>
                          </div>
                        )}
                        {item.type === "quiz" && (
                          <div className="row g-3">
                            <div className="col-md-4">
                              <label className="form-label">Total points</label>
                              <input
                                type="number"
                                min={0}
                                className="form-control"
                                value={item.totalPoints}
                                onChange={(event) => handleItemChange(module.id, item.id, { totalPoints: Number(event.target.value) })}
                              />
                            </div>
                            <div className="col-md-8">
                              <label className="form-label">Questions summary</label>
                              <textarea
                                className="form-control"
                                rows={3}
                                value={item.questions.map((question) => `• ${question.question} (${question.points} pts)`).join("\n")}
                                readOnly
                                placeholder="Add questions via the quiz builder (coming soon)"
                              />
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
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
