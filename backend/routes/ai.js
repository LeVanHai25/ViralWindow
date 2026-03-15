/**
 * =====================================================
 * AI ROUTES
 * =====================================================
 * /api/ai/*
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

// Dashboard AI Insights
router.get('/dashboard-insights', authenticateToken, aiController.getDashboardInsights);

// Smart Search
router.post('/search', authenticateToken, aiController.smartSearch);

// Chatbot
router.post('/chat', authenticateToken, aiController.chat);

// Auto Reports
router.get('/reports/:type', authenticateToken, aiController.getReport);

// Test AI connection
router.get('/test', aiController.testConnection);

module.exports = router;
