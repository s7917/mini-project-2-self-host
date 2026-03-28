import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { getCourseById } from '../services/courseService';
import { completeLessonSession, getAllProgress, getLessonState, startLessonSession, uncompleteLessons } from '../services/progressService';
import { downloadCertificatePdf, downloadModulePdf } from '../utils/pdf';
import { getCourseQuizzes, getQuizSubmissions, submitModuleQuiz } from '../services/quizService';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icon';

function getYoutubeId(url) {
  try {
    const u = new URL(url.includes('youtu.be') ? url.replace('youtu.be/', 'youtube.com/watch?v=') : url);
    return u.searchParams.get('v') || u.pathname.split('/').pop();
  } catch { return null; }
}

function LessonProgressBar({ watched, total }) {
  if (!total || total === 0) return null;
  const pct = Math.min(100, Math.round((watched / total) * 100));
  return (
    <div style={{ display: 'flex', height: '3px', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
      <div style={{ width: `${pct}%`, background: '#22c55e', transition: 'width 0.4s' }} />
      <div style={{ flex: 1, background: '#ef4444' }} />
    </div>
  );
}

export default function LearningView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonAlert, setLessonAlert] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [moduleQuizzes, setModuleQuizzes] = useState({});
  const [quizSubmissions, setQuizSubmissions] = useState({});
  const [collapsedModules, setCollapsedModules] = useState({});

  // video tracking: { [lessonId]: { watched: seconds, duration: seconds } }
  const [videoProgress, setVideoProgress] = useState({});
  const videoRef = useRef(null);
  const topRef = useRef(null);
  const quizRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [courseRes, progressRes, lessonStateRes, quizRes, quizSubRes] = await Promise.all([
          getCourseById(courseId),
          getAllProgress(),
          getLessonState(courseId),
          getCourseQuizzes(courseId).catch(() => ({ data: { data: [] } })),
          getQuizSubmissions(courseId).catch(() => ({ data: { data: [] } }))
        ]);
        const courseData = courseRes.data.data;
        setCourse(courseData);
        setActiveLesson(courseData?.modules?.[0]?.lessons?.[0] || null);
        const myProgress = (progressRes.data.data || []).find(
          (item) => item.user_id === user?.id && item.course_id === parseInt(courseId, 10)
        );
        setProgress(myProgress || null);
        setCompletedLessons(new Set(lessonStateRes.data.data?.completedLessonIds || []));
        const quizMap = {};
        (quizRes.data.data || []).forEach((quiz) => { quizMap[quiz.module_id] = quiz; });
        setModuleQuizzes(quizMap);
        const submissionMap = {};
        (quizSubRes.data.data || []).forEach((sub) => { submissionMap[sub.module_id] = sub; });
        setQuizSubmissions(submissionMap);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [courseId, user]);

  useEffect(() => {
    if (!activeLesson || user?.role !== 'learner') return;
    startLessonSession(activeLesson.id, Number(courseId)).catch(() => {});
  }, [activeLesson, courseId, user]);

  useEffect(() => {
    if (!activeLesson) return;
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeLesson?.id]);

  useEffect(() => {
    const submission = quizSubmissions[activeModule?.id];
    if (submission) {
      setQuizAnswers(submission.answers || {});
      setQuizResult({ score: submission.score, total: submission.total });
    } else {
      setQuizAnswers({});
      setQuizResult(null);
    }
  }, [activeLesson?.id]);

  const activeModule = course?.modules?.find((m) =>
    m.lessons?.some((l) => l.id === activeLesson?.id)
  );

  const flattenedLessons = course?.modules?.flatMap((m) =>
    (m.lessons || []).map((l) => ({ ...l, module_id: m.id, module_name: m.module_name }))
  ) || [];

  const activeIndex = flattenedLessons.findIndex((l) => l.id === activeLesson?.id);
  const nextLesson = activeIndex >= 0 ? flattenedLessons[activeIndex + 1] : null;

  const moduleQuizData = moduleQuizzes[activeModule?.id];
  const moduleQuiz = moduleQuizData?.questions || [];
  const moduleQuizTitle = moduleQuizData?.title || 'Module Quiz';

  const isModuleComplete = activeModule?.lessons?.every((l) => completedLessons.has(l.id));
  const lastLessonId = activeModule?.lessons?.at(-1)?.id;
  const isLastLessonInModule = lastLessonId === activeLesson?.id;
  const quizAvailable = Boolean(isModuleComplete && isLastLessonInModule && moduleQuiz.length);
  const quizPassed = Boolean(quizSubmissions[activeModule?.id]);
  const quizScore = quizSubmissions[activeModule?.id];
  const quizFailed = quizScore && quizScore.total > 0 && (quizScore.score / quizScore.total) < 0.4;
  const quizPending = quizAvailable && (!quizResult || quizFailed);

  const isLessonComplete = Boolean(activeLesson && completedLessons.has(activeLesson.id));

  // video watch enforcement
  const vp = videoProgress[activeLesson?.id] || { watched: 0, duration: 0 };
  const videoWatchPct = vp.duration > 0 ? vp.watched / vp.duration : 0;
  const hasVideo = Boolean(activeLesson?.video_url);
  const isYoutube = hasVideo && (activeLesson?.video_url?.includes('youtube.com') || activeLesson?.video_url?.includes('youtu.be'));
  const videoSufficientlyWatched = !hasVideo || isLessonComplete || isYoutube || videoWatchPct >= 0.8;

  const requiresCompletionToAdvance = Boolean(nextLesson || quizAvailable);
  const disableAdvance = requiresCompletionToAdvance && !isLessonComplete;

  const completionPercentage = progress?.completion_percentage || 0;
  const courseCompleteByLessons = course?.modules?.every((m) =>
    m.lessons?.every((l) => completedLessons.has(l.id))
  );
  const canDownloadCertificate = completionPercentage >= 100 || Boolean(courseCompleteByLessons);

  // check if a lesson is accessible (previous module quiz must be passed)
  const isLessonAccessible = (lesson) => {
    if (!course) return true;
    const moduleIndex = course.modules.findIndex((m) => m.lessons?.some((l) => l.id === lesson.id));
    if (moduleIndex === 0) return true;
    const prevModule = course.modules[moduleIndex - 1];
    const prevQuiz = moduleQuizzes[prevModule?.id];
    if (!prevQuiz?.questions?.length) return true; // no quiz on prev module = open
    return Boolean(quizSubmissions[prevModule?.id]);
  };

  const handleLessonSelect = (lesson) => {
    if (!isLessonAccessible(lesson)) {
      setLessonAlert({
        title: 'Complete previous module quiz first',
        message: 'You must pass the quiz for the previous module before accessing this one.'
      });
      return;
    }
    if (quizPending) {
      const targetIndex = flattenedLessons.findIndex((l) => l.id === lesson.id);
      if (targetIndex > activeIndex) {
        setLessonAlert({
          title: 'Finish the module quiz first',
          message: 'Complete the module quiz to unlock the next lesson.'
        });
        return;
      }
    }
    setActiveLesson(lesson);
  };

  const handleMarkComplete = async () => {
    if (hasVideo && !isYoutube && !videoSufficientlyWatched) {
      setLessonAlert({
        title: 'Watch the video first',
        message: 'You need to watch at least 80% of the video before marking this lesson complete.'
      });
      return;
    }
    try {
      const res = await completeLessonSession(activeLesson.id, Number(courseId));
      setProgress(res.data.data.progress);
      setCompletedLessons(new Set(res.data.data.completedLessonIds || []));
      showToast('Lesson marked complete.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Please spend more time in the lesson before marking it complete.';
      setLessonAlert({ title: 'Keep learning to unlock completion', message: msg });
    }
  };

  const handleQuizSubmit = async (event) => {
    event.preventDefault();
    if (!activeModule) return;
    const score = moduleQuiz.reduce((sum, q) => sum + (quizAnswers[q.id] === q.answer ? 1 : 0), 0);
    const payload = { course_id: Number(courseId), answers: quizAnswers, score, total: moduleQuiz.length };
    try {
      await submitModuleQuiz(activeModule.id, payload);
      setQuizResult({ score, total: moduleQuiz.length });
      setQuizSubmissions((cur) => ({
        ...cur,
        [activeModule.id]: { module_id: activeModule.id, course_id: Number(courseId), ...payload }
      }));
      const pct = moduleQuiz.length > 0 ? score / moduleQuiz.length : 0;
      if (pct < 0.4) {
        // uncomplete all lessons in this module on backend + reset video progress
        const lessonIds = activeModule.lessons?.map((l) => l.id) || [];
        const uncompleteRes = await uncompleteLessons(lessonIds, Number(courseId)).catch(() => null);
        if (uncompleteRes?.data?.data) {
          setProgress(uncompleteRes.data.data.progress);
          setCompletedLessons(new Set(uncompleteRes.data.data.completedLessonIds || []));
        }
        setVideoProgress((cur) => {
          const next = { ...cur };
          lessonIds.forEach((id) => { delete next[id]; });
          return next;
        });
        showToast(`You scored ${score}/${moduleQuiz.length}. Lessons unmarked — re-watch videos to retry.`, 'error');
      } else {
        showToast('Quiz submitted!', 'success');
      }
      setTimeout(() => navRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    } catch { showToast('Unable to submit quiz. Please try again.', 'error'); }
  };

  const handleVideoTimeUpdate = (e) => {
    const vid = e.target;
    if (!activeLesson || !vid.duration) return;
    setVideoProgress((cur) => {
      const prev = cur[activeLesson.id] || { watched: 0, duration: vid.duration };
      const watched = Math.max(prev.watched, vid.currentTime);
      return { ...cur, [activeLesson.id]: { watched, duration: vid.duration } };
    });
  };

  const handleVideoLoadedMetadata = (e) => {
    if (!activeLesson) return;
    setVideoProgress((cur) => ({
      ...cur,
      [activeLesson.id]: { watched: cur[activeLesson.id]?.watched || 0, duration: e.target.duration }
    }));
  };

  // prevent seeking ahead beyond watched position
  const handleVideoSeeking = (e) => {
    const vid = e.target;
    const vdata = videoProgress[activeLesson?.id];
    if (!vdata) return;
    if (vid.currentTime > vdata.watched + 2) {
      vid.currentTime = vdata.watched;
    }
  };

  // when quiz failed and user re-watches enough video, reset quiz so they can retry
  useEffect(() => {
    if (!quizFailed) return;
    const allLessonsHaveVideo = activeModule?.lessons?.every((l) => l.video_url);
    if (!allLessonsHaveVideo) return;
    const allRewatched = activeModule?.lessons?.every((l) => {
      const vd = videoProgress[l.id];
      return vd && vd.duration > 0 && vd.watched / vd.duration >= 0.8;
    });
    if (allRewatched) {
      setQuizResult(null);
      setQuizAnswers({});
      setQuizSubmissions((cur) => { const next = { ...cur }; delete next[activeModule.id]; return next; });
      showToast('Videos re-watched! Quiz is now unlocked — try again.', 'success');
    }
  }, [videoProgress]);

  const toggleModule = (moduleId) => {
    setCollapsedModules((cur) => ({ ...cur, [moduleId]: !cur[moduleId] }));
  };

  const lessonSections = activeLesson?.content ? activeLesson.content.split('\n\n').filter(Boolean) : [];

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;
  if (!course) return <div className="page-container"><p>Course not found</p></div>;

  return (
    <div className="learning-layout">
      {/* ── SIDEBAR ── */}
      <div className="learning-sidebar" style={{ padding: '1.25rem 0' }}>
        <div style={{ padding: '0 1.25rem 1rem' }}>
          <h2 className="sidebar-title" style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{course.title}</h2>
          <ProgressBar percentage={progress?.completion_percentage || 0} />
        </div>

        <div className="module-tree" style={{ marginTop: 0 }}>
          {course.modules?.map((moduleItem, mi) => {
            const isCollapsed = collapsedModules[moduleItem.id];
            const allDone = moduleItem.lessons?.every((l) => completedLessons.has(l.id));
            const quizDone = Boolean(quizSubmissions[moduleItem.id]);
            const hasQuiz = Boolean(moduleQuizzes[moduleItem.id]?.questions?.length);
            const locked = !isLessonAccessible(moduleItem.lessons?.[0] || {});

            return (
              <div key={moduleItem.id} style={{ marginBottom: '4px' }}>
                {/* Module header */}
                <div
                  onClick={() => toggleModule(moduleItem.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 1.25rem', cursor: 'pointer',
                    background: allDone ? 'rgba(34,197,94,0.08)' : 'rgba(37,99,235,0.06)',
                    borderLeft: `3px solid ${allDone ? '#22c55e' : locked ? '#ef4444' : 'var(--accent-primary)'}`,
                    userSelect: 'none'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', minWidth: '18px' }}>
                    {String(mi + 1).padStart(2, '0')}
                  </span>
                  <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 700, color: locked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {moduleItem.module_name}
                  </span>
                  {locked && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>🔒</span>}
                  {allDone && !locked && <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>✓</span>}
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{isCollapsed ? '▶' : '▼'}</span>
                </div>

                {/* Lessons list */}
                {!isCollapsed && (
                  <div>
                    {moduleItem.lessons?.map((lesson, li) => {
                      const done = completedLessons.has(lesson.id);
                      const isActive = activeLesson?.id === lesson.id;
                      const vdata = videoProgress[lesson.id] || { watched: 0, duration: 0 };
                      const lessonLocked = !isLessonAccessible(lesson);

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleLessonSelect(lesson)}
                          style={{
                            padding: '8px 1.25rem 8px 2.5rem',
                            cursor: lessonLocked ? 'not-allowed' : 'pointer',
                            background: isActive ? 'rgba(37,99,235,0.12)' : 'transparent',
                            borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                            opacity: lessonLocked ? 0.5 : 1,
                            transition: 'background 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '16px' }}>
                              {done ? '✅' : lesson.video_url ? '▶' : '📄'}
                            </span>
                            <span style={{
                              flex: 1, fontSize: '0.82rem', fontWeight: isActive ? 700 : 500,
                              color: done ? '#22c55e' : isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                              lineHeight: 1.3
                            }}>
                              {li + 1}. {lesson.lesson_name}
                            </span>
                            {vdata.duration > 0 && (
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {formatDuration(vdata.duration)}
                              </span>
                            )}
                          </div>
                          {/* green/red progress bar */}
                          <LessonProgressBar watched={vdata.watched} total={vdata.duration} />
                        </div>
                      );
                    })}

                    {/* Quiz row */}
                    {hasQuiz && (
                      <div
                        onClick={() => {
                          if (!allDone) return;
                          const lastLesson = moduleItem.lessons?.at(-1);
                          if (lastLesson) { setActiveLesson(lastLesson); setTimeout(() => quizRef.current?.scrollIntoView({ behavior: 'smooth' }), 300); }
                        }}
                        style={{
                          padding: '7px 1.25rem 7px 2.5rem',
                          cursor: allDone ? 'pointer' : 'not-allowed',
                          opacity: allDone ? 1 : 0.45,
                          display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                      >
                        <span style={{ fontSize: '0.7rem' }}>{quizDone ? '✅' : '📝'}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: quizDone ? '#22c55e' : 'var(--text-muted)' }}>
                          Module Quiz {quizDone ? '(Passed)' : allDone ? '(Ready)' : '(Complete lessons first)'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="learning-content">
        <div ref={topRef} />
        {activeLesson ? (
          <>
            <div className="learning-content-head">
              <div>
                <span className="section-eyebrow">{activeModule?.module_name}</span>
                <h2 className="content-title" style={{ marginTop: '0.5rem' }}>{activeLesson.lesson_name}</h2>
              </div>
              <span className="lesson-progress-chip">Course progress {progress?.completion_percentage || 0}%</span>
            </div>

            <div className="learning-toolbar">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => downloadModulePdf(course, activeModule)}>
                <Icon name="download" size={14} /><span>Download PDF</span>
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                if (!course || !user) return;
                downloadCertificatePdf({ learnerName: user.name || 'Learner', courseTitle: course.title, completedDate: new Date().toLocaleDateString() });
              }} disabled={!canDownloadCertificate}>
                <Icon name="certificate" size={14} /><span>Certificate</span>
              </button>
            </div>

            <div className="content-body content-body-rich">
              {/* ── VIDEO PLAYER ── */}
              {activeLesson.video_url && (
                <div style={{ marginBottom: '1.5rem' }}>
                  {activeLesson.video_url.includes('youtube.com') || activeLesson.video_url.includes('youtu.be') ? (
                    <div className="video-embed-shell" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeId(activeLesson.video_url)}?rel=0`}
                        title={activeLesson.lesson_name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ width: '100%', aspectRatio: '16/9', border: 'none' }}
                      />
                    </div>
                  ) : (
                    <div>
                      <video
                        ref={videoRef}
                        controls
                        onTimeUpdate={handleVideoTimeUpdate}
                        onLoadedMetadata={handleVideoLoadedMetadata}
                        onSeeking={handleVideoSeeking}
                        style={{ width: '100%', borderRadius: '10px', background: '#000', display: 'block' }}
                      >
                        <source src={activeLesson.video_url} />
                      </video>
                      {/* video progress bar */}
                      <div style={{ marginTop: '6px' }}>
                        <LessonProgressBar watched={vp.watched} total={vp.duration} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          <span style={{ color: '#22c55e' }}>▬ Watched ({formatDuration(vp.watched) || '0:00'})</span>
                          <span style={{ color: '#ef4444' }}>▬ Remaining</span>
                          {vp.duration > 0 && <span>{Math.round(videoWatchPct * 100)}% watched</span>}
                        </div>
                        {hasVideo && !isYoutube && !videoSufficientlyWatched && (
                          <p style={{ fontSize: '0.78rem', color: '#f97316', marginTop: '6px', fontWeight: 600 }}>
                            ⚠ Watch at least 80% of the video to mark this lesson complete.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* lesson text */}
              {lessonSections.length > 0
                ? lessonSections.map((section, i) => (
                    <p key={`${activeLesson.id}-${i}`} className={i === 0 ? 'lesson-section-lead' : ''}>{section}</p>
                  ))
                : <p style={{ color: 'var(--text-muted)' }}>No text content for this lesson.</p>
              }
            </div>

            {/* mark complete / completed badge */}
            {!isLessonComplete && (
              <button
                className="btn btn-primary"
                onClick={handleMarkComplete}
                disabled={hasVideo && !isYoutube && !videoSufficientlyWatched}
                title={hasVideo && !isYoutube && !videoSufficientlyWatched ? 'Watch at least 80% of the video first' : ''}
              >
                <Icon name="check" size={14} />
                <span>{hasVideo && !isYoutube && !videoSufficientlyWatched ? `Watch video first (${Math.round(videoWatchPct * 100)}%)` : 'Mark as Complete'}</span>
              </button>
            )}
            {isLessonComplete && (
              <div className="completed-badge-lg">
                <Icon name="check" size={14} /><span>Completed</span>
              </div>
            )}

            {/* nav buttons */}
            <div className="lesson-nav" ref={navRef}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => topRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                Back to top
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={disableAdvance}
                onClick={() => {
                  if (disableAdvance) return;
                  if (quizPending) { quizRef.current?.scrollIntoView({ behavior: 'smooth' }); return; }
                  if (nextLesson) { setActiveLesson(nextLesson); return; }
                  navigate('/my-courses');
                }}
              >
                <span>
                  {!isLessonComplete && requiresCompletionToAdvance ? 'Complete Lesson to Continue'
                    : quizPending ? 'Go to Quiz'
                    : nextLesson ? 'Next Lesson'
                    : 'Back to My Courses'}
                </span>
                <Icon name="arrowRight" size={14} />
              </button>
            </div>

            {/* ── MODULE QUIZ ── */}
            {quizAvailable && (
              <section className="module-quiz-card" ref={quizRef} style={{ marginTop: '2rem' }}>
                <div className="module-quiz-head">
                  <h3>{moduleQuizTitle}</h3>
                  <span>Complete this quiz before moving to the next module.</span>
                </div>
                <form onSubmit={handleQuizSubmit} className="module-quiz-form">
                  {moduleQuiz.map((question) => (
                    <div key={question.id} className="module-quiz-item">
                      <p style={{ fontWeight: 600 }}>{question.prompt}</p>
                      <div className="module-quiz-options" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                        {question.options.map((option) => (
                          <label
                            key={option}
                            className={`quiz-option${quizResult
                              ? option === question.answer ? ' is-correct'
                              : quizAnswers[question.id] === option ? ' is-wrong' : ''
                              : ''}`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              checked={quizAnswers[question.id] === option}
                              disabled={Boolean(quizResult) && !quizFailed}
                              onChange={() => !quizFailed && setQuizAnswers((cur) => ({ ...cur, [question.id]: option }))}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                      {quizResult && !quizFailed && (
                        <div className="quiz-feedback">
                          <span className={`quiz-answer ${quizAnswers[question.id] === question.answer ? 'correct' : 'wrong'}`}>
                            Your answer: {quizAnswers[question.id] || 'No answer'}
                          </span>
                          <span className="quiz-correct">Correct: {question.answer}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {quizFailed ? (
                    <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px' }}>
                      <p style={{ color: '#ef4444', fontWeight: 700, marginBottom: '4px' }}>Score below 40% — Quiz locked 🔒</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Re-watch all videos in this module, then the quiz will unlock automatically.</p>
                    </div>
                  ) : (
                    <button type="submit" className="btn btn-primary btn-sm" disabled={Boolean(quizResult) && !quizFailed}>
                      {quizResult && !quizFailed ? 'Quiz Submitted' : 'Submit Quiz'}
                    </button>
                  )}
                </form>
                {quizResult && !quizFailed && (
                  <p className="quiz-result">
                    You scored {quizResult.score} / {quizResult.total}.
                    {nextLesson && ' You can now proceed to the next module.'}
                  </p>
                )}
                {quizFailed && (
                  <p className="quiz-result" style={{ color: '#ef4444' }}>
                    You scored {quizResult.score} / {quizResult.total} ({Math.round((quizResult.score / quizResult.total) * 100)}%). Minimum 40% required.
                  </p>
                )}
              </section>
            )}
          </>
        ) : (
          <div className="content-placeholder">
            <p className="empty-state">Select a lesson from the sidebar to begin learning</p>
          </div>
        )}
      </div>

      {/* ── ALERT MODAL ── */}
      {lessonAlert && (
        <div className="modal-overlay lesson-alert-overlay" onClick={() => setLessonAlert(null)}>
          <div className="lesson-alert-card" onClick={(e) => e.stopPropagation()}>
            <div className="lesson-alert-icon"><Icon name="warning" size={22} /></div>
            <div className="lesson-alert-copy">
              <h3>{lessonAlert.title}</h3>
              <p>{lessonAlert.message}</p>
            </div>
            <div className="lesson-alert-actions">
              <button type="button" className="btn btn-primary" onClick={() => setLessonAlert(null)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
