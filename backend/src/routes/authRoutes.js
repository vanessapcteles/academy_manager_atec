import express from 'express';
import { register, login, updateUser, deleteUser, getUsers, getUserById } from '../controllers/authControllers.js';

const router = express.Router();

// Rota para registar utilizador
router.post('/register', register);

// Rota para login
router.post('/login', login);

// Listar todos os utilizadores
router.get('/user', getUsers);

// Obter um utilizador específico
router.get('/user/:id', getUserById);

// Rota para editar utilizador (ID é passado na URL)
router.put('/user/:id', updateUser);

// Rota para eliminar utilizador (ID é passado na URL)
router.delete('/user/:id', deleteUser);

export default router;


