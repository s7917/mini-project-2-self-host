import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1>Courses</h1>
      <input
        type="text"
        placeholder="Search courses"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {filteredCourses.map(course => (
          <li key={course.id}>
            <Link to={`/courses/${course.id}`}>{course.title}</Link>
            <p>{course.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseList;