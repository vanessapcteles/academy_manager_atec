const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const authService = {
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: window.JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao fazer login');
            }

            // Guardar token se houver
            if (data.token) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user', window.JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: window.JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao registar');
            }

            return data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};
