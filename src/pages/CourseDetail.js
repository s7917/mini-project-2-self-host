import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchModules = async () => {
      try {
        const response = await api.get('/modules');
        setModules(response.data.filter(m => m.course_id === parseInt(id)));
      } catch (error) {
        console.error(error);
      }
    };
    const checkEnrollment = async () => {
      try {
        const response = await api.get('/enrollments');
        const userEnrollments = response.data.filter(e => e.course_id === parseInt(id));
        if (userEnrollments.length > 0) {
          setEnrolled(true);
          // Fetch progress
          const progressRes = await api.get('/progress');
          const userProgress = progressRes.data.find(p => p.course_id === parseInt(id));
          if (userProgress) setProgress(userProgress.completion_percentage);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchCourse();
    fetchModules();
    checkEnrollment();
  }, [id]);

  const handleEnroll = async () => {
    try {
      await api.post('/enrollments', { course_id: id });
      setEnrolled(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {course && (
        <>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          {!enrolled ? (
            <button onClick={handleEnroll}>Enroll</button>
          ) : (
            <p>Enrolled. Progress: {progress}%</p>
          )}
          <h2>Modules</h2>
          <ul>
            {modules.map(module => (
              <li key={module.id}>
                <h3>{module.module_name}</h3>
                {/* Add lessons here */}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default CourseDetail;