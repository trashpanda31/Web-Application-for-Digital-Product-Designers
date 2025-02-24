import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { log, logError } from '../utils/logger.js';

dotenv.config();

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => log('Connected to database'))
    .catch((err) => {
      logError(`Failed to connect to database: ${err}`);
      process.exit(1);
    });

async function testDB() {
  try {
    const user = new User({
      username: 'st79687',
      email: 'test@test.com',
      password: 'pass79687',
    });

    await user.save();
    log(`Successfully saved user to database: ${user.email}`);
  } catch (err) {
    logError(`Error while saving user: ${err}`);
  } finally {
    await mongoose.connection.close();
  }
}

(async () => {
  await testDB();
})();
