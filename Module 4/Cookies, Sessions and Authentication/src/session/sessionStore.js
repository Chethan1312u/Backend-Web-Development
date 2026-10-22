const { randomBytes } = require('node:crypto');

const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 60 * 60 * 1000);

if (!Number.isSafeInteger(SESSION_TTL_MS) || SESSION_TTL_MS <= 0) {
  throw new Error('SESSION_TTL_MS must be a positive integer');
}

const sessions = new Map();

function create(userId) {
  const sid = randomBytes(32).toString('hex');
  sessions.set(sid, {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return sid;
}

function get(sid) {
  if (typeof sid !== 'string') return null;

  const session = sessions.get(sid);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(sid);
    return null;
  }

  return session;
}

function destroy(sid) {
  if (typeof sid === 'string') sessions.delete(sid);
}

module.exports = { create, get, destroy, SESSION_TTL_MS };
