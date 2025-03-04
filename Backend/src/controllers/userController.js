import { log } from '../utils/logger.js';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import multer from 'multer';

// ✅ Получение профиля (оставляем только ОДНО объявление)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/** ✅ Обновление имени и фамилии */
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, username } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.username = username || user.username;

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/** ✅ Обновление email (требует пароль дважды) */
// Обновление email (с подтверждением пароля)
export const updateEmail = async (req, res) => {
  try {
    const { newEmail, currentPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (currentPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    user.email = newEmail;
    await user.save();
    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Проверка совпадения нового пароля и его подтверждения
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    // Проверка длины пароля и его требований
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, contain at least one uppercase letter and one digit.'
      });
    }

    // Проверка текущего пароля
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Обновление пароля
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



// ✅ Обновление аватара
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const updateAvatar = [
  upload.single('avatar'),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      user.avatarUrl = `data:image/png;base64,${req.file.buffer.toString('base64')}`;
      await user.save();

      res.json({ message: 'Avatar updated successfully', avatarUrl: user.avatarUrl });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
];


