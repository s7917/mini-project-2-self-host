const { mysqlPool } = require('../config/database');

const getEnrollments = async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT * FROM enrollments');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEnrollmentById = async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT * FROM enrollments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Enrollment not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEnrollment = async (req, res) => {
  try {
    const { course_id } = req.body;
    const user_id = req.user.id;
    // Check if already enrolled
    const [existing] = await mysqlPool.execute('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [user_id, course_id]);
    if (existing.length > 0) return res.status(400).json({ error: 'Already enrolled' });
    const [result] = await mysqlPool.execute('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)', [user_id, course_id]);
    res.status(201).json({ id: result.insertId, message: 'Enrolled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEnrollment = async (req, res) => {
  try {
    const { status } = req.body;
    await mysqlPool.execute('UPDATE enrollments SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Enrollment updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const patchEnrollment = async (req, res) => {
  try {
    const fields = [];
    const values = [];
    Object.keys(req.body).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    });
    values.push(req.params.id);
    await mysqlPool.execute(`UPDATE enrollments SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Enrollment updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    await mysqlPool.execute('DELETE FROM enrollments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Enrollment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getEnrollments, getEnrollmentById, createEnrollment, updateEnrollment, patchEnrollment, deleteEnrollment };