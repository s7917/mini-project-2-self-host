const { mysqlPool } = require('../config/database');

const createTables = async () => {
  try {
    // Users table
    await mysqlPool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role ENUM('learner', 'instructor', 'admin') DEFAULT 'learner',
        github_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Courses table
    await mysqlPool.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructor_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id)
      )
    `);

    // Modules table
    await mysqlPool.execute(`
      CREATE TABLE IF NOT EXISTS modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT,
        module_name VARCHAR(255) NOT NULL,
        sequence_order INT,
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    // Lessons table
    await mysqlPool.execute(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        module_id INT,
        lesson_name VARCHAR(255) NOT NULL,
        content TEXT,
        FOREIGN KEY (module_id) REFERENCES modules(id)
      )
    `);

    // Enrollments table
    await mysqlPool.execute(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        course_id INT,
        status ENUM('active', 'completed') DEFAULT 'active',
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    // Progress table
    await mysqlPool.execute(`
      CREATE TABLE IF NOT EXISTS progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        course_id INT,
        completion_percentage DECIMAL(5,2) DEFAULT 0,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    // Performance table
    await mysqlPool.execute(`
      CREATE TABLE IF NOT EXISTS performance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        course_id INT,
        score DECIMAL(5,2),
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    console.log('MySQL tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

const insertSampleData = async () => {
  try {
    // Insert sample users
    await mysqlPool.execute(`
      INSERT IGNORE INTO users (id, name, email, role) VALUES
      (1, 'Instructor One', 'instructor@example.com', 'instructor'),
      (2, 'Learner One', 'learner@example.com', 'learner')
    `);

    // Insert sample course
    await mysqlPool.execute(`
      INSERT IGNORE INTO courses (id, title, description, instructor_id) VALUES
      (1, 'Java Basics', 'Intro to Java', 1)
    `);

    // Insert sample module
    await mysqlPool.execute(`
      INSERT IGNORE INTO modules (id, course_id, module_name, sequence_order) VALUES
      (1, 1, 'Introduction', 1)
    `);

    // Insert sample lesson
    await mysqlPool.execute(`
      INSERT IGNORE INTO lessons (id, module_id, lesson_name, content) VALUES
      (1, 1, 'Variables', 'Content here')
    `);

    // Insert sample enrollment
    await mysqlPool.execute(`
      INSERT IGNORE INTO enrollments (id, user_id, course_id, status, enrolled_at) VALUES
      (1, 2, 1, 'active', '2026-01-01')
    `);

    // Insert sample progress
    await mysqlPool.execute(`
      INSERT IGNORE INTO progress (id, user_id, course_id, completion_percentage, last_accessed) VALUES
      (1, 2, 1, 40, '2026-01-05')
    `);

    console.log('Sample data inserted');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};

module.exports = { createTables, insertSampleData };

if (require.main === module) {
  const run = async () => {
    await createTables();
    await insertSampleData();
    process.exit(0);
  };

  run().catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
}
