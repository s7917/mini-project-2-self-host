const bcrypt = require('bcryptjs');
const UserRepository = require('../repositories/UserRepository');
const LocalCredential = require('../models/mongo/LocalCredential');

const DEMO_PASSWORD = 'Sigverse123!';
const DEMO_ACCOUNTS = [
  { name: 'Sigverse Admin', email: 'admin@sigverse.local', role: 'admin' },
  { name: 'Sigverse Instructor', email: 'instructor@sigverse.local', role: 'instructor' },
  { name: 'Sigverse Learner', email: 'learner@sigverse.local', role: 'learner' }
];

class BootstrapService {
  static getDemoAccounts() {
    return DEMO_ACCOUNTS.map((account) => ({
      role: account.role,
      email: account.email,
      password: DEMO_PASSWORD
    }));
  }

  static async ensureDemoAccounts() {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    for (const account of DEMO_ACCOUNTS) {
      let user = await UserRepository.findByEmail(account.email);
      if (!user) {
        user = await UserRepository.create({
          name: account.name,
          email: account.email,
          role: account.role
        });
      }

      const credential = await LocalCredential.findOne({ email: account.email });
      if (!credential) {
        await LocalCredential.create({
          user_id: user.id,
          name: account.name,
          email: account.email,
          password_hash: passwordHash,
          status: 'active',
          requested_role: account.role,
          demo_account: true
        });
      } else {
        credential.user_id = user.id;
        credential.name = account.name;
        credential.status = 'active';
        credential.requested_role = account.role;
        credential.demo_account = true;
        credential.password_hash = passwordHash;
        await credential.save();
      }
    }
  }
}

module.exports = BootstrapService;
