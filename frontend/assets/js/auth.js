// auth.js
const AuthService = {
    API_URL: 'https://localhost:8080/api/auth',  // Ajustado para incluir /auth

    async login(login, senha) {
        console.log('Iniciando tentativa de login...');
        console.log('URL de login:', `${CONFIG.API_URL}/auth/login`);  // Debug da URL

        try {
            const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ login, senha })
            });

            console.log('Status da resposta:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('Login bem-sucedido');

            if (data.token) {
                this.setAuthData(data);
                return data;
            } else {
                throw new Error('Token não recebido');
            }
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

    isAuthenticated() {
        return !!localStorage.getItem('token');
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
            const token = this.getToken();
            if (token) {
                await fetch(`${CONFIG.API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Erro no logout:', error);
        } finally {
            this.clearAuthData();
            window.location.href = '/login.html';
        }
    }
};
const getToken = () => {
    return localStorage.getItem('token');
};

const isAuthenticated = () => {
    const token = getToken();
    return !!token;
};

const logout = () => {
    localStorage.removeItem('token');
    window.location.replace('./login.html');
};
// Exportar para uso global
window.AuthService = AuthService;