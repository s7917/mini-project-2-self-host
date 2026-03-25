const ModuleRepository = require('../repositories/ModuleRepository');
const cache = require('../config/cache');

class ModuleService {
  static async getAll() {
    const cached = cache.get('module_list');
    if (cached) return cached;
    const modules = await ModuleRepository.findAll();
    cache.set('module_list', modules);
    return modules;
  }

  static getById(id) { return ModuleRepository.findByIdWithLessons(id); }
  static getByCourseId(courseId) { return ModuleRepository.findByCourseId(courseId); }

  static async create(data) {
    const mod = await ModuleRepository.create(data);
    cache.del('module_list');
    return mod;
  }

  static async update(id, data) {
    const mod = await ModuleRepository.update(id, data);
    cache.del('module_list');
    return mod;
  }

  static async patch(id, data) {
    const mod = await ModuleRepository.patch(id, data);
    cache.del('module_list');
    return mod;
  }

  static async remove(id) {
    const mod = await ModuleRepository.findById(id);
    if (!mod) { const err = new Error('Module not found'); err.status = 404; throw err; }
    await ModuleRepository.delete(id);
    cache.del('module_list');
    return true;
  }
}

module.exports = ModuleService;
