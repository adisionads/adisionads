import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window cache per IP
const ipRequestStore = new Map<string, RateLimitRecord>();

/**
 * Clean expired entries periodically (every 5 minutes)
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestStore.entries()) {
    if (now > record.resetTime) {
      ipRequestStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Extract client IP from incoming request headers
 */
export function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Simple in-memory rate limiter
 * @param request NextRequest
 * @param maxRequests Maximum requests allowed within window
 * @param windowMs Window duration in milliseconds (default: 60,000ms = 1 minute)
 */
export function checkRateLimit(
  request: NextRequest,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetMs: number } {
  const ip = getClientIp(request);
  const now = Date.now();
  const record = ipRequestStore.get(ip);

  if (!record || now > record.resetTime) {
    ipRequestStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetMs: windowMs,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, record.resetTime - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetMs: Math.max(0, record.resetTime - now),
  };
}
