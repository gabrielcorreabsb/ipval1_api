// login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Redirecionar se já estiver autenticado
    if (AuthService.isAuthenticated()) {
        window.location.replace('/home.html');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';

        const loginInput = document.getElementById('login');
        const senhaInput = document.getElementById('senha');
        const submitButton = loginForm.querySelector('button[type="submit"]');

        // Validação dos campos
        if (!loginInput.value || !senhaInput.value) {
            showError('Por favor, preencha todos os campos');
            return;
        }

        try {
            // Feedback visual
            submitButton.disabled = true;
            submitButton.textContent = 'Entrando...';

            console.log('Tentando login com:', loginInput.value);  // Debug

            const response = await AuthService.login(loginInput.value, senhaInput.value);
            console.log('Resposta do login:', response);  // Debug

            window.location.replace('./home.html');
        } catch (error) {
            console.error('Erro completo:', error);  // Debug detalhado
            showError('Erro ao fazer login. Por favor, verifique suas credenciais.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});