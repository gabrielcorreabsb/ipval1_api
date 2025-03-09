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