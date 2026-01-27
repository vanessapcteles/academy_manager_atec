import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const publicService = {
    getCourses: async () => {
        const response = await axios.get(`${API_URL}/api/courses`);
        return response.data;
    }
};
