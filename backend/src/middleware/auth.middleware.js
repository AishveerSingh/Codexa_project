import { verifyAuthToken } from "../utils/auth.js";

function getBearerToken(req) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length).trim();
}

export function requireAuth(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({
      message: "Authentication required."
    });
  }

  try {
    const payload = verifyAuthToken(token);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (_error) {
    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }
}

export function requireRole(...roles) {
  return function enforceRole(req, res, next) {
    if (!req.auth) {
      return res.status(401).json({
        message: "Authentication required."
      });
    }

    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource."
      });
    }

    next();
  };
}

export function requireStudentMatchOrAdmin(req, res, next) {
  if (!req.auth) {
    return res.status(401).json({
      message: "Authentication required."
    });
  }

  if (req.auth.role === "admin" || req.auth.userId === req.params.studentId) {
    return next();
  }

  return res.status(403).json({
    message: "You do not have permission to access this student's data."
  });
}
