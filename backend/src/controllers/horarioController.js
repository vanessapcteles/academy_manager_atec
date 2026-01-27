import { db } from '../config/db.js';

// Listar horários de uma Turma
export const getTurmaSchedule = async (req, res) => {
    try {
        const { turmaId } = req.params;
        // Precisamos juntar com turma_detalhes e modulos para saber o que é a aula
        const [aulas] = await db.query(`
            SELECT 
                h.id, 
                h.inicio, 
                h.fim, 
                m.nome_modulo,
                f.biografia, -- aqui idealmente seria nome, mas f é tabela formadores
                u.nome_completo as nome_formador,
                s.nome_sala,
                td.id as id_turma_detalhe
            FROM horarios_aulas h
            JOIN turma_detalhes td ON h.id_turma_detalhe = td.id
            JOIN modulos m ON td.id_modulo = m.id
            JOIN formadores f ON td.id_formador = f.id
            JOIN utilizadores u ON f.utilizador_id = u.id
            JOIN salas s ON td.id_sala = s.id
            WHERE td.id_turma = ?
            ORDER BY h.inicio ASC
        `, [turmaId]);

        return res.json(aulas);
    } catch (error) {
        console.error('Erro ao listar horários:', error);
        return res.status(500).json({ message: 'Erro ao carregar horários' });
    }
};

// Criar aula (Agendar)
export const createLesson = async (req, res) => {
    try {
        const { id_turma_detalhe, inicio, fim } = req.body;

        if (!id_turma_detalhe || !inicio || !fim) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        const start = new Date(inicio);
        const end = new Date(fim);

        // 1. Validar duração Max 3h
        const durationMs = end - start;
        const durationHours = durationMs / (1000 * 60 * 60);

        if (durationHours > 3) {
            return res.status(400).json({ message: 'A duração máxima de uma aula é de 3 horas.' });
        }
        if (durationHours <= 0) {
            return res.status(400).json({ message: 'A data de fim deve ser posterior à de início.' });
        }

        // 2. Detetar Conflitos (Sala, Formador, Turma)
        // Primeiro, obter os recursos do detalhe (sala, formador, turma)
        const [detalhes] = await db.query('SELECT id_sala, id_formador, id_turma FROM turma_detalhes WHERE id = ?', [id_turma_detalhe]);

        if (detalhes.length === 0) return res.status(404).json({ message: 'Módulo/Detalhe não encontrado' });

        const { id_sala, id_formador, id_turma } = detalhes[0];

        // Verificar sobreposição genérica
        // Uma aula sobrepõe se: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)

        const [conflicts] = await db.query(`
            SELECT h.id, 'Sala' as tipo
            FROM horarios_aulas h
            JOIN turma_detalhes td ON h.id_turma_detalhe = td.id
            WHERE td.id_sala = ? 
            AND ? < h.fim AND ? > h.inicio
            
            UNION ALL
            
            SELECT h.id, 'Formador' as tipo
            FROM horarios_aulas h
            JOIN turma_detalhes td ON h.id_turma_detalhe = td.id
            WHERE td.id_formador = ?
            AND ? < h.fim AND ? > h.inicio

            UNION ALL

            SELECT h.id, 'Turma' as tipo
            FROM horarios_aulas h
            JOIN turma_detalhes td ON h.id_turma_detalhe = td.id
            WHERE td.id_turma = ?
            AND ? < h.fim AND ? > h.inicio
        `, [
            id_sala, inicio, fim,
            id_formador, inicio, fim,
            id_turma, inicio, fim
        ]);

        if (conflicts.length > 0) {
            const types = [...new Set(conflicts.map(c => c.tipo))].join(', ');
            return res.status(409).json({ message: `Conflito de horário detetado: ${types} já ocupado(a) neste intervalo.` });
        }

        await db.query('INSERT INTO horarios_aulas (id_turma_detalhe, inicio, fim) VALUES (?, ?, ?)', [id_turma_detalhe, inicio, fim]);

        return res.status(201).json({ message: 'Aula agendada com sucesso' });

    } catch (error) {
        console.error('Erro ao agendar aula:', error);
        return res.status(500).json({ message: 'Erro ao agendar aula' });
    }
};

// Remover aula
export const deleteLesson = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM horarios_aulas WHERE id = ?', [id]);
        return res.json({ message: 'Aula removida' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao remover aula' });
    }
};
// Listar horários de um Formador
export const getFormadorSchedule = async (req, res) => {
    try {
        const { userId } = req.params;
        const [aulas] = await db.query(`
            SELECT 
                h.id, h.inicio, h.fim, m.nome_modulo,
                t.codigo_turma, s.nome_sala
            FROM horarios_aulas h
            JOIN turma_detalhes td ON h.id_turma_detalhe = td.id
            JOIN modulos m ON td.id_modulo = m.id
            JOIN turmas t ON td.id_turma = t.id
            JOIN formadores f ON td.id_formador = f.id
            JOIN salas s ON td.id_sala = s.id
            WHERE f.utilizador_id = ?
            ORDER BY h.inicio ASC
        `, [userId]);
        return res.json(aulas);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao carregar horário do formador' });
    }
};

// Listar ocupação de uma Sala
export const getRoomSchedule = async (req, res) => {
    try {
        const { roomId } = req.params;
        const [aulas] = await db.query(`
            SELECT 
                h.id, h.inicio, h.fim, m.nome_modulo,
                t.codigo_turma, u.nome_completo as nome_formador
            FROM horarios_aulas h
            JOIN turma_detalhes td ON h.id_turma_detalhe = td.id
            JOIN modulos m ON td.id_modulo = m.id
            JOIN turmas t ON td.id_turma = t.id
            JOIN formadores f ON td.id_formador = f.id
            JOIN utilizadores u ON f.utilizador_id = u.id
            WHERE td.id_sala = ?
            ORDER BY h.inicio ASC
        `, [roomId]);
        return res.json(aulas);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao carregar ocupação da sala' });
    }
};
// Listar TODOS os horários (Global)
export const listAllLessons = async (req, res) => {
    try {
        const [aulas] = await db.query(`
            SELECT 
                h.id, 
                h.inicio, 
                h.fim, 
                m.nome_modulo,
                u.nome_completo as nome_formador,
                s.nome_sala,
                t.codigo_turma
            FROM horarios_aulas h
            JOIN turma_detalhes td ON h.id_turma_detalhe = td.id
            JOIN modulos m ON td.id_modulo = m.id
            JOIN turmas t ON td.id_turma = t.id
            JOIN formadores f ON td.id_formador = f.id
            JOIN utilizadores u ON f.utilizador_id = u.id
            JOIN salas s ON td.id_sala = s.id
            ORDER BY h.inicio ASC
        `);
        return res.json(aulas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao carregar todos os horários' });
    }
};
