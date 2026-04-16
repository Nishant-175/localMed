const express = require('express');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');
const chatbotController = require('../controllers/chatbotController');

const router = express.Router();

// Helper function to get client IP (handles IPv6)
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

// Rate limiter: 10 requests per minute per user
const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per windowMs
  message: 'Too many chatbot requests. Please wait before trying again.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Rate limit by user ID if authenticated, else by IP
  keyGenerator: (req) => req.user?.id || getClientIp(req),
  skip: (req) => false // Don't skip; unauthenticated will be rejected at middleware level
});

/**
 * POST /api/chatbot/analyze
 * Analyze patient symptoms and recommend doctor specialization
 * Protected: Requires JWT authentication (patients only)
 * Rate Limited: 10 requests per minute per user
 */
router.post(
  '/analyze',
  authMiddleware,
  chatbotLimiter,
  chatbotController.analyzeSymptoms
);

/**
 * GET /api/chatbot/health
 * Check if chatbot service is operational
 */
router.get('/health', chatbotController.healthCheck);

module.exports = router;
