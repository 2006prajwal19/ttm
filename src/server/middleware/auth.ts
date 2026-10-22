import { Request, Response, NextFunction } from 'express';
import { db, User } from '../db/store.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'traveller' | 'admin';
    name: string;
  };
  token?: string;
}

/**
 * Creates a database-backed session token stored in MongoDB / document store.
 * Eliminates the need for any JWT secret key in environment variables.
 */
export function generateToken(user: User): string {
  return db.createSession(user);
}

/**
 * Validates the session token directly against the MongoDB / document database.
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. No session token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const session = db.validateSession(token);

  if (!session) {
    res.status(401).json({ success: false, message: 'Invalid or expired session. Please sign in again.' });
    return;
  }

  const user = db.users.find(u => u._id === session.userId);
  if (!user) {
    res.status(401).json({ success: false, message: 'User record not found.' });
    return;
  }
  if (user.status === 'suspended') {
    res.status(403).json({ success: false, message: 'Account is suspended. Please contact administrator.' });
    return;
  }

  req.user = {
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  req.token = token;

  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
}
