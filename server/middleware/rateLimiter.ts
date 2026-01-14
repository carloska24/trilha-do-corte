import rateLimit from 'express-rate-limit';

// General API rate limiter - 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    error: 'Muitas requisições. Tente novamente em alguns minutos.',
    retryAfter: 15,
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Strict limiter for authentication routes - 10 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 login attempts
  message: {
    error: 'Muitas tentativas de login. Aguarde 15 minutos.',
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Appointment creation limiter - prevent spam bookings
export const appointmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 bookings per hour per IP
  message: {
    error: 'Limite de agendamentos atingido. Tente novamente mais tarde.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
