/**
 * Centralized configuration for the server
 */

export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_123',
    expiresIn: '30d' as const,
  },
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

// Security Warning: Alert if using fallback secret
if (!process.env.JWT_SECRET) {
  console.warn(
    '⚠️ [SECURITY] JWT_SECRET not set! Using insecure fallback. Set JWT_SECRET in production!'
  );
}

// Export commonly used values
export const JWT_SECRET = config.jwt.secret;
export const JWT_EXPIRES_IN = config.jwt.expiresIn;
