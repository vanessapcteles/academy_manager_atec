import { db } from '../config/db.js';
import redis from '../config/redis.js';

// Listar todos os utilizadores (com a cache)
export const getUsers = async (req, res) => {
    try {
        //ler da Cache
        const cachedUsers = await redis.get('users:all');
        if (cachedUsers) {
            console.log('Dados vindos da Cache (Redis)');
            return res.status(200).json(JSON.parse(cachedUsers));
        }

        // Se não existir, vai à Base de Dados
        console.log('Dados vindos da Base de Dados (MySQL)');
        const [users] = await db.query(
            `SELECT u.id, u.nome_completo, u.email, u.is_active, r.nome as tipo_utilizador, u.data_criacao 
       FROM utilizadores u 
       JOIN roles r ON u.role_id = r.id`
        );

        // Guardar na Cache por 1 hora (3600 segundos)
        await redis.setEx('users:all', 3600, JSON.stringify(users));

        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao listar utilizadores' });
    }
};

// Obter um utilizador específico (também se pode fazer cache por ID)
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

        // Gestão de Perfis
        if (tipo_utilizador) {
            const role = tipo_utilizador.toUpperCase();
            try {
                // Limpar perfis antigos (Garantir que só existe numa tabela de perfil)
                await db.query('DELETE FROM formandos WHERE utilizador_id = ?', [id]);
                await db.query('DELETE FROM formadores WHERE utilizador_id = ?', [id]);
                await db.query('DELETE FROM secretaria WHERE utilizador_id = ?', [id]);

                // Criar novo perfil
                if (role === 'FORMANDO') {
                    await db.query('INSERT IGNORE INTO formandos (utilizador_id) VALUES (?)', [id]);
                } else if (role === 'FORMADOR') {
                    await db.query('INSERT IGNORE INTO formadores (utilizador_id) VALUES (?)', [id]);
                } else if (role === 'SECRETARIA' || role === 'ADMIN') {
                    // Admin faz parte da secretaria
                    await db.query('INSERT IGNORE INTO secretaria (utilizador_id, cargo) VALUES (?, ?)', [id, 'Técnico']);
                }
            } catch (profileError) {
                console.error('Erro ao gerir perfil:', profileError);
                // faz apenas o login, não falha o request
            }
        }

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
        // Limpar perfis associados
        await db.query('DELETE FROM formandos WHERE utilizador_id = ?', [id]);
        await db.query('DELETE FROM formadores WHERE utilizador_id = ?', [id]);
        await db.query('DELETE FROM secretaria WHERE utilizador_id = ?', [id]);
        await db.query('DELETE FROM ficheiros_anexos WHERE utilizador_id = ?', [id]);
        await db.query('DELETE FROM horarios_eventos WHERE utilizador_id = ?', [id]);

        // Eliminar o utilizador
        const [result] = await db.query('DELETE FROM utilizadores WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Utilizador não encontrado' });

        // Limpar cache
        await redis.del('users:all');

        return res.status(200).json({ message: 'Utilizador eliminado com sucesso' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao eliminar utilizador' });
    }
};
