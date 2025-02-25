// Variável global para armazenar os projetos
let projetos = [];

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('./login.html');
        return;
    }
});
document.addEventListener('DOMContentLoaded', function() {
    // Carrega os projetos imediatamente
    carregarProjetos();

    // Tenta carregar as informações do usuário se estiver logado
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            document.getElementById('userName').textContent = user.nome;
        }
    } catch (error) {
        console.log('Usuário não está logado');
        document.getElementById('userName').textContent = 'Visitante';
    }
});

async function carregarProjetos() {
    try {
        console.log('Iniciando carregamento de projetos...');

        // URL correta para os projetos
        const response = await fetch(`${CONFIG.API_URL}/projetos`);
        console.log('Status da resposta:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta de erro:', errorText);
            throw new Error(`Erro ao carregar projetos: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);

        projetos = data;
        exibirProjetos(projetos);
    } catch (error) {
        console.error('Erro detalhado:', error);
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
        const card = document.createElement('div');
        card.className = 'project-card';

        const linkHtml = projeto.link
            ? `<a href="${projeto.link}" target="_blank" class="project-link" title="Acessar Projeto">
                 <i class="fas fa-external-link-alt"></i>
               </a>`
            : '';

        const githubHtml = projeto.github
            ? `<a href="${projeto.github}" target="_blank" class="project-github" title="Acessar GitHub">
                 <i class="fab fa-github"></i>
               </a>`
            : '';

        card.innerHTML = `
            <div class="project-header">
                <h3>${projeto.nome}</h3>
                <div class="project-links">
                    ${linkHtml}
                    ${githubHtml}
                </div>
            </div>
            <div class="project-actions">
                <button onclick="editarProjeto(${projeto.id})" class="btn-edit" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deletarProjeto(${projeto.id})" class="btn-delete" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        projectsList.appendChild(card);
    });
}

async function deletarProjeto(id) {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            mostrarMensagem('Você precisa estar logado para excluir projetos', 'error');
            return;
        }

        const response = await fetch(`${CONFIG.API_URL}/projetos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao deletar projeto');
        }

        mostrarMensagem('Projeto excluído com sucesso', 'success');
        await carregarProjetos();
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao excluir projeto', 'error');
    }
}

async function editarProjeto(id) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            mostrarMensagem('Você precisa estar logado para editar projetos', 'error');
            return;
        }

        const projeto = projetos.find(p => p.id === id);
        if (!projeto) {
            throw new Error('Projeto não encontrado');
        }

        const { value: formValues } = await Swal.fire({
            title: 'Editar Projeto',
            html:
                `<input id="swal-nome" class="swal2-input" value="${projeto.nome}" placeholder="Nome">
                 <input id="swal-link" class="swal2-input" value="${projeto.link || ''}" placeholder="Link">
                 <input id="swal-github" class="swal2-input" value="${projeto.github || ''}" placeholder="GitHub">`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return {
                    nome: document.getElementById('swal-nome').value,
                    link: document.getElementById('swal-link').value,
                    github: document.getElementById('swal-github').value
                }
            }
        });

        if (formValues) {
            const response = await fetch(`${CONFIG.API_URL}/projetos/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formValues)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar projeto');
            }

            mostrarMensagem('Projeto atualizado com sucesso', 'success');
            await carregarProjetos();
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao atualizar projeto', 'error');
    }
}

function mostrarMensagem(texto, tipo) {
    const message = document.createElement('div');
    message.className = `message ${tipo}`;
    message.textContent = texto;
    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 3000);
}