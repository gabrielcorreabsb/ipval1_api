document.addEventListener('DOMContentLoaded', function() {
    if (!isAuthenticated()) {
        window.location.href = './login.html';
        return;
    }

    const user = getUser();
    if (user) {
        document.getElementById('userName').textContent = user.nome;
    }

    carregarProjetos();
});

async function carregarProjetos() {
    try {
        const response = await fetch(`${API_URL}/projetos`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar projetos');
        }

        const projetos = await response.json();
        exibirProjetos(projetos);
    } catch (error) {
        console.error('Erro:', error);
    }
}

function exibirProjetos(projetos) {
    const projectsList = document.querySelector('.projects-list');
    projectsList.innerHTML = '';

    if (projetos.length === 0) {
        projectsList.innerHTML = '<p class="no-projects">Nenhum projeto encontrado</p>';
        return;
    }

    projetos.forEach(projeto => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <h3>${projeto.nome}</h3>
            <a href="${projeto.link}" target="_blank" class="project-link">Acessar Projeto</a>
        `;
        projectsList.appendChild(card);
    });
}