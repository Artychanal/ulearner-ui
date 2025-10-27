'use client';

import { useMemo, useState } from "react";
import CourseCard from "@/components/CourseCard";
import { courseCategories, courses, type Course } from "@/data/courses";

type SortOption = "featured" | "price-asc" | "price-desc";

function normalizeText(value: string) {
  return value.toLowerCase();
}

function applySearch(items: Course[], query: string) {
  if (!query.trim()) {
    return items;
  }

  const normalized = normalizeText(query);

  return items.filter((course) => {
    const haystack = [
      course.title,
      course.description,
      course.instructor,
      course.category,
    ]
      .map(normalizeText)
      .join(" ");

    return haystack.includes(normalized);
  });
}

function applyCategoryFilter(items: Course[], categories: string[]) {
  if (categories.length === 0) {
    return items;
  }

  const selected = new Set(categories);
  return items.filter((course) => selected.has(course.category));
}

function applySort(items: Course[], sort: SortOption) {
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

  const filteredCourses = useMemo(() => {
    const afterSearch = applySearch(courses, query);
    const afterCategoryFilter = applyCategoryFilter(afterSearch, selectedCategories);
    return applySort(afterCategoryFilter, sort);
  }, [query, selectedCategories, sort]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  };

  const activeFilters = query.trim().length > 0 || selectedCategories.length > 0 || sort !== "featured";

  const resetFilters = () => {
    setQuery("");
    setSelectedCategories([]);
    setSort("featured");
  };

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
                  <span className="form-label small text-uppercase text-secondary fw-semibold d-block mb-2">
                    Categories
                  </span>
                  <div className="d-flex flex-wrap gap-2">
                    {courseCategories.map((category) => {
                      const inputId = `category-${category.replace(/\s+/g, "-").toLowerCase()}`;
                      const selected = selectedCategories.includes(category);

                      return (
                        <div key={category} className="form-check form-check-inline m-0">
                          <input
                            id={inputId}
                            type="checkbox"
                            className="btn-check"
                            checked={selected}
                            onChange={() => handleCategoryToggle(category)}
                          />
                          <label
                            className={`btn btn-sm btn-outline-primary rounded-pill ${selected ? "active" : ""}`}
                            htmlFor={inputId}
                          >
                            {category}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="col-12 col-lg-2">
                  <label htmlFor="sort-select" className="form-label small text-uppercase text-secondary fw-semibold">
                    Sort by
                  </label>
                  <select
                    id="sort-select"
                    className="form-select form-select-lg"
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortOption)}
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to high</option>
                    <option value="price-desc">Price: High to low</option>
                  </select>
                </div>
              </div>
              {activeFilters && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <span className="text-secondary small">
                    Showing {filteredCourses.length} of {courses.length} courses
                  </span>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetFilters}>
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-secondary">
            {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"} available
          </span>
          {!activeFilters && <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">Trending</span>}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-5">
            <h2 className="h4 fw-semibold mb-2">No courses match your filters</h2>
            <p className="text-secondary mb-3">Try adjusting your keywords or selecting different categories.</p>
            <button type="button" className="btn btn-outline-primary" onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredCourses.map((course) => (
              <div key={course.id} className="col-md-6 col-xl-4 d-flex">
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
