import { NextResponse } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map();

export function rateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const key = identifier;
    
    if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, { count: 0, resetTime: now + windowMs });
    }
    
    const record = rateLimitStore.get(key);
    
    // Reset if window has passed
    if (now > record.resetTime) {
        record.count = 0;
        record.resetTime = now + windowMs;
    }
    
    // Check if limit exceeded
    if (record.count >= maxAttempts) {
        return {
            success: false,
            message: 'Too many attempts. Please try again later.',
            retryAfter: Math.ceil((record.resetTime - now) / 1000)
        };
    }
    
    // Increment counter
    record.count++;
    
    return { success: true };
}

export function getClientIP(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    return forwarded?.split(',')[0] || realIP || 'unknown';
}

export function clearRateLimit(identifier) {
    rateLimitStore.delete(identifier);
}

export function getRemainingAttempts(identifier, maxAttempts = 5) {
    const record = rateLimitStore.get(identifier);
    if (!record) return maxAttempts;
    
    const now = Date.now();
    if (now > record.resetTime) return maxAttempts;
    
    return Math.max(0, maxAttempts - record.count);
}