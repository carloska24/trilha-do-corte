import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authenticateToken } from '../../server/middleware/auth';
import { Request, Response, NextFunction } from 'express';

describe('authenticateToken Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.stubEnv('JWT_SECRET', 'test_secret');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return 500 if JWT_SECRET is missing', () => {
    // Simulate missing secret
    vi.stubEnv('JWT_SECRET', '');

    // Mock a valid-looking header so we pass the first check
    req.headers = { authorization: 'Bearer some_token' };

    authenticateToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('interno') })
    );
  });

  it('should return 401 if no token provided', () => {
    req.headers = {};
    authenticateToken(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
