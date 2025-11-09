'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CourseCard from "@/components/CourseCard";
import type { CourseSummary } from "@/types/course";
import { fetchCatalogCourses } from "@/lib/catalog-service";
import { adaptCatalogCourse, extractCourseCategories } from "@/lib/catalog-adapter";

type SortOption = "featured" | "price-asc" | "price-desc";

function normalizeText(value: string) {
  return value.toLowerCase();
}

function applySearch(items: CourseSummary[], query: string) {
  if (!query.trim()) {
    return items;
  }

  const normalized = normalizeText(query);

  return items.filter((course) => {
    const haystack = [course.title, course.description, course.instructor, course.category]
      .map(normalizeText)
      .join(" ");

    return haystack.includes(normalized);
  });
}

function applyCategoryFilter(items: CourseSummary[], categories: string[]) {
  if (categories.length === 0) {
    return items;
  }

  const selected = new Set(categories);
  return items.filter((course) => selected.has(course.category));
}

function applySort(items: CourseSummary[], sort: SortOption) {
  if (sort === "price-asc") {
    return [...items].sort((a, b) => a.price - b.price);
  }

  if (sort === "price-desc") {
    return [...items].sort((a, b) => b.price - a.price);
  }

  return items;
}

export default function CoursesPage() {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("featured");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchCatalogCourses({ limit: 200 });
        const normalized = response.items.map(adaptCatalogCourse);

        if (active) {
          setCourses(normalized);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load courses");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  const courseCategories = useMemo(() => extractCourseCategories(courses), [courses]);

  const selectedCategoryList = courseCategories.filter((category) => selectedCategories.includes(category));

  const categorySummary =
    selectedCategoryList.length === 0
      ? "All categories"
      : selectedCategoryList.length === 1
        ? selectedCategoryList[0]
        : `${selectedCategoryList[0]} +${selectedCategoryList.length - 1}`;

  const filteredCourses = useMemo(() => {
    const afterSearch = applySearch(courses, query);
    const afterCategoryFilter = applyCategoryFilter(afterSearch, selectedCategories);
    return applySort(afterCategoryFilter, sort);
  }, [courses, query, selectedCategories, sort]);

  const handleCategoryToggle = useCallback((category: string) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  }, []);

  const activeFilters = query.trim().length > 0 || selectedCategories.length > 0 || sort !== "featured";

  const resetFilters = () => {
    setQuery("");
    setSelectedCategories([]);
    setSort("featured");
    setIsCategoryMenuOpen(false);
  };

  useEffect(() => {
    if (!isCategoryMenuOpen) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const container = categoryDropdownRef.current;

      if (container && !container.contains(target)) {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isCategoryMenuOpen]);

  useEffect(() => {
    if (!isCategoryMenuOpen) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isCategoryMenuOpen]);

  return (
    <section className="py-5">
      <div className="container">
        <header className="d-flex flex-column gap-3 gap-lg-4 mb-4 mb-lg-5">
          <div>
            <p className="text-primary fw-semibold mb-2 text-uppercase small">Explore</p>
            <h1 className="display-6 fw-bold mb-2">All courses</h1>
            <p className="text-secondary mb-0">
              Search and filter the complete ULearner catalog to find the next course you want to master.
            </p>
          </div>
          <div className="card border-0 shadow-sm catalog-filter-card">
            <div className="card-body p-3 p-lg-4">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-lg-6">
                  <label htmlFor="catalog-search" className="form-label small text-uppercase text-secondary fw-semibold">
                    Search
                  </label>
                  <input
                    id="catalog-search"
                    type="search"
                    className="form-control form-control-lg"
                    placeholder="Search by title, instructor, or keyword"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <div className="col-12 col-lg-4">
                  <span
                    id="catalog-category-label"
                    className="form-label small text-uppercase text-secondary fw-semibold d-block mb-2"
                  >
                    Categories
                  </span>
                  <div ref={categoryDropdownRef} className="position-relative">
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100 d-flex justify-content-between align-items-center"
                      aria-expanded={isCategoryMenuOpen}
                      aria-haspopup="menu"
                      aria-controls="catalog-category-menu"
                      aria-labelledby="catalog-category-label"
                      onClick={() => setIsCategoryMenuOpen((open) => !open)}
                    >
                      <span className="text-truncate">{categorySummary}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                        style={{
                          transition: "transform 0.2s ease-in-out",
                          transform: isCategoryMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {isCategoryMenuOpen && (
                      <div
                        id="catalog-category-menu"
                        className="dropdown-menu show w-100 shadow-sm border-0 mt-2 p-3"
                        role="menu"
                        aria-labelledby="catalog-category-label"
                      >
                        <div className="d-flex flex-column gap-2">
                          {courseCategories.map((category) => {
                            const checked = selectedCategories.includes(category);
                            return (
                              <label key={category} className="d-flex align-items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={checked}
                                  onChange={() => handleCategoryToggle(category)}
                                />
                                <span>{category}</span>
                              </label>
                            );
                          })}
                          {courseCategories.length === 0 && (
                            <p className="text-secondary small mb-0">Categories will appear once courses load.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-12 col-lg-2">
                  <label htmlFor="catalog-sort" className="form-label small text-uppercase text-secondary fw-semibold">
                    Sort by
                  </label>
                  <select
                    id="catalog-sort"
                    className="form-select form-select-lg"
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortOption)}
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
              {activeFilters && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <span className="small text-secondary">Filters applied</span>
                  <button type="button" className="btn btn-link btn-sm text-decoration-none" onClick={resetFilters}>
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading courses…</span>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center text-secondary py-5">
            <p className="mb-3">No courses match your filters just yet.</p>
            {activeFilters && (
              <button type="button" className="btn btn-outline-primary" onClick={resetFilters}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="row g-4">
            {filteredCourses.map((course) => (
              <div key={course.id} className="col-md-6 col-lg-4">
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
