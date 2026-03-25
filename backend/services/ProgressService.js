const ProgressRepository = require('../repositories/ProgressRepository');

class ProgressService {
  static getAll() { return ProgressRepository.findAll(); }
  static getById(id) { return ProgressRepository.findById(id); }
  static getByUserId(userId) { return ProgressRepository.findByUserId(userId); }

  static create(data) { return ProgressRepository.create(data); }
  static update(id, data) { return ProgressRepository.update(id, data); }
  static patch(id, data) { return ProgressRepository.patch(id, data); }

  static async remove(id) {
    const progress = await ProgressRepository.findById(id);
    if (!progress) { const err = new Error('Progress not found'); err.status = 404; throw err; }
    return ProgressRepository.delete(id);
  }
}

module.exports = ProgressService;
