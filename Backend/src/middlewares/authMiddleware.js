import jwt from 'jsonwebtoken';
import { logSecurity } from '../utils/logger.js';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logSecurity(`Unauthorized access attempt from IP: ${req.ip}`);
      return res.status(401).json({ message: 'No token, authentication denied' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logSecurity(`Invalid token attempt from IP: ${req.ip}`);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default authMiddleware;
