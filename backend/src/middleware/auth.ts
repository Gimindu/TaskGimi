import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Shape of the decoded JWT payload — kept in sync with the token we sign in authRoutes
export interface AuthUserPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
  name: string;
}

// Extend Express Request to carry the decoded user after token verification
export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

// Middleware: validates the Bearer token on every protected route
export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'task_gimi_super_secret_jwt_key_2026_!@#';

  try {
    const decoded = jwt.verify(token, secret) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    // Covers both expired and tampered tokens
    res.status(401).json({ message: 'Invalid or expired token.' });
    return;
  }
};
