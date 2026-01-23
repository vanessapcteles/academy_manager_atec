import express from 'express';
import { getTurmaModules, addModuleToTurma, removeModuleFromTurma } from '../controllers/turmaDetalhesController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// /api/turma-details/:turmaId
router.get('/:turmaId', getTurmaModules);
router.post('/:turmaId', addModuleToTurma);
router.delete('/:detalheId', removeModuleFromTurma);

export default router;
