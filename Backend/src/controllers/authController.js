import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// 🔹 Константы токенов
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Проверка на существующего пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверка наличия пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Генерация токенов
    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

    // Сохранение refreshToken в базе
    user.refreshToken = refreshToken;
    await user.save();

    // Установка refreshToken в куки
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Только HTTPS в продакшене
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    console.log('Cookies received:', req.cookies);

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
    res.status(500).json({ message: 'Server Error' });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.sendStatus(204);

    // Очистка refreshToken в базе
    const user = await User.findOne({ refreshToken });
    if (!user) return res.sendStatus(204);

    user.refreshToken = null;
    await user.save();

    // Удаление куки
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
