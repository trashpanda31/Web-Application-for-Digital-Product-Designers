import { log } from '../utils/logger.js';

export const getUserProfile = async (req, res, next) => {
  try {
    log(`User profile requested: ${req.user.id}`);
    res.json({ message: 'User profile route works' });
  } catch (error) {
    next(error);
  }
};
