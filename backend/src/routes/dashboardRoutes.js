import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apenas Admin e Secretaria devem ver as estatísticas globais
router.get('/stats', authenticateToken, authorizeRole(['ADMIN', 'SECRETARIA']), getDashboardStats);

export default router;
