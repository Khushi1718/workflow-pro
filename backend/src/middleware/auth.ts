import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 401, 'No token provided', 'Authorization header missing');
      return;
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);

    req.user = user;
    next();
  } catch (error) {
    sendError(res, 401, 'Authentication failed', 'Invalid or expired token');
  }
};

export const authorize = (...roles: Array<'admin' | 'employee'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 403, 'Access denied', 'Insufficient permissions');
      return;
    }

    next();
  };
};
