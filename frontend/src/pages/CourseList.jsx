import { useDeferredValue, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCourses } from '../hooks/useCourses';
import { createEnrollment, getAllEnrollments } from '../services/enrollmentService';
import CourseCard from '../components/CourseCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getCourseCategories, getCourseCategory } from '../utils/courseMeta';

const COURSES_PER_PAGE = 9;

export default function CourseList() {
  const { user } = useAuth();
  const { courses, loading, error } = useCourses();
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [msg, setMsg] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [viewFilter, setViewFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearch = useDeferredValue(searchValue.trim().toLowerCase());
  const categories = getCourseCategories(courses);

  useEffect(() => {
    if (!user) return;

    getAllEnrollments()
      .then(res => {
        const mine = (res.data.data || []).filter(e => e.user_id === user?.id);
        setEnrolledIds(mine.map(e => e.course_id));
      })
      .catch(() => {});
  }, [user]);

  const handleEnroll = async (courseId) => {
    try {
      await createEnrollment({ user_id: user.id, course_id: courseId });
      setEnrolledIds(prev => [...prev, courseId]);
      setMsg('Enrolled successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Enrollment failed');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const visibleCourses = courses.filter(course => {
    const searchTarget = `${course.title} ${course.description || ''} ${course.instructor_name || ''}`.toLowerCase();
    const matchesSearch = !deferredSearch || searchTarget.includes(deferredSearch);
    const isEnrolled = enrolledIds.includes(course.id);
    const matchesEnrollmentFilter = user?.role !== 'learner' || (
      viewFilter === 'all' ||
      (viewFilter === 'enrolled' && isEnrolled) ||
      (viewFilter === 'available' && !isEnrolled)
    );
    const category = getCourseCategory(course);
    const matchesCategory = categoryFilter === 'All Categories' || category === categoryFilter;

    return matchesSearch && matchesEnrollmentFilter && matchesCategory;
  });

  const summary = {
    courses: visibleCourses.length,
    modules: visibleCourses.reduce((sum, course) => sum + Number(course.module_count || 0), 0),
    lessons: visibleCourses.reduce((sum, course) => sum + Number(course.lesson_count || 0), 0),
    learners: visibleCourses.reduce((sum, course) => sum + Number(course.learner_count || 0), 0)
  };
  const hasCatalogError = Boolean(error);
  const hasSearchFilters = deferredSearch.length > 0 || viewFilter !== 'all' || categoryFilter !== 'All Categories';
  const shouldShowFilteredEmptyState = !hasCatalogError && courses.length > 0 && visibleCourses.length === 0;
  const shouldShowCatalogEmptyState = !hasCatalogError && courses.length === 0;
  const totalPages = Math.max(1, Math.ceil(visibleCourses.length / COURSES_PER_PAGE));
  const paginatedCourses = visibleCourses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, viewFilter, categoryFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <span className="section-eyebrow">Catalog workspace</span>
          <h1 className="catalog-title">Course Catalog</h1>
          <p className="catalog-subtitle">Explore structured programs, compare course depth at a glance, and enroll with a clearer sense of scope.</p>
        </div>
        <div className="catalog-summary-grid">
          <div className="catalog-summary-card">
            <span className="catalog-summary-label">Visible Courses</span>
            <strong className="catalog-summary-value">{summary.courses}</strong>
          </div>
          <div className="catalog-summary-card">
            <span className="catalog-summary-label">Modules</span>
            <strong className="catalog-summary-value">{summary.modules}</strong>
          </div>
          <div className="catalog-summary-card">
            <span className="catalog-summary-label">Lessons</span>
            <strong className="catalog-summary-value">{summary.lessons}</strong>
          </div>
          <div className="catalog-summary-card">
            <span className="catalog-summary-label">Learner Seats</span>
            <strong className="catalog-summary-value">{summary.learners}</strong>
          </div>
        </div>
      </section>

      <section className="catalog-toolbar">
        <label className="catalog-search">
          <span className="catalog-search-label">Search</span>
          <input
            className="form-input"
            type="search"
            placeholder="Search by title, description, or instructor"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </label>
        {user?.role === 'learner' && (
          <div className="catalog-filters">
            {[
              { key: 'all', label: 'All Courses' },
              { key: 'available', label: 'Open to Enroll' },
              { key: 'enrolled', label: 'Already Enrolled' }
            ].map(filter => (
              <button
                key={filter.key}
                type="button"
                className={`catalog-filter-btn ${viewFilter === filter.key ? 'active' : ''}`}
                onClick={() => setViewFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </section>
      <section className="catalog-category-row">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`catalog-filter-btn ${categoryFilter === category ? 'active' : ''}`}
            onClick={() => setCategoryFilter(category)}
          >
            {category}
          </button>
        ))}
      </section>

      {msg && <div className={`toast ${msg.includes('fail') ? 'toast-error' : 'toast-success'}`}>{msg}</div>}
      <ErrorMessage message={error} />
      <div className="course-grid">
        {paginatedCourses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onEnroll={handleEnroll}
            enrolled={enrolledIds.includes(course.id)}
            showEnroll={user?.role === 'learner'}
          />
        ))}
      </div>
      {!hasCatalogError && visibleCourses.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={visibleCourses.length}
          itemLabel="courses"
          onPageChange={setCurrentPage}
        />
      )}
      {shouldShowFilteredEmptyState && (
        <div className="catalog-empty">
          <span className="catalog-empty-kicker">No matches found</span>
          <h2 className="catalog-empty-title">Try a broader search or switch back to all courses.</h2>
          <p className="catalog-empty-text">Your filters are active, so the catalog is only showing results that meet the current search and enrollment view.</p>
        </div>
      )}
      {shouldShowCatalogEmptyState && (
        <div className="catalog-empty">
          <span className="catalog-empty-kicker">Catalog not populated yet</span>
          <h2 className="catalog-empty-title">The course catalog is still empty.</h2>
          <p className="catalog-empty-text">Run the sample seed command to generate a fuller catalog with courses, modules, lessons, enrollments, and analytics data.</p>
        </div>
      )}
      {hasCatalogError && (
        <div className="catalog-empty">
          <span className="catalog-empty-kicker">Catalog unavailable</span>
          <h2 className="catalog-empty-title">We could not load the course catalog right now.</h2>
          <p className="catalog-empty-text">
            {hasSearchFilters
              ? 'The backend request failed, so the catalog is temporarily unavailable. Clear the current error and then re-apply your search or filter.'
              : 'Restart the backend after this fix, then refresh the page. If the catalog is still empty, run the sample seed command to populate more data.'}
          </p>
        </div>
      )}
    </div>
  );
}
