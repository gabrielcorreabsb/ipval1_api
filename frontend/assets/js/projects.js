// assets/js/projects.js
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('projectsModal');
    const showProjectsBtn = document.getElementById('showProjects');
    const closeBtn = document.getElementsByClassName('close')[0];
    const projectsList = document.getElementById('projectsList');

    async function fetchProjects() {
        try {
            const response = await fetch('http://localhost:8080/api/projetos', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar projetos');
            }

            const projects = await response.json();
            return projects;
        } catch (error) {
            console.error('Erro:', error);
            return [];
        }
    }

    async function exibirProjetos() {
        if (!projectsList) {
            console.error('Elemento projectsList não encontrado');
            return;
        }

        projectsList.innerHTML = '<div class="loading">Carregando projetos...</div>';

        try {
            const projetos = await fetchProjects();

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
                `;
                projectsList.appendChild(card);
            });
        } catch (error) {
            console.error('Erro ao criar cards:', error);
            projectsList.innerHTML = '<div class="error">Erro ao carregar projetos</div>';
        }
    }

    // Event Listeners
    showProjectsBtn.onclick = function(e) {
        e.preventDefault();
        modal.style.display = "block";
        exibirProjetos();
    }

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});