const { mysqlPool } = require('../config/database');

const getCourses = async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT * FROM courses');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const instructor_id = req.user.id;
    const [result] = await mysqlPool.execute('INSERT INTO courses (title, description, instructor_id) VALUES (?, ?, ?)', [title, description, instructor_id]);
    res.status(201).json({ id: result.insertId, message: 'Course created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    await mysqlPool.execute('UPDATE courses SET title = ?, description = ? WHERE id = ? AND instructor_id = ?', [title, description, req.params.id, req.user.id]);
    res.json({ message: 'Course updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const patchCourse = async (req, res) => {
  try {
    const fields = [];
    const values = [];
    Object.keys(req.body).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    });
    values.push(req.params.id);
    values.push(req.user.id);
    await mysqlPool.execute(`UPDATE courses SET ${fields.join(', ')} WHERE id = ? AND instructor_id = ?`, values);
    res.json({ message: 'Course updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    await mysqlPool.execute('DELETE FROM courses WHERE id = ? AND instructor_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCourses, getCourseById, createCourse, updateCourse, patchCourse, deleteCourse };