const loginForm = document.querySelector("#loginForm");
const loginInput = document.querySelector("#login");
const senhaInput = document.querySelector("#senha");
const errorMessage = document.querySelector("#errorMessage");
const successMessage = document.querySelector("#successMessage");

async function handleLogin(event) {
    event.preventDefault();

    try {
        if (!loginInput.value.trim() || !senhaInput.value.trim()) {
            showError('Por favor, preencha todos os campos.');
            return;
        }

        // Usar o AuthService para fazer login
        await AuthService.login(loginInput.value.trim(), senhaInput.value.trim());
        window.location.replace('/home.html'); // ou '/home' dependendo da sua configuração
    } catch (error) {
        console.error('Erro durante o login:', error);
        showError('Credenciais inválidas. Tente novamente.');
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

function limpar() {
    loginInput.value = "";
    senhaInput.value = "";
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Verifica se já está autenticado ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    if (AuthService.isAuthenticated()) {
        window.location.replace('/home.html'); // ou '/home'
    }

    // Verifica se foi redirecionado do logout
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
        showSuccess('Você foi desconectado com sucesso.');
    }
});

// Remove o evento anterior e adiciona o novo
loginForm.removeEventListener('submit', handleLogin);
loginForm.addEventListener('submit', handleLogin);