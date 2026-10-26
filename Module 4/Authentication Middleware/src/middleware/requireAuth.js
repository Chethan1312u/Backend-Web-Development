const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization ?? '';
  const match = /^Bearer ([^\s]+)$/.exec(authHeader);
  const token = match ? match[1] : null;

  if (!token) {
    return res.status(401).json({
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
  } catch (_error) {
    return res.status(401).json({
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    });
  }

  req.user = payload;
  next();
};
