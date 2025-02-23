// auth.js
const API_URL = 'http://localhost:8080/api';

async function login(login, senha) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'  // Adicionado para garantir resposta JSON
            },
            body: JSON.stringify({
                login: login,
                senha: senha
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro no login');
        }

        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data;
        } else {
            throw new Error('Token não recebido');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        throw error;
    }
}

function logout() {
    const token = localStorage.getItem('token');

    return fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).finally(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('./login.html');
    });
}

// Função para verificar se o usuário está autenticado
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}