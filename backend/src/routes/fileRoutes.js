import express from 'express';
import { upload } from '../config/upload.js';
import { uploadFile, getUserFiles, getFile, deleteFile } from '../controllers/fileController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware de Autenticação em todas as rotas de ficheiros
router.use(authenticateToken);

// Listar ficheiros de um user (id do user na URL)
router.get('/user/:id', getUserFiles);

// Upload (id do user na URL)
// 'file' corresponde ao name="file" no form data do frontend
router.post('/user/:id', upload.single('file'), uploadFile);

// Obter ficheiro especifico (pelo ID do ficheiro)
// A URL será /api/files/:fileId
router.get('/:fileId', getFile);

// Apagar
router.delete('/:fileId', deleteFile);

export default router;
