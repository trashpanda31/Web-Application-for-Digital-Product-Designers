import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js'; // Добавляем .js в пути, т.к. в ESM это обязательно

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

console.log('Loaded mongodb uri', MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
      console.error('❌ Cannot connect to MongoDB:', err);
      process.exit(1);
  });

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
});
