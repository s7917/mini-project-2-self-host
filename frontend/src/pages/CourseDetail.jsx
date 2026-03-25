import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../services/courseService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function getLessonPreview(content) {
  if (!content) return 'Detailed lesson notes will appear here once the lesson content is available.';
  return content.split('\n\n')[0].replace(/^Overview\s*/i, '').trim();
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCourseById(id)
      .then(res => setCourse(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Course not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="page-container"><ErrorMessage message={error} /></div>;

  const totalModules = course.modules?.length || 0;
  const totalLessons = course.modules?.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0;
  const learners = Number(course.learner_count || 0);

  return (
    <div className="page-container">
      <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back</button>
      <section className="course-detail-hero">
        <div className="detail-header">
          <span className="section-eyebrow">Course deep dive</span>
          <h1 className="page-title">{course.title}</h1>
          <span className="detail-instructor">By {course.instructor_name || 'Instructor'}</span>
          <p className="detail-description">{course.description}</p>
        </div>
        <div className="course-detail-metrics">
          <div className="course-detail-metric">
            <span className="course-detail-metric-value">{totalModules}</span>
            <span className="course-detail-metric-label">Modules</span>
          </div>
          <div className="course-detail-metric">
            <span className="course-detail-metric-value">{totalLessons}</span>
            <span className="course-detail-metric-label">Lessons</span>
          </div>
          <div className="course-detail-metric">
            <span className="course-detail-metric-value">{learners}</span>
            <span className="course-detail-metric-label">Learners</span>
          </div>
        </div>
      </section>
      
      <div className="modules-section">
        <h2 className="section-title">Modules & Lessons</h2>
        {course.modules && course.modules.length > 0 ? (
          course.modules.map((mod, i) => (
            <div key={mod.id} className="module-card">
              <div className="module-header">
                <span className="module-order">{i + 1}</span>
                <div className="module-header-copy">
                  <h3 className="module-name">{mod.module_name}</h3>
                  <span className="module-subtitle">{mod.lessons?.length || 0} guided lessons in this module</span>
                </div>
              </div>
              {mod.lessons && mod.lessons.length > 0 ? (
                <ul className="lesson-list">
                  {mod.lessons.map(lesson => (
                    <li key={lesson.id} className="lesson-item lesson-item-detailed">
                      <span className="lesson-icon">📄</span>
                      <div className="lesson-item-copy">
                        <span className="lesson-item-title">{lesson.lesson_name}</span>
                        <p className="lesson-item-preview">{getLessonPreview(lesson.content)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-lessons">No lessons yet</p>
              )}
            </div>
          ))
        ) : (
          <p className="empty-state">No modules added yet.</p>
        )}
      </div>
    </div>
  );
}
