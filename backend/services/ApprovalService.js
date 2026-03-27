const ApprovalRequest = require('../models/mongo/ApprovalRequest');
const LocalCredential = require('../models/mongo/LocalCredential');
const UserRepository = require('../repositories/UserRepository');
const CourseService = require('./CourseService');
const ModuleService = require('./ModuleService');
const LessonService = require('./LessonService');

class ApprovalService {
  static async listForUser(user) {
    if (user.role === 'admin') {
      return ApprovalRequest.find({}).sort({ created_at: -1 });
    }

    return ApprovalRequest.find({ requester_id: user.sub }).sort({ created_at: -1 });
  }

  static createRequest(data) {
    return ApprovalRequest.create(data);
  }

  static async approve(id, reviewerId) {
    const request = await ApprovalRequest.findById(id);
    if (!request) {
      const err = new Error('Approval request not found');
      err.status = 404;
      throw err;
    }

    if (request.status !== 'pending') {
      const err = new Error('This request has already been reviewed');
      err.status = 409;
      throw err;
    }

    let result = null;

    switch (request.request_type) {
      case 'instructor_signup': {
        const credential = await LocalCredential.findById(request.entity_id);
        if (!credential) {
          const err = new Error('Pending instructor credential not found');
          err.status = 404;
          throw err;
        }

        let user = await UserRepository.findByEmail(credential.email);
        if (!user) {
          user = await UserRepository.create({
            name: credential.name,
            email: credential.email,
            role: 'instructor'
          });
        } else if (user.role !== 'instructor') {
          user = await UserRepository.patch(user.id, { role: 'instructor' });
        }

        credential.user_id = user.id;
        credential.status = 'active';
        credential.requested_role = 'instructor';
        await credential.save();
        result = user;
        break;
      }
      case 'course':
        result = await this.applyResourceRequest(CourseService, request);
        break;
      case 'module':
        result = await this.applyResourceRequest(ModuleService, request);
        break;
      case 'lesson':
        result = await this.applyResourceRequest(LessonService, request);
        break;
      default: {
        const err = new Error('Unsupported approval request type');
        err.status = 400;
        throw err;
      }
    }

    request.status = 'approved';
    request.reviewer_id = reviewerId;
    request.reviewed_at = new Date();
    await request.save();

    return { request, result };
  }

  static async reject(id, reviewerId, note = '') {
    const request = await ApprovalRequest.findById(id);
    if (!request) {
      const err = new Error('Approval request not found');
      err.status = 404;
      throw err;
    }

    if (request.status !== 'pending') {
      const err = new Error('This request has already been reviewed');
      err.status = 409;
      throw err;
    }

    request.status = 'rejected';
    request.reviewer_id = reviewerId;
    request.note = note;
    request.reviewed_at = new Date();
    await request.save();

    if (request.request_type === 'instructor_signup') {
      const credential = await LocalCredential.findById(request.entity_id);
      if (credential) {
        credential.status = 'disabled';
        await credential.save();
      }
    }

    return request;
  }

  static async applyResourceRequest(service, request) {
    if (request.action === 'create') {
      return service.create(request.payload);
    }

    if (request.action === 'update') {
      return service.patch(request.entity_id, request.payload);
    }

    if (request.action === 'delete') {
      await service.remove(request.entity_id);
      return true;
    }

    const err = new Error('Unsupported approval request action');
    err.status = 400;
    throw err;
  }
}

module.exports = ApprovalService;
