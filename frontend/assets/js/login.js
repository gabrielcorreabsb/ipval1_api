const loginForm = document.querySelector("#loginForm");
const loginInput = document.querySelector("#login");
const senhaInput = document.querySelector("#senha");

async function handleLogin() {
    try {
        if (!loginInput.value.trim() || !senhaInput.value.trim()) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const credentials = {
            login: loginInput.value.trim(),
            senha: senhaInput.value.trim()
        };

        const response = await fetch('/usuario/verificar', {  // Removido o http://localhost:8080
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',  // Importante para cookies de sessão
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            sessionStorage.setItem('userSession', JSON.stringify({
                id: data.id,
                username: data.login,
                nome: data.nome,
                loginTime: new Date().toLocaleString()
            }));
            window.location.href = "/home";
        } else {
            alert(data.message || 'Credenciais inválidas. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro durante o login:', error);
        alert('Erro ao fazer login. Por favor, tente novamente.');
    }
}

function limpar() {
    loginInput.value = "";
    senhaInput.value = "";
}

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    handleLogin();
});