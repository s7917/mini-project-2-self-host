import { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminPanel() {
  const [tab, setTab] = useState('users');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [editModal, setEditModal] = useState(null);

  const tabs = [
    { key: 'users', label: 'Users', icon: '👤' },
    { key: 'courses', label: 'Courses', icon: '📚' },
    { key: 'enrollments', label: 'Enrollments', icon: '🎯' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${tab}`);
      setData(res.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/${tab}/${id}`);
      setMsg('Deleted successfully');
      fetchData();
    } catch (err) { setMsg(err.response?.data?.message || 'Delete failed'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    // Convert numeric fields
    if (formData.instructor_id) formData.instructor_id = parseInt(formData.instructor_id);
    if (formData.user_id) formData.user_id = parseInt(formData.user_id);
    if (formData.course_id) formData.course_id = parseInt(formData.course_id);
    try {
      if (editModal?.id) {
        await api.patch(`/${tab}/${editModal.id}`, formData);
        setMsg('Updated successfully');
      } else {
        await api.post(`/${tab}`, formData);
        setMsg('Created successfully');
      }
      setEditModal(null);
      fetchData();
    } catch (err) { setMsg(err.response?.data?.message || 'Save failed'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const getColumns = () => {
    switch (tab) {
      case 'users': return ['id', 'name', 'email', 'role'];
      case 'courses': return ['id', 'title', 'description', 'instructor_id'];
      case 'enrollments': return ['id', 'user_id', 'course_id', 'status'];
      default: return [];
    }
  };

  const getFormFields = () => {
    switch (tab) {
      case 'users': return [
        { name: 'name', label: 'Name', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'role', label: 'Role', type: 'select', options: ['learner', 'instructor', 'admin'] }
      ];
      case 'courses': return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'description', label: 'Description', type: 'text' },
        { name: 'instructor_id', label: 'Instructor ID', type: 'number' }
      ];
      case 'enrollments': return [
        { name: 'user_id', label: 'User ID', type: 'number' },
        { name: 'course_id', label: 'Course ID', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'completed'] }
      ];
      default: return [];
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin <span className="text-gradient">Panel</span></h1>
        <p className="page-subtitle">Manage system resources</p>
      </div>
      {msg && <div className="toast toast-success">{msg}</div>}
      <div className="admin-tabs">
        {tabs.map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div className="admin-toolbar">
        <button className="btn btn-primary btn-sm" onClick={() => setEditModal({})}>+ Create New</button>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                {getColumns().map(col => <th key={col}>{col}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  {getColumns().map(col => <td key={col}>{String(item[col] ?? '')}</td>)}
                  <td className="actions-cell">
                    <button className="btn btn-ghost btn-xs" onClick={() => setEditModal(item)}>Edit</button>
                    <button className="btn btn-danger btn-xs" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editModal !== null && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>{editModal?.id ? 'Edit' : 'Create'} {tab.slice(0, -1)}</h3>
            <form onSubmit={handleSaveEdit}>
              {getFormFields().map(f => (
                <div key={f.name} className="form-group">
                  <label className="form-label">{f.label}</label>
                  {f.type === 'select' ? (
                    <select name={f.name} className="form-input" defaultValue={editModal?.[f.name] || f.options[0]}>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input name={f.name} type={f.type} className="form-input" defaultValue={editModal?.[f.name] || ''} required />
                  )}
                </div>
              ))}
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
