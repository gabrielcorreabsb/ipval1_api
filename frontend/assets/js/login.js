// login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (isAuthenticated()) {
        window.location.replace('./home.html');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const loginInput = document.getElementById('login');
        const senhaInput = document.getElementById('senha');

        try {
            const response = await login(loginInput.value, senhaInput.value);
            console.log('Login bem-sucedido:', response);
            window.location.replace('./home.html');
        } catch (error) {
            console.error('Erro no login:', error);
            errorMessage.textContent = 'Credenciais inválidas';
            errorMessage.style.display = 'block';
        }
    });
});