const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

// Verifies the Bearer token in the Authorization header.
// On success, attaches the decoded JWT payload to req.user.
// On failure, throws ApiError so the global errorHandler responds with 401.

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'No Login token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Login Token expired');
    }
    throw new ApiError(401, 'Invalid Login token');
  }

  next();
};

module.exports = authenticate;
