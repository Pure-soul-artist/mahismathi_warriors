import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const loginUser = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email); // OAuth2 requires username field
    formData.append('password', password);

    const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const signupUser = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/signup`, { email, password });
    return response.data;
};
