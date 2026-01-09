import express from 'express';
import { register, login } from '../controllers/authControllers.js';

const router = express.Router();

// Rota para registar utilizador: http://localhost:3001/api/auth/register
router.post('/register', register);

// Rota para login: http://localhost:3001/api/auth/login
router.post('/login', login);

export default router;
