import React, { useState } from "react";
import {
  BookOpen, Search, User, CheckCircle2, ArrowUpRight, Plus,
  Sparkles, Layers, Clock, X, ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function CoursesView({ courses, onEnroll, notify, loading }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeCourse, setActiveCourse] = useState(null);

  const categories = ["All", "Database Systems", "Data Structures", "Artificial Intelligence", "Software Engineering"];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = `${c.title} ${c.description} ${c.instructor_name}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEnrollClick = async (courseId) => {
    try {
      await onEnroll(courseId);
      notify("Successfully enrolled in course!");
    } catch {
      notify("Enrollment could not be completed.");
    }
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ACADEMIC CATALOG</div>
          <h1>Explore Courses</h1>
          <p>Discover curriculum-aligned university courses, track your learning mastery, and enroll with one click.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="forum-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            placeholder="Search courses, instructors, or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={selectedCategory === cat ? "selected" : ""}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="loading-state">Loading courses from database...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="empty-state">No courses found matching your criteria.</div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div className="course-card" key={course.id}>
              <div className="course-card-image" style={{ backgroundImage: `url(${course.image_url})` }}>
                <span className="course-category-tag">{course.category}</span>
                {course.enrolled && (
                  <span className="enrolled-badge">
                    <CheckCircle2 size={12} /> Enrolled
                  </span>
                )}
              </div>
              <div className="course-card-content">
                <div className="course-instructor">
                  <User size={13} /> {course.instructor_name}
                </div>
                <h3>{course.title}</h3>
                <p className="course-desc">{course.description}</p>

                {/* Syllabus preview */}
                {course.syllabus && course.syllabus.length > 0 && (
                  <div className="syllabus-tags">
                    {course.syllabus.slice(0, 3).map((topic, i) => (
                      <span key={i} className="syllabus-pill">{topic}</span>
                    ))}
                    {course.syllabus.length > 3 && (
                      <span className="syllabus-more">+{course.syllabus.length - 3}</span>
                    )}
                  </div>
                )}

                {course.enrolled ? (
                  <div className="course-progress-block">
                    <div className="course-progress-header">
                      <span>Course Progress</span>
                      <strong>{course.progress || 10}%</strong>
                    </div>
                    <div className="mastery-track">
                      <div className="mastery-fill" style={{ width: `${course.progress || 10}%` }} />
                    </div>
                    <button
                      className="secondary-button small full-button"
                      onClick={() => setActiveCourse(course)}
                    >
                      View Syllabus & Notes <ChevronRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="course-card-footer">
                    <button
                      className="text-button"
                      onClick={() => setActiveCourse(course)}
                    >
                      Syllabus Details <ArrowUpRight size={13} />
                    </button>
                    <button
                      className="primary-button small"
                      onClick={() => handleEnrollClick(course.id)}
                    >
                      Enroll Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Detail Modal */}
      {activeCourse && (
        <div className="modal-backdrop" onClick={() => setActiveCourse(null)}>
          <div className="modal course-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">{activeCourse.category}</span>
                <h2>{activeCourse.title}</h2>
              </div>
              <button className="icon-button" onClick={() => setActiveCourse(null)} aria-label="Close">
                <X size={19} />
              </button>
            </div>
            <p className="modal-subtitle">Instructor: {activeCourse.instructor_name}</p>
            <p className="detail-copy">{activeCourse.description}</p>

            <h4 className="syllabus-heading"><Layers size={16} /> Course Syllabus & Key Modules</h4>
            <div className="syllabus-modal-list">
              {(activeCourse.syllabus || ["Overview", "Foundations", "Advanced Practice"]).map((mod, idx) => (
                <div key={idx} className="syllabus-modal-item">
                  <span className="mod-number">Module {idx + 1}</span>
                  <strong>{mod}</strong>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setActiveCourse(null)}>Close</button>
              {!activeCourse.enrolled && (
                <button
                  className="primary-button"
                  onClick={() => {
                    handleEnrollClick(activeCourse.id);
                    setActiveCourse(null);
                  }}
                >
                  Confirm Enrollment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

