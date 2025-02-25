import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // Макс. 5 попыток на IP
  message: { success: false, message: "Too many login attempts. Try again later." },
  headers: true,
  trustProxy: false
});
