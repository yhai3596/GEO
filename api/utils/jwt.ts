import jwt from 'jsonwebtoken';
import { User } from '../../shared/types/database.js';

const JWT_SECRET = (process.env.JWT_SECRET || 'your-super-secret-jwt-key') as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  id: string;
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    id: user.id,
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'geo-platform',
    audience: 'geo-platform-users'
  } as any);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'geo-platform',
      audience: 'geo-platform-users'
    }) as JwtPayload;
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const refreshToken = (token: string): string => {
  try {
    const decoded = verifyToken(token);
    
    // 创建新的payload（不包含过期时间）
    const newPayload: JwtPayload = {
      id: decoded.id,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    return jwt.sign(newPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'geo-platform',
      audience: 'geo-platform-users'
    } as any);
  } catch (error) {
    throw new Error('Cannot refresh invalid token');
  }
};