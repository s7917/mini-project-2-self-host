import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllPerformance } from '../services/performanceService';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icon';

const PERFORMANCE_PER_PAGE = 8;

export default function PerformanceView() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) return;

    getAllPerformance()
      .then(res => {
        const all = res.data.data || [];
        setRecords(all.filter(p => p.user_id === user?.id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const avgScore = records.length ? (records.reduce((s, r) => s + parseFloat(r.score), 0) / records.length).toFixed(1) : 0;
  const sortedRecords = [...records].sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / PERFORMANCE_PER_PAGE));
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * PERFORMANCE_PER_PAGE,
    currentPage * PERFORMANCE_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My <span className="text-gradient">Performance</span></h1>
        <p className="page-subtitle">Track your scores across courses</p>
      </div>
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stat-card-score">
          <div className="stat-icon"><Icon name="certificate" size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{avgScore}</span>
            <span className="stat-label">Average Score</span>
          </div>
        </div>
        <div className="stat-card stat-card-courses">
          <div className="stat-icon"><Icon name="performance" size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{records.length}</span>
            <span className="stat-label">Assessments</span>
          </div>
        </div>
      </div>
      {records.length === 0 ? (
        <p className="empty-state">No performance records yet.</p>
      ) : (
        <>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr><th>Course</th><th>Score</th><th>Date</th></tr>
              </thead>
              <tbody>
                {paginatedRecords.map(r => (
                  <tr key={r.id}>
                    <td>{r.course_title || `Course #${r.course_id}`}</td>
                    <td><span className={`score-badge ${parseFloat(r.score) >= 70 ? 'score-high' : 'score-low'}`}>{r.score}</span></td>
                    <td>{new Date(r.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={records.length}
            itemLabel="assessments"
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
