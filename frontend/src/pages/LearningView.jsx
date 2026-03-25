import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCourseById } from '../services/courseService';
import { getAllProgress, patchProgress, createProgress } from '../services/progressService';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LearningView() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const courseRes = await getCourseById(courseId);
        setCourse(courseRes.data.data);
        const progRes = await getAllProgress();
        const myProg = (progRes.data.data || []).find(p => p.user_id === user?.id && p.course_id === parseInt(courseId));
        setProgress(myProg);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [courseId, user]);

  const totalLessons = course?.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 1;

  const markComplete = async (lessonId) => {
    const newCompleted = new Set(completedLessons);
    newCompleted.add(lessonId);
    setCompletedLessons(newCompleted);
    const newPct = Math.round((newCompleted.size / totalLessons) * 100);
    try {
      if (progress) {
        await patchProgress(progress.id, { completion_percentage: newPct });
        setProgress({ ...progress, completion_percentage: newPct });
      } else {
        const res = await createProgress({ user_id: user.id, course_id: parseInt(courseId), completion_percentage: newPct });
        setProgress(res.data.data);
      }
    } catch {}
  };

  if (loading) return <LoadingSpinner />;
  if (!course) return <div className="page-container"><p>Course not found</p></div>;

  const activeModule = course.modules?.find(module => module.lessons?.some(lesson => lesson.id === activeLesson?.id));
  const lessonSections = activeLesson?.content
    ? activeLesson.content.split('\n\n').filter(Boolean)
    : [];

  return (
    <div className="learning-layout">
      <div className="learning-sidebar">
        <h2 className="sidebar-title">{course.title}</h2>
        <ProgressBar percentage={progress?.completion_percentage || 0} />
        <div className="module-tree">
          {course.modules?.map(mod => (
            <div key={mod.id} className="tree-module">
              <h4 className="tree-module-name">{mod.module_name}</h4>
              {mod.lessons?.map(lesson => (
                <div
                  key={lesson.id}
                  className={`tree-lesson ${activeLesson?.id === lesson.id ? 'active' : ''} ${completedLessons.has(lesson.id) ? 'completed' : ''}`}
                  onClick={() => setActiveLesson(lesson)}
                >
                  <span className="tree-lesson-icon">{completedLessons.has(lesson.id) ? '✓' : '○'}</span>
                  {lesson.lesson_name}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="learning-content">
        {activeLesson ? (
          <>
            <div className="learning-content-head">
              <div>
                <span className="section-eyebrow">{activeModule?.module_name || 'Lesson in focus'}</span>
                <h2 className="content-title">{activeLesson.lesson_name}</h2>
              </div>
              <span className="lesson-progress-chip">Course progress {progress?.completion_percentage || 0}%</span>
            </div>
            <div className="content-body content-body-rich">
              {lessonSections.length > 0 ? (
                lessonSections.map((section, index) => (
                  <p key={`${activeLesson.id}-${index}`} className={index === 0 ? 'lesson-section-lead' : ''}>
                    {section}
                  </p>
                ))
              ) : (
                <p>No content available for this lesson.</p>
              )}
            </div>
            <div className="lesson-support-grid">
              <div className="lesson-support-card">
                <span className="lesson-support-label">Study prompt</span>
                <p>Summarize this lesson in your own words, then write one concrete decision or workflow you would improve with it.</p>
              </div>
              <div className="lesson-support-card">
                <span className="lesson-support-label">Application checkpoint</span>
                <p>Before moving on, identify one team ritual, review step, or implementation task where this lesson should directly influence quality.</p>
              </div>
            </div>
            {!completedLessons.has(activeLesson.id) && (
              <button className="btn btn-primary" onClick={() => markComplete(activeLesson.id)}>
                ✓ Mark as Complete
              </button>
            )}
            {completedLessons.has(activeLesson.id) && <div className="completed-badge-lg">✓ Completed</div>}
          </>
        ) : (
          <div className="content-placeholder">
            <p className="empty-state">Select a lesson from the sidebar to begin learning</p>
          </div>
        )}
      </div>
    </div>
  );
}
