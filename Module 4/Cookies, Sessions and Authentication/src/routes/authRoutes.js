const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../db/prisma');
const requireSession = require('../middleware/requireSession');
const sessionStore = require('../session/sessionStore');

const router = express.Router();
const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
  path: '/',
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({
      error: { code: 'INVALID_REQUEST', message: 'Email and password are required' },
    });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
  }

  const sid = sessionStore.create(user.id);
  res.cookie('sid', sid, {
    ...cookieOptions,
    maxAge: sessionStore.SESSION_TTL_MS,
    signed: true,
  });

  return res.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
});

router.get('/me', requireSession, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    sessionStore.destroy(req.signedCookies.sid);
    res.clearCookie('sid', cookieOptions);
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
    });
  }

  return res.json({ user });
});

router.post('/logout', async (req, res) => {
  sessionStore.destroy(req.signedCookies.sid);
  res.clearCookie('sid', cookieOptions);
  return res.json({ message: 'Logged out' });
});

module.exports = router;
