const { mysqlPool } = require('../config/database');

const getProgress = async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT * FROM progress');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProgressById = async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT * FROM progress WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Progress not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProgress = async (req, res) => {
  try {
    const { course_id, completion_percentage } = req.body;
    const user_id = req.user.id;
    const [result] = await mysqlPool.execute('INSERT INTO progress (user_id, course_id, completion_percentage) VALUES (?, ?, ?)', [user_id, course_id, completion_percentage]);
    res.status(201).json({ id: result.insertId, message: 'Progress created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { completion_percentage } = req.body;
    await mysqlPool.execute('UPDATE progress SET completion_percentage = ?, last_accessed = NOW() WHERE id = ? AND user_id = ?', [completion_percentage, req.params.id, req.user.id]);
    res.json({ message: 'Progress updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const patchProgress = async (req, res) => {
  try {
    const fields = [];
    const values = [];
    Object.keys(req.body).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    });
    values.push(req.params.id);
    values.push(req.user.id);
    await mysqlPool.execute(`UPDATE progress SET ${fields.join(', ')}, last_accessed = NOW() WHERE id = ? AND user_id = ?`, values);
    res.json({ message: 'Progress updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProgress = async (req, res) => {
  try {
    await mysqlPool.execute('DELETE FROM progress WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Progress deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProgress, getProgressById, createProgress, updateProgress, patchProgress, deleteProgress };