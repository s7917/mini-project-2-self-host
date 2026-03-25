const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const { mysqlPool } = require('./database');
const AuthLog = require('../models/AuthLog');

const getGithubName = (profile) => {
  return profile.displayName || profile.username || `GitHub User ${profile.id}`;
};

const getGithubEmail = (profile) => {
  return profile.emails?.[0]?.value || `${profile.username || profile.id}@users.noreply.github.com`;
};

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    const [rows] = await mysqlPool.execute('SELECT * FROM users WHERE github_id = ?', [profile.id]);
    let user;
    if (rows.length > 0) {
      user = rows[0];
    } else {
      const name = getGithubName(profile);
      const email = getGithubEmail(profile);

      // Reuse an existing account when the email already exists.
      const [existingUsersByEmail] = await mysqlPool.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (existingUsersByEmail.length > 0) {
        await mysqlPool.execute('UPDATE users SET github_id = ? WHERE id = ?', [profile.id, existingUsersByEmail[0].id]);
        user = { ...existingUsersByEmail[0], github_id: profile.id };
      } else {
        const [result] = await mysqlPool.execute(
          'INSERT INTO users (name, email, github_id, role) VALUES (?, ?, ?, ?)',
          [name, email, profile.id, 'learner']
        );
        user = { id: result.insertId, name, email, role: 'learner', github_id: profile.id };
      }
    }

    // Log auth success
    await AuthLog.create({ user_id: user.id, status: 'success' });

    return done(null, user);
  } catch (error) {
    // Log auth failure
    await AuthLog.create({ status: 'failure' });
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await mysqlPool.execute('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (error) {
    done(error, null);
  }
});

const generateJWT = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { passport, generateJWT };
