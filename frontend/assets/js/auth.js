// auth.js

async function handleLoginSuccess(response) {
    console.log('Dados do usuário:', response); // Para debug
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
}

const AuthService = {
    API_URL: `${CONFIG.API_URL}/auth`,

    async login(login, senha) {
        try {
            const response = await fetch(`${this.API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({login, senha})
            });

            if (!response.ok) {
                throw new Error('Credenciais inválidas');
            }

            const data = await response.json();
            this.setAuthData(data);
            return data;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    },

    setAuthData(data) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    },

    clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getToken() {
        return localStorage.getItem('token');
    },

    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },


    async logout() {
        try {
            await fetch(`${this.API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
        } catch (error) {
            console.error('Erro no logout:', error);
        } finally {
            this.clearAuthData();
            window.location.href = './login.html';
        }
    },

    isAuthenticated() {
        return !!this.getToken();
    }
};

window.AuthService = AuthService;

const API_BASE_URL_BIBLIA_DIGITAL = 'https://www.abibliadigital.com.br/api';
const BIBLIA_DIGITAL_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHIiOiJUaHUgTWFyIDA2IDIwMjUgMDI6MDQ6NDkgR01UKzAwMDAuYmxvZ3NydG9AZ21haWwuY29tIiwiaWF0IjoxNzQxMjI2Njg5fQ.6eeiNxai_syPf1Xfh3jJwBDfSnjtLbv8GAKcRBeR5lM';

async function fetchFromBibleAPI(endpoint) {
    const url = `${API_BASE_URL_BIBLIA_DIGITAL}${endpoint}`;
    const headers = { 'Authorization': `Bearer ${BIBLIA_DIGITAL_API_TOKEN}` };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API da Bíblia falhou (${response.status}): ${errorText}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Erro ao buscar da API da Bíblia (${url}):`, error);
        throw error; // Re-lança o erro para o chamador tratar
    }
}

// Busca a lista de versões da Bíblia
function getBibleVersions() {
    return fetchFromBibleAPI('/versions');
}

// Busca a lista de livros da Bíblia
function getBibleBooks() {
    return fetchFromBibleAPI('/books');
}

// Busca um capítulo inteiro
async function fetchChapterFromBibleDigital(versionAbbrev, bookAbbrev, chapter) {
    return fetchFromBibleAPI(`/verses/${versionAbbrev}/${bookAbbrev}/${chapter}`);
}