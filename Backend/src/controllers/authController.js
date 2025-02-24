import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { log, logSecurity } from '../utils/logger.js';



dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const register = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword, firstName, lastName } = req.body;

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one letter and one number' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      avatar: '',
    });

    await user.save();
    log(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: user._id,
    });

  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      logSecurity(`Failed login attempt: non-existent email ${email}`);
      return res.status(400).json({ message: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logSecurity(`Failed login attempt: incorrect password for ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    log(`User logged in: ${email}`);
    res.status(200).json({ accessToken });

  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token, access denied' });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || user._id.toString() !== decoded.userId) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const newAccessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      res.status(200).json({ accessToken: newAccessToken });
    });

  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.sendStatus(204);

    const user = await User.findOne({ refreshToken });
    if (!user) return res.sendStatus(204);

    user.refreshToken = null;
    await user.save();

    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    log(`User logged out: ${user.email}`);
    res.status(200).json({ message: 'Logged out successfully' });

  } catch (error) {
    next(error);
  }
};
