document.addEventListener('DOMContentLoaded', function() {
    if (!AuthService.checkAuthentication()) return;

    // Exibe o nome do usuário
    const userInfo = AuthService.getUserInfo();
    if (userInfo) {
        document.getElementById('userName').textContent = userInfo.nome;
    }

    carregarProjetos();
});

async function carregarProjetos() {
    try {
        const response = await fetch(`${AuthService.API_URL}/projetos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AuthService.getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                AuthService.logout();
                return;
            }
            throw new Error('Erro ao carregar projetos');
        }

        const projetos = await response.json();
        exibirProjetos(projetos);
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar projetos', 'error');
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
        const data = new Date(projeto.dataCriacao).toLocaleString('pt-BR');
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <h3>${projeto.nome}</h3>
            <a href="${projeto.link}" class="project-link" target="_blank">Acessar Projeto</a>
            <div class="project-actions">
                <small>${data}</small>
                <button onclick="excluirProjeto(${projeto.id})" class="btn-delete">Excluir</button>
            </div>
        `;
        projectsList.appendChild(card);
    });
}

async function excluirProjeto(id) {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) {
        return;
    }

    try {
        const response = await fetch(`${AuthService.API_URL}/projetos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${AuthService.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir projeto');
        }

        carregarProjetos();
        mostrarMensagem('Projeto excluído com sucesso', 'success');
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao excluir projeto', 'error');
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