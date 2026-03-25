const pool = require('../../config/db.mysql');

class Performance {
  static async findAll() {
    const [rows] = await pool.query(
      `SELECT pf.*, u.name AS user_name, c.title AS course_title 
       FROM performance pf 
       LEFT JOIN users u ON pf.user_id = u.id 
       LEFT JOIN courses c ON pf.course_id = c.id`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT pf.*, u.name AS user_name, c.title AS course_title 
       FROM performance pf 
       LEFT JOIN users u ON pf.user_id = u.id 
       LEFT JOIN courses c ON pf.course_id = c.id 
       WHERE pf.id = ?`, [id]
    );
    return rows[0] || null;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT pf.*, c.title AS course_title 
       FROM performance pf 
       LEFT JOIN courses c ON pf.course_id = c.id 
       WHERE pf.user_id = ?`, [userId]
    );
    return rows;
  }

  static async create(data) {
    const { user_id, course_id, score } = data;
    const [result] = await pool.query(
      'INSERT INTO performance (user_id, course_id, score) VALUES (?, ?, ?)',
      [user_id, course_id, score]
    );
    return this.findById(result.insertId);
  }

  static async update(id, data) {
    const { user_id, course_id, score } = data;
    await pool.query(
      'UPDATE performance SET user_id = ?, course_id = ?, score = ? WHERE id = ?',
      [user_id, course_id, score, id]
    );
    return this.findById(id);
  }

  static async patch(id, data) {
    const fields = [];
    const values = [];
    if (data.user_id !== undefined) { fields.push('user_id = ?'); values.push(data.user_id); }
    if (data.course_id !== undefined) { fields.push('course_id = ?'); values.push(data.course_id); }
    if (data.score !== undefined) { fields.push('score = ?'); values.push(data.score); }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await pool.query(`UPDATE performance SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM performance WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Performance;
