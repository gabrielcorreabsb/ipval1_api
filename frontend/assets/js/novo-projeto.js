document.addEventListener('DOMContentLoaded', function() {
    if (!AuthService.checkAuthentication()) return;

    const userInfo = AuthService.getUserInfo();
    if (userInfo) {
        document.getElementById('userName').textContent = userInfo.nome;
    }
});

async function handleSubmit(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const link = document.getElementById('link').value;

    try {
        const response = await fetch(`${AuthService.API_URL}/projetos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AuthService.getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, link })
        });

        if (!response.ok) {
            throw new Error('Erro ao criar projeto');
        }

        window.location.href = '/home.html';
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao criar projeto', 'error');
    }
}

function mostrarMensagem(texto, tipo) {
    const div = document.createElement('div');
    div.className = `message ${tipo}`;
    div.textContent = texto;
    document.body.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}