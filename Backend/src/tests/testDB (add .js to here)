import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to Database'))
  .catch(err => console.error('❌ Failed to connect to Database:', err));

// Функция тестовой записи
async function testDB() {
  try {
    const user = new User({
      username: 'st79687',
      email: 'test@test.com',
      password: 'pass79687',
    });
    await user.save();
    console.log('✅ Successfully saved user to db:', user);
  } catch (err) {
    console.error('❌ Error while saving user:', err);
  } finally {
    await mongoose.connection.close();
  }
}

(async () => {
  await testDB();
})();
