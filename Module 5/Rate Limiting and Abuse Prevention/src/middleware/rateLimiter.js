'use strict';
const rateLimit = require('express-rate-limit');

const windowMs = 15 * 60 * 1000;

module.exports = rateLimit({
  windowMs,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    const resetTime = req.rateLimit.resetTime;
    const retryAfter = Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  },
  // For multiple instances, rate-limit-redis can replace the default in-memory store
  // with a shared Redis store; otherwise each load-balanced instance has its own
  // counter and a client can exceed the intended limit by reaching different instances.
});
