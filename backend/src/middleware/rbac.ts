import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

// Higher-order middleware — returns a guard that restricts access to the specified roles.
// Usage: router.use(requireRole('admin'))  or  router.get('/...', requireRole('admin', 'user'), handler)
export const requireRole = (...roles: ('user' | 'admin')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized. User context missing.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: `Forbidden. Role '${req.user.role}' does not have sufficient permissions.`,
      });
      return;
    }

    next();
  };
};
