const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const UserRepository = require('../repositories/UserRepository');
const LocalCredential = require('../models/mongo/LocalCredential');
const ApprovalRequest = require('../models/mongo/ApprovalRequest');

class AuthService {
  static async localLogin({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const credential = await LocalCredential.findOne({ email: normalizedEmail });

    if (!credential) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    if (credential.status === 'pending') {
      const err = new Error('Your account is pending admin approval');
      err.status = 403;
      throw err;
    }

    if (credential.status !== 'active' || !credential.user_id) {
      const err = new Error('This account is not active');
      err.status = 403;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, credential.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const user = await UserRepository.findById(credential.user_id);
    if (!user) {
      const err = new Error('Linked user account not found');
      err.status = 404;
      throw err;
    }

    return {
      user,
      token: generateToken(user)
    };
  }

  static async signup({ name, email, password, role = 'learner' }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await UserRepository.findByEmail(normalizedEmail);
    const existingCredential = await LocalCredential.findOne({ email: normalizedEmail });

    if (existingUser || existingCredential) {
      const err = new Error('An account with this email already exists');
      err.status = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (role === 'instructor') {
      const credential = await LocalCredential.create({
        name,
        email: normalizedEmail,
        password_hash: passwordHash,
        status: 'pending',
        requested_role: 'instructor'
      });

      await ApprovalRequest.create({
        requester_id: null,
        request_type: 'instructor_signup',
        action: 'create',
        entity_id: credential._id.toString(),
        payload: {
          credential_id: credential._id.toString(),
          name,
          email: normalizedEmail
        }
      });

      return {
        requiresApproval: true,
        message: 'Instructor signup request submitted for admin approval'
      };
    }

    const user = await UserRepository.create({
      name,
      email: normalizedEmail,
      role: 'learner'
    });

    await LocalCredential.create({
      user_id: user.id,
      name,
      email: normalizedEmail,
      password_hash: passwordHash,
      status: 'active',
      requested_role: 'learner'
    });

    return {
      requiresApproval: false,
      user,
      token: generateToken(user)
    };
  }
}

module.exports = AuthService;
