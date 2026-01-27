import { API_URL, getAuthHeader } from './authService';

export const horarioService = {
    // Obter horários da turma
    getTurmaSchedule: async (turmaId) => {
        const response = await fetch(`${API_URL}/api/schedules/turma/${turmaId}`, { headers: getAuthHeader() });
        if (!response.ok) throw new Error('Erro ao carregar horários');
        return response.json();
    },

    // Criar aula (Agendar)
    createLesson: async (data) => {
        const response = await fetch(`${API_URL}/api/schedules`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Erro ao agendar aula');
        }
        return response.json();
    },

    // Remover aula
    deleteLesson: async (id) => {
        const response = await fetch(`${API_URL}/api/schedules/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        if (!response.ok) throw new Error('Erro ao remover aula');
        return response.json();
    },

    getFormadorSchedule: async (userId) => {
        const response = await fetch(`${API_URL}/api/schedules/formador/${userId}`, { headers: getAuthHeader() });
        if (!response.ok) throw new Error('Erro ao carregar horário do formador');
        return response.json();
    },

    getRoomSchedule: async (roomId) => {
        const response = await fetch(`${API_URL}/api/schedules/room/${roomId}`, { headers: getAuthHeader() });
        if (!response.ok) throw new Error('Erro ao carregar ocupação da sala');
        return response.json();
    },

    getAllSchedules: async () => {
        const response = await fetch(`${API_URL}/api/schedules/all`, { headers: getAuthHeader() });
        if (!response.ok) throw new Error('Erro ao carregar todos os horários');
        return response.json();
    }
};
