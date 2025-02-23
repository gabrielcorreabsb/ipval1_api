async function handleSubmit(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const link = document.getElementById('link').value.trim();

    if (!nome || !link) {
        mostrarMensagem('Por favor, preencha todos os campos', 'error');
        return;
    }

    try {
        const token = getToken(); // Pega o token usando a função do auth.js

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
            body: JSON.stringify({ nome, link })
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