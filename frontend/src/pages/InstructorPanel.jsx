import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icon';
import { getApprovals } from '../services/approvalService';

export default function InstructorPanel() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgTone, setMsgTone] = useState('success');
  const [editModal, setEditModal] = useState(null);
  const [moduleModal, setModuleModal] = useState(null);
  const [lessonModal, setLessonModal] = useState(null);

  const flashMessage = (text, tone = 'success') => {
    setMsgTone(tone);
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const [coursesRes, approvalsRes] = await Promise.all([
        api.get('/courses'),
        getApprovals().catch(() => ({ data: { data: [] } }))
      ]);

      const allCourses = coursesRes.data.data || [];
      const mine = allCourses.filter((course) => course.instructor_id === user?.id);
      const detailedCourses = await Promise.all(
        mine.map((course) =>
          api.get(`/courses/${course.id}`)
            .then((res) => res.data.data)
            .catch(() => course)
        )
      );

      setCourses(detailedCourses);
      const approvalData = (approvalsRes.data.data || [])
        .filter((request) => request.request_type !== 'instructor_signup')
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setApprovals(approvalData);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (!user) return;
    fetchCourses();
  }, [user]);

  const handleSaveCourse = async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target));
    formData.instructor_id = user.id;

    try {
      const res = editModal?.id
        ? await api.patch(`/courses/${editModal.id}`, formData)
        : await api.post('/courses', formData);
      flashMessage(res.data.message || 'Course request submitted');
      setEditModal(null);
      fetchCourses();
    } catch (err) { flashMessage(err.response?.data?.message || 'Save failed', 'error'); }
  };

  const handleSaveModule = async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target));
    formData.course_id = moduleModal.courseId;
    formData.sequence_order = parseInt(formData.sequence_order, 10);

    try {
      const res = moduleModal.id
        ? await api.patch(`/modules/${moduleModal.id}`, formData)
        : await api.post('/modules', formData);
      flashMessage(res.data.message || 'Module request submitted');
      setModuleModal(null);
      fetchCourses();
    } catch (err) { flashMessage(err.response?.data?.message || 'Save failed', 'error'); }
  };

  const handleSaveLesson = async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target));
    formData.module_id = lessonModal.moduleId;

    try {
      const res = lessonModal.id
        ? await api.patch(`/lessons/${lessonModal.id}`, formData)
        : await api.post('/lessons', formData);
      flashMessage(res.data.message || 'Lesson request submitted');
      setLessonModal(null);
      fetchCourses();
    } catch (err) { flashMessage(err.response?.data?.message || 'Save failed', 'error'); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const res = await api.delete(`/${type}/${id}`);
      flashMessage(res.data.message || 'Delete request submitted');
      fetchCourses();
    } catch (err) { flashMessage(err.response?.data?.message || 'Delete failed', 'error'); }
  };

  if (loading) return <LoadingSpinner />;

  const getApprovalTitle = (request) => {
    const actionLabel = {
      create: 'Create',
      update: 'Update',
      delete: 'Delete'
    }[request.action] || 'Review';

    const typeLabel = {
      course: 'Course',
      module: 'Module',
      lesson: 'Lesson'
    }[request.request_type] || 'Request';

    return `${actionLabel} ${typeLabel}`;
  };

  const getApprovalSummary = (request) => {
    if (request.request_type === 'course') {
      return request.payload?.title || 'Course request submitted';
    }
    if (request.request_type === 'module') {
      return request.payload?.module_name || 'Module request submitted';
    }
    if (request.request_type === 'lesson') {
      return request.payload?.lesson_name || 'Lesson request submitted';
    }
    return 'Content request submitted';
  };

  const getApprovalMeta = (request) => {
    const createdAt = request.created_at ? new Date(request.created_at).toLocaleString() : '';
    const entity = request.entity_id ? `Entity ${String(request.entity_id)}` : 'New';
    return `${entity}${createdAt ? ` • ${createdAt}` : ''}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Instructor <span className="text-gradient">Panel</span></h1>
        <p className="page-subtitle">Draft course content, submit changes for admin approval, and manage approved teaching material.</p>
      </div>
      {msg && <div className={`toast ${msgTone === 'error' ? 'toast-error' : 'toast-success'}`}>{msg}</div>}
      <button className="btn btn-primary" onClick={() => setEditModal({})}>New Course Request</button>

      <section className="approval-list instructor-approval-list">
        {approvals.length === 0 && (
          <p className="empty-state">No content requests yet. Submit a course, module, or lesson update to start the approval workflow.</p>
        )}
        {approvals.map((request) => (
          <article key={request._id} className="approval-card">
            <div className="approval-card-head">
              <div>
                <span className="approval-request-type">{getApprovalTitle(request)}</span>
                <h3>{getApprovalSummary(request)}</h3>
              </div>
              <span className={`status-badge status-${request.status}`}>{request.status}</span>
            </div>
            <p className="course-desc-sm">{getApprovalMeta(request)}</p>
            {request.note && request.status === 'rejected' && (
              <p className="approval-note">Admin note: {request.note}</p>
            )}
          </article>
        ))}
      </section>

      <div className="instructor-courses">
        {courses.length === 0 && <p className="empty-state">No approved courses yet. Submit your first course request to get started.</p>}
        {courses.map((course) => (
          <div key={course.id} className="instructor-course-card">
            <div className="instructor-course-header">
              <div>
                <h3>{course.title}</h3>
                <p className="course-desc-sm">{course.description}</p>
              </div>
              <div className="instructor-actions">
                <button className="btn btn-ghost btn-xs" onClick={() => setEditModal(course)}>Edit</button>
                <button className="btn btn-danger btn-xs" onClick={() => handleDelete('courses', course.id)}>Delete</button>
              </div>
            </div>
            <button className="btn btn-ghost btn-xs" onClick={() => setModuleModal({ courseId: course.id })}>Add Module</button>

            <div className="module-admin-list">
              {course.modules?.map((moduleItem) => (
                <div key={moduleItem.id} className="module-admin-card">
                  <div className="module-admin-head">
                    <div>
                      <h4>{moduleItem.module_name}</h4>
                      <span>Sequence {moduleItem.sequence_order}</span>
                    </div>
                    <div className="instructor-actions">
                      <button className="btn btn-ghost btn-xs" onClick={() => setModuleModal({ ...moduleItem, courseId: course.id })}>Edit</button>
                      <button className="btn btn-danger btn-xs" onClick={() => handleDelete('modules', moduleItem.id)}>Delete</button>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-xs" onClick={() => setLessonModal({ moduleId: moduleItem.id })}>Add Lesson</button>
                  <div className="lesson-admin-list">
                    {moduleItem.lessons?.map((lesson) => (
                      <div key={lesson.id} className="lesson-admin-card">
                        <div>
                          <strong>{lesson.lesson_name}</strong>
                          <p>{lesson.content?.slice(0, 160) || 'No lesson content yet.'}</p>
                        </div>
                        <div className="instructor-actions">
                          <button className="btn btn-ghost btn-xs" onClick={() => setLessonModal({ ...lesson, moduleId: moduleItem.id })}>Edit</button>
                          <button className="btn btn-danger btn-xs" onClick={() => handleDelete('lessons', lesson.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editModal !== null && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>{editModal?.id ? 'Edit' : 'New'} Course</h3>
            <form onSubmit={handleSaveCourse}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input name="title" className="form-input" defaultValue={editModal?.title || ''} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input form-textarea" defaultValue={editModal?.description || ''}></textarea>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Submit</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {moduleModal !== null && (
        <div className="modal-overlay" onClick={() => setModuleModal(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>{moduleModal?.id ? 'Edit' : 'New'} Module</h3>
            <form onSubmit={handleSaveModule}>
              <div className="form-group">
                <label className="form-label">Module Name</label>
                <input name="module_name" className="form-input" defaultValue={moduleModal?.module_name || ''} required />
              </div>
              <div className="form-group">
                <label className="form-label">Sequence Order</label>
                <input name="sequence_order" type="number" className="form-input" defaultValue={moduleModal?.sequence_order || 1} min="1" required />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Submit</button>
                <button type="button" className="btn btn-ghost" onClick={() => setModuleModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lessonModal !== null && (
        <div className="modal-overlay" onClick={() => setLessonModal(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>{lessonModal?.id ? 'Edit' : 'New'} Lesson</h3>
            <form onSubmit={handleSaveLesson}>
              <div className="form-group">
                <label className="form-label">Lesson Name</label>
                <input name="lesson_name" className="form-input" defaultValue={lessonModal?.lesson_name || ''} required />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea name="content" className="form-input form-textarea" defaultValue={lessonModal?.content || ''}></textarea>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Submit</button>
                <button type="button" className="btn btn-ghost" onClick={() => setLessonModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
