import express from 'express';
import { getTurmaSchedule, createLesson, deleteLesson } from '../controllers/horarioController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/turma/:turmaId', getTurmaSchedule);
router.post('/', createLesson);
router.delete('/:id', deleteLesson);

export default router;
