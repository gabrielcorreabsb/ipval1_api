document.addEventListener('DOMContentLoaded', () => {
    const departamentos = [
        {
            nome: "UPH",
            icone: "fas fa-users",
            descricao: "União Presbiteriana de Homens",
            horario: "Sábados, 19h",
            atividades: [
                "Estudos Bíblicos",
                "Reuniões de Oração",
                "Ações Sociais"
            ],
            lideranca: "Presb. José Santos"
        },
        {
            nome: "SAF",
            icone: "fas fa-heart",
            descricao: "Sociedade Auxiliadora Feminina",
            horario: "Quartas, 19h30",
            atividades: [
                "Reuniões de Oração",
                "Trabalhos Manuais",
                "Visitas"
            ],
            lideranca: "Maria Silva"
        },
        {
            nome: "UMP",
            icone: "fas fa-fire",
            descricao: "União de Mocidade Presbiteriana",
            horario: "Sábados, 19h30",
            atividades: [
                "Estudos Bíblicos",
                "Louvor",
                "Comunhão"
            ],
            lideranca: "João Pedro"
        },
        {
            nome: "UPA",
            icone: "fas fa-star",
            descricao: "União Presbiteriana de Adolescentes",
            horario: "Sábados, 16h",
            atividades: [
                "Estudos Bíblicos",
                "Atividades Recreativas",
                "Momentos de Comunhão"
            ],
            lideranca: "Ana Clara"
        },
        {
            nome: "Departamento Infantil",
            icone: "fas fa-child",
            descricao: "Ministério com Crianças",
            horario: "Domingos, 9h",
            atividades: [
                "Escola Dominical Infantil",
                "Culto Infantil",
                "Atividades Especiais"
            ],
            lideranca: "Profa. Maria Eduarda"
        },
        {
            nome: "Coral",
            icone: "fas fa-music",
            descricao: "Ministério de Música",
            horario: "Quartas, 20h",
            atividades: [
                "Ensaios",
                "Participação nos Cultos",
                "Apresentações Especiais"
            ],
            lideranca: "Maestro Carlos"
        }
    ];

    function renderDepartamentos() {
        const grid = document.getElementById('departamentosGrid');

        departamentos.forEach(dep => {
            const card = document.createElement('div');
            card.className = 'departamento-card';
            card.innerHTML = `
                <div class="departamento-header">
                    <i class="${dep.icone}"></i>
                    <h3>${dep.nome}</h3>
                </div>
                <div class="departamento-content">
                    <p>${dep.descricao}</p>
                    <p class="horario"><i class="fas fa-clock"></i> ${dep.horario}</p>
                    <p class="lideranca"><i class="fas fa-user"></i> ${dep.lideranca}</p>
                    <div class="atividades">
                        <h4>Atividades:</h4>
                        <ul>
                            ${dep.atividades.map(a => `<li>${a}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderDepartamentos();
});

// Função para atualizar o conteúdo do footer
function atualizarFooter(config) {
    // Atualizar informações da igreja
    const footerInfo = document.querySelector('.footer-info');
    if (footerInfo) {
        footerInfo.innerHTML = `
            <h3>${config.nomeSite || 'Igreja Presbiteriana do Valparaíso 1'}</h3>
            <p>Nosso endereço:</p>
           <p>${config.endereco || 'Endereço não disponível'}</p>
           <br> 
            <p>Nossa programação:</p>

            <p>${config.horarioCultos || 'Horário não disponível'}</p>
        `;
    }

    // Atualizar links sociais
    const socialLinks = document.querySelector('.social-links');
    if (socialLinks) {
        socialLinks.innerHTML = `
            ${config.facebookUrl ? `<a href="${config.facebookUrl}" target="_blank"><i class="fab fa-facebook"></i></a>` : ''}
            ${config.instagramUrl ? `<a href="${config.instagramUrl}" target="_blank"><i class="fab fa-instagram"></i></a>` : ''}
            ${config.youtubeUrl ? `<a href="${config.youtubeUrl}" target="_blank"><i class="fab fa-youtube"></i></a>` : ''}
        `;
    }

    // Atualizar informações de contato
    const footerContact = document.querySelector('.footer-contact');
    if (footerContact) {
        footerContact.innerHTML = `
            <h3>Contato</h3>
            ${config.telefone ? `<p>Tel: ${config.telefone}</p>` : ''}
            ${config.whatsapp ? `<p>WhatsApp: ${config.whatsapp}</p>` : ''}
            ${config.email ? `<p>Email: ${config.email}</p>` : ''}
        `;
    }
}

// Função para carregar as configurações do footer
async function carregarConfiguracoesFooter() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/configuracoes`);
        if (!response.ok) {
            throw new Error('Erro ao carregar configurações');
        }

        const config = await response.json();
        atualizarFooter(config);
    } catch (error) {
        console.error('Erro ao carregar configurações do footer:', error);
    }
}

// Carregar configurações quando a página carregar
document.addEventListener('DOMContentLoaded', carregarConfiguracoesFooter);

