import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import redis from '../config/redis.js';

export const register = async (req, res) => {
  try {
    const { nome_completo, email, password, tipo_utilizador } = req.body;

    // ... (mesma lógica de validações)
    if (!nome_completo || !email || !password || !tipo_utilizador) {
      return res.status(400).json({ message: 'Dados em falta' });
    }

    const [roles] = await db.query('SELECT id FROM roles WHERE nome = ?', [tipo_utilizador.toUpperCase()]);
    if (roles.length === 0) return res.status(400).json({ message: 'Tipo de utilizador inválido' });
    const role_id = roles[0].id;

    const [existingUser] = await db.query('SELECT id FROM utilizadores WHERE email = ?', [email]);
    if (existingUser.length > 0) return res.status(409).json({ message: 'Email já registado' });

    const password_hash = await bcrypt.hash(password, 10);
    const activation_token = uuidv4();

    await db.query(
      `INSERT INTO utilizadores (nome_completo, email, password_hash, role_id, activation_token, is_active, auth_provider)
      VALUES (?, ?, ?, ?, ?, true, 'local')`,
      [nome_completo, email, password_hash, role_id, activation_token]
    );

    // Limpar cache após inserir novo utilizador
    await redis.del('users:all');

    return res.status(201).json({ message: 'Utilizador registado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// ... login (não precisa de cache limpar)

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Dados em falta' });
    }

    // Join com a tabela roles para obter o nome da role
    const [users] = await db.query(
      `SELECT u.*, r.nome as tipo_utilizador 
       FROM utilizadores u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Conta ainda não ativada. Verifica o teu email.' });
    }

    // Nota: Aqui podes gerar um JWT, mas para simplificar agora apenas devolvemos o user
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        nome_completo: user.nome_completo,
        email: user.email,
        tipo_utilizador: user.tipo_utilizador
      },
      token: 'token_temporario_ate_jwt'
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Editar utilizador
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_completo, email, tipo_utilizador } = req.body;

    const [existing] = await db.query('SELECT * FROM utilizadores WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Utilizador não encontrado' });

    let role_id = existing[0].role_id;
    if (tipo_utilizador) {
      const [roles] = await db.query('SELECT id FROM roles WHERE nome = ?', [tipo_utilizador.toUpperCase()]);
      if (roles.length > 0) role_id = roles[0].id;
    }

    await db.query(
      'UPDATE utilizadores SET nome_completo = ?, email = ?, role_id = ? WHERE id = ?',
      [nome_completo || existing[0].nome_completo, email || existing[0].email, role_id, id]
    );

    // Limpar cache
    await redis.del('users:all');

    return res.status(200).json({ message: 'Utilizador atualizado com sucesso' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar utilizador' });
  }
};

// Eliminar utilizador
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM utilizadores WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Utilizador não encontrado' });

    // Limpar cache
    await redis.del('users:all');

    return res.status(200).json({ message: 'Utilizador eliminado com sucesso' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao eliminar utilizador' });
  }
};

// Listar todos os utilizadores (COM CACHE)
export const getUsers = async (req, res) => {
  try {
    // 1. Tentar ler da Cache
    const cachedUsers = await redis.get('users:all');
    if (cachedUsers) {
      console.log('⚡ Dados vindos da Cache (Redis)');
      return res.status(200).json(JSON.parse(cachedUsers));
    }

    // 2. Se não existir, ir à Base de Dados
    console.log('🗄️ Dados vindos da Base de Dados (MySQL)');
    const [users] = await db.query(
      `SELECT u.id, u.nome_completo, u.email, u.is_active, r.nome as tipo_utilizador, u.data_criacao 
       FROM utilizadores u 
       JOIN roles r ON u.role_id = r.id`
    );

    // 3. Guardar na Cache por 1 hora (3600 segundos)
    await redis.setEx('users:all', 3600, JSON.stringify(users));

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao listar utilizadores' });
  }
};

// Obter um utilizador específico (Pode-se fazer cache por ID também)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.query(
      `SELECT u.id, u.nome_completo, u.email, u.is_active, r.nome as tipo_utilizador, u.data_criacao 
       FROM utilizadores u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [id]
    );

    if (users.length === 0) return res.status(404).json({ message: 'Utilizador não encontrado' });
    return res.status(200).json(users[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao obter utilizador' });
  }
};




