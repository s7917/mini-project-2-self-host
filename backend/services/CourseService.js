const CourseRepository = require('../repositories/CourseRepository');
const cache = require('../config/cache');

class CourseService {
  static async getAll() {
    const cached = cache.get('course_list');
    if (cached) return cached;
    const courses = await CourseRepository.findAll();
    cache.set('course_list', courses);
    return courses;
  }

  static getById(id) { return CourseRepository.findByIdWithModules(id); }

  static async create(data) {
    const course = await CourseRepository.create(data);
    cache.del('course_list');
    return course;
  }

  static async update(id, data) {
    const course = await CourseRepository.update(id, data);
    cache.del('course_list');
    return course;
  }

  static async patch(id, data) {
    const course = await CourseRepository.patch(id, data);
    cache.del('course_list');
    return course;
  }

  static async remove(id) {
    const course = await CourseRepository.findById(id);
    if (!course) { const err = new Error('Course not found'); err.status = 404; throw err; }
    await CourseRepository.delete(id);
    cache.del('course_list');
    return true;
  }
}

module.exports = CourseService;
