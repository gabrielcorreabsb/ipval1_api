async function handleSubmit(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const link = document.getElementById('link').value.trim();
    const github = document.getElementById('github').value.trim();

    if (!nome || !link || !github) {
        mostrarMensagem('Por favor, preencha todos os campos', 'error');
        return;
    }

    try {
        const token = getToken();

        if (!token) {
            window.location.replace('./login.html');
            return;
        }

        const response = await fetch(`${API_URL}/projetos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome,
                link,
                github  // Adicionando o campo github ao JSON
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar projeto');
        }

        mostrarMensagem('Projeto criado com sucesso!', 'success');
        setTimeout(() => {
            window.location.replace('./home.html');
        }, 1500);
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem(error.message || 'Erro ao criar projeto', 'error');
    }
}

function mostrarMensagem(texto, tipo) {
    const mensagemDiv = document.createElement('div');
    mensagemDiv.className = `message ${tipo}`;
    mensagemDiv.textContent = texto;
    document.body.appendChild(mensagemDiv);

    setTimeout(() => {
        mensagemDiv.remove();
    }, 3000);
}

// Adicione esta função para validar URLs do GitHub
function validarUrlGithub(url) {
    return url.startsWith('https://github.com/');
}

// Adicione um evento para validar a URL do GitHub quando o usuário sair do campo
document.getElementById('github').addEventListener('blur', function(e) {
    const url = e.target.value.trim();
    if (url && !validarUrlGithub(url)) {
        mostrarMensagem('Por favor, insira uma URL válida do GitHub', 'error');
        e.target.focus();
    }
});