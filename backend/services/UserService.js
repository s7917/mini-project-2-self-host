const UserRepository = require('../repositories/UserRepository');

class UserService {
  static getAll() { return UserRepository.findAll(); }
  static getById(id) { return UserRepository.findById(id); }
  static create(data) { return UserRepository.create(data); }
  static update(id, data) { return UserRepository.update(id, data); }
  static patch(id, data) { return UserRepository.patch(id, data); }
  static async remove(id) {
    const user = await UserRepository.findById(id);
    if (!user) { const err = new Error('User not found'); err.status = 404; throw err; }
    return UserRepository.delete(id);
  }
}

module.exports = UserService;
