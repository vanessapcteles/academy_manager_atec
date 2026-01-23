import express from 'express';
import { getFormadorProfile, updateFormadorProfile, listFormadores } from '../controllers/formadorController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', listFormadores);
router.get('/:userId/profile', getFormadorProfile);
router.put('/:userId/profile', updateFormadorProfile);

export default router;
