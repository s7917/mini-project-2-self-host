import { useNavigate } from 'react-router-dom';

export default function CourseCard({ course, onEnroll, enrolled, showEnroll = false }) {
  const navigate = useNavigate();
  const moduleCount = Number(course.module_count || 0);
  const lessonCount = Number(course.lesson_count || 0);
  const learnerCount = Number(course.learner_count || 0);
  const spotlight = enrolled ? 'Enrolled' : learnerCount >= 8 ? 'Popular Cohort' : 'Open Cohort';

  return (
    <div className="course-card" onClick={() => navigate(`/courses/${course.id}`)}>
      <div className="course-card-gradient"></div>
      <div className="course-card-content">
        <div className="course-card-topline">
          <span className={`course-card-spotlight ${enrolled ? 'course-card-spotlight-enrolled' : ''}`}>{spotlight}</span>
          <span className="course-card-id">Course {String(course.id).padStart(2, '0')}</span>
        </div>
        <h3 className="course-card-title">{course.title}</h3>
        <p className="course-card-desc">{course.description || 'No description available'}</p>
        <div className="course-card-instructor">Led by {course.instructor_name || 'Instructor'}</div>
        <div className="course-card-metrics">
          <div className="course-card-metric">
            <span className="course-card-metric-value">{moduleCount}</span>
            <span className="course-card-metric-label">Modules</span>
          </div>
          <div className="course-card-metric">
            <span className="course-card-metric-value">{lessonCount}</span>
            <span className="course-card-metric-label">Lessons</span>
          </div>
          <div className="course-card-metric">
            <span className="course-card-metric-value">{learnerCount}</span>
            <span className="course-card-metric-label">Learners</span>
          </div>
        </div>
        <div className="course-card-footer">
          {showEnroll && !enrolled && (
            <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onEnroll && onEnroll(course.id); }}>
              Enroll Now
            </button>
          )}
          {enrolled && <span className="enrolled-badge">Currently in your plan</span>}
          <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.id}`); }}>
            View Syllabus
          </button>
        </div>
      </div>
    </div>
  );
}
