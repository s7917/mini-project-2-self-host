const { mysqlPool } = require('../config/database');

const getModules = async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT * FROM modules ORDER BY sequence_order');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getModuleById = async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT * FROM modules WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Module not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createModule = async (req, res) => {
  try {
    const { course_id, module_name, sequence_order } = req.body;
    // Check if instructor owns the course
    const [course] = await mysqlPool.execute('SELECT instructor_id FROM courses WHERE id = ?', [course_id]);
    if (course[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const [result] = await mysqlPool.execute('INSERT INTO modules (course_id, module_name, sequence_order) VALUES (?, ?, ?)', [course_id, module_name, sequence_order]);
    res.status(201).json({ id: result.insertId, message: 'Module created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateModule = async (req, res) => {
  try {
    const { module_name, sequence_order } = req.body;
    // Check ownership
    const [module] = await mysqlPool.execute('SELECT course_id FROM modules WHERE id = ?', [req.params.id]);
    const [course] = await mysqlPool.execute('SELECT instructor_id FROM courses WHERE id = ?', [module[0].course_id]);
    if (course[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await mysqlPool.execute('UPDATE modules SET module_name = ?, sequence_order = ? WHERE id = ?', [module_name, sequence_order, req.params.id]);
    res.json({ message: 'Module updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const patchModule = async (req, res) => {
  try {
    // Similar to update, check ownership
    const fields = [];
    const values = [];
    Object.keys(req.body).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    });
    values.push(req.params.id);
    await mysqlPool.execute(`UPDATE modules SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Module updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteModule = async (req, res) => {
  try {
    // Check ownership
    const [module] = await mysqlPool.execute('SELECT course_id FROM modules WHERE id = ?', [req.params.id]);
    const [course] = await mysqlPool.execute('SELECT instructor_id FROM courses WHERE id = ?', [module[0].course_id]);
    if (course[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await mysqlPool.execute('DELETE FROM modules WHERE id = ?', [req.params.id]);
    res.json({ message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getModules, getModuleById, createModule, updateModule, patchModule, deleteModule };