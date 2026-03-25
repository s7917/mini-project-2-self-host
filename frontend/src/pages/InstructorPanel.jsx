import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function InstructorPanel() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [moduleModal, setModuleModal] = useState(null);
  const [lessonModal, setLessonModal] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      const all = res.data.data || [];
      setCourses(all.filter(c => c.instructor_id === user?.id));
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (!user) return;
    fetchCourses();
  }, [user]);

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    formData.instructor_id = user.id;
    try {
      if (editModal?.id) {
        await api.patch(`/courses/${editModal.id}`, formData);
      } else {
        await api.post('/courses', formData);
      }
      setMsg('Course saved!');
      setEditModal(null);
      fetchCourses();
    } catch (err) { setMsg(err.response?.data?.message || 'Save failed'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    formData.course_id = moduleModal.courseId;
    formData.sequence_order = parseInt(formData.sequence_order);
    try {
      if (moduleModal.id) {
        await api.patch(`/modules/${moduleModal.id}`, formData);
      } else {
        await api.post('/modules', formData);
      }
      setMsg('Module saved!');
      setModuleModal(null);
      fetchCourses();
    } catch (err) { setMsg(err.response?.data?.message || 'Save failed'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    formData.module_id = lessonModal.moduleId;
    try {
      if (lessonModal.id) {
        await api.patch(`/lessons/${lessonModal.id}`, formData);
      } else {
        await api.post('/lessons', formData);
      }
      setMsg('Lesson saved!');
      setLessonModal(null);
      fetchCourses();
    } catch (err) { setMsg(err.response?.data?.message || 'Save failed'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/${type}/${id}`);
      setMsg('Deleted!');
      fetchCourses();
    } catch (err) { setMsg(err.response?.data?.message || 'Delete failed'); }
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Instructor <span className="text-gradient">Panel</span></h1>
        <p className="page-subtitle">Manage your courses, modules, and lessons</p>
      </div>
      {msg && <div className="toast toast-success">{msg}</div>}
      <button className="btn btn-primary" onClick={() => setEditModal({})}>+ New Course</button>
      <div className="instructor-courses">
        {courses.length === 0 && <p className="empty-state">No courses yet. Create your first course!</p>}
        {courses.map(course => (
          <div key={course.id} className="instructor-course-card">
            <div className="instructor-course-header">
              <h3>{course.title}</h3>
              <div className="instructor-actions">
                <button className="btn btn-ghost btn-xs" onClick={() => setEditModal(course)}>Edit</button>
                <button className="btn btn-danger btn-xs" onClick={() => handleDelete('courses', course.id)}>Delete</button>
              </div>
            </div>
            <p className="course-desc-sm">{course.description}</p>
            <button className="btn btn-ghost btn-xs" onClick={() => setModuleModal({ courseId: course.id })}>+ Add Module</button>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {editModal !== null && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>{editModal?.id ? 'Edit' : 'New'} Course</h3>
            <form onSubmit={handleSaveCourse}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input name="title" className="form-input" defaultValue={editModal?.title || ''} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input" defaultValue={editModal?.description || ''}></textarea>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Modal */}
      {moduleModal !== null && (
        <div className="modal-overlay" onClick={() => setModuleModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
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
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-ghost" onClick={() => setModuleModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {lessonModal !== null && (
        <div className="modal-overlay" onClick={() => setLessonModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
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
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-ghost" onClick={() => setLessonModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
