const { mysqlPool } = require('../config/database');

const getPerformances = async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT * FROM performance');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPerformanceById = async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT * FROM performance WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Performance not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPerformance = async (req, res) => {
  try {
    const { course_id, score } = req.body;
    const user_id = req.user.id;
    const [result] = await mysqlPool.execute('INSERT INTO performance (user_id, course_id, score) VALUES (?, ?, ?)', [user_id, course_id, score]);
    res.status(201).json({ id: result.insertId, message: 'Performance recorded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePerformance = async (req, res) => {
  try {
    const { score } = req.body;
    await mysqlPool.execute('UPDATE performance SET score = ? WHERE id = ? AND user_id = ?', [score, req.params.id, req.user.id]);
    res.json({ message: 'Performance updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const patchPerformance = async (req, res) => {
  try {
    const fields = [];
    const values = [];
    Object.keys(req.body).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    });
    values.push(req.params.id);
    values.push(req.user.id);
    await mysqlPool.execute(`UPDATE performance SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, values);
    res.json({ message: 'Performance updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePerformance = async (req, res) => {
  try {
    await mysqlPool.execute('DELETE FROM performance WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Performance deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPerformances, getPerformanceById, createPerformance, updatePerformance, patchPerformance, deletePerformance };