class AuthService {
    static API_URL = 'http://localhost:8080/api';

    static async login(login, senha) {
        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ login, senha })
            });

            if (!response.ok) {
                throw new Error('Falha na autenticação');
            }

            const data = await response.json();
            this.setToken(data.token);
            this.setUserInfo(data.userDTO);
            return data;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    static async logout() {
        try {
            const response = await fetch(`${this.API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (!response.ok) {
                console.error('Erro ao fazer logout no servidor');
            }
        } catch (error) {
            console.error('Erro durante logout:', error);
        } finally {
            // Sempre limpa os dados locais, independente da resposta do servidor
            this.removeToken();
            this.removeUserInfo();
            window.location.href = '/login.html';
        }
    }

    static getToken() {
        return localStorage.getItem('jwt_token');
    }

    static setToken(token) {
        localStorage.setItem('jwt_token', token);
    }

    static removeToken() {
        localStorage.removeItem('jwt_token');
    }

    static setUserInfo(userInfo) {
        localStorage.setItem('user_info', JSON.stringify(userInfo));
    }

    static getUserInfo() {
        const userInfo = localStorage.getItem('user_info');
        return userInfo ? JSON.parse(userInfo) : null;
    }

    static removeUserInfo() {
        localStorage.removeItem('user_info');
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static checkAuthentication() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }
}