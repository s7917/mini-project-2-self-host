const { mysqlPool } = require('../config/database');

const getLessons = async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT * FROM lessons');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLessonById = async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT * FROM lessons WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createLesson = async (req, res) => {
  try {
    const { module_id, lesson_name, content } = req.body;
    // Check ownership via module -> course
    const [module] = await mysqlPool.execute('SELECT course_id FROM modules WHERE id = ?', [module_id]);
    const [course] = await mysqlPool.execute('SELECT instructor_id FROM courses WHERE id = ?', [module[0].course_id]);
    if (course[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const [result] = await mysqlPool.execute('INSERT INTO lessons (module_id, lesson_name, content) VALUES (?, ?, ?)', [module_id, lesson_name, content]);
    res.status(201).json({ id: result.insertId, message: 'Lesson created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { lesson_name, content } = req.body;
    // Check ownership
    const [lesson] = await mysqlPool.execute('SELECT module_id FROM lessons WHERE id = ?', [req.params.id]);
    const [module] = await mysqlPool.execute('SELECT course_id FROM modules WHERE id = ?', [lesson[0].module_id]);
    const [course] = await mysqlPool.execute('SELECT instructor_id FROM courses WHERE id = ?', [module[0].course_id]);
    if (course[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await mysqlPool.execute('UPDATE lessons SET lesson_name = ?, content = ? WHERE id = ?', [lesson_name, content, req.params.id]);
    res.json({ message: 'Lesson updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const patchLesson = async (req, res) => {
  try {
    const fields = [];
    const values = [];
    Object.keys(req.body).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    });
    values.push(req.params.id);
    await mysqlPool.execute(`UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Lesson updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteLesson = async (req, res) => {
  try {
    // Check ownership
    const [lesson] = await mysqlPool.execute('SELECT module_id FROM lessons WHERE id = ?', [req.params.id]);
    const [module] = await mysqlPool.execute('SELECT course_id FROM modules WHERE id = ?', [lesson[0].module_id]);
    const [course] = await mysqlPool.execute('SELECT instructor_id FROM courses WHERE id = ?', [module[0].course_id]);
    if (course[0].instructor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await mysqlPool.execute('DELETE FROM lessons WHERE id = ?', [req.params.id]);
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getLessons, getLessonById, createLesson, updateLesson, patchLesson, deleteLesson };