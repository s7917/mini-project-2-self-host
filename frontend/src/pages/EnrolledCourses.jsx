import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllEnrollments } from '../services/enrollmentService';
import { getAllProgress } from '../services/progressService';
import Pagination from '../components/Pagination';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import CertificateModal from '../components/CertificateModal';
import { downloadCertificatePdf } from '../utils/pdf';

const ENROLLMENTS_PER_PAGE = 6;

export default function EnrolledCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [enrollRes, progRes] = await Promise.all([
          getAllEnrollments(),
          getAllProgress()
        ]);
        const mine = (enrollRes.data.data || []).filter(e => e.user_id === user?.id);
        const progData = (progRes.data.data || []).filter(p => p.user_id === user?.id);
        const pMap = {};
        progData.forEach(p => { pMap[p.course_id] = p.completion_percentage; });
        setEnrollments(mine);
        setProgressMap(pMap);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const totalPages = Math.max(1, Math.ceil(enrollments.length / ENROLLMENTS_PER_PAGE));
  const paginatedEnrollments = enrollments.slice(
    (currentPage - 1) * ENROLLMENTS_PER_PAGE,
    currentPage * ENROLLMENTS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) return <LoadingSpinner />;

  const handleCertificateOpen = (enrollment) => {
    setCertificateData({
      learnerName: user?.name || 'Learner',
      courseTitle: enrollment.course_title,
      completedDate: new Date().toLocaleDateString()
    });
  };

  const handleCertificateDownload = () => {
    if (!certificateData) return;
    downloadCertificatePdf(certificateData);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My <span className="text-gradient">Courses</span></h1>
        <p className="page-subtitle">Track your learning journey</p>
      </div>
      {enrollments.length === 0 ? (
        <div className="empty-state-container">
          <p className="empty-state">You haven't enrolled in any courses yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/courses')}>Browse Courses</button>
        </div>
      ) : (
        <>
          <div className="enrolled-list">
          {paginatedEnrollments.map(e => (
            <div key={e.id} className="enrolled-card" onClick={() => navigate(`/learn/${e.course_id}`)}>
              <div className="enrolled-card-info">
                <h3>{e.course_title}</h3>
                <span className={`status-badge status-${e.status}`}>{e.status}</span>
              </div>
              <ProgressBar percentage={progressMap[e.course_id] || 0} />
              <div className="enrolled-card-actions">
                <button className="btn btn-primary btn-sm">
                  <span>Continue Learning</span>
                  <Icon name="arrowRight" size={14} />
                </button>
                {(e.status === 'completed' || Number(progressMap[e.course_id] || 0) >= 100) && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCertificateOpen(e);
                    }}
                  >
                    <Icon name="certificate" size={14} />
                    <span>Certificate</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={enrollments.length}
            itemLabel="enrollments"
            onPageChange={setCurrentPage}
          />
        </>
      )}
      <CertificateModal
        certificate={certificateData}
        onClose={() => setCertificateData(null)}
        onDownload={handleCertificateDownload}
      />
    </div>
  );
}
