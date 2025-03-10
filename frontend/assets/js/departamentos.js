document.addEventListener('DOMContentLoaded', () => {
    const departamentos = [
        {
            nome: "UPH",
            icone: "fas fa-users",
            descricao: "União Presbiteriana de Homens",
            atividades: [
                "Estudos Bíblicos",
                "Reuniões de Oração",
                "Ações Sociais"
            ],
            lideranca: "Presb. Dartalian",
            gerarAta: true // Indica que este departamento tem botão de gerar ata
        },
        {
            nome: "SAF",
            icone: "fas fa-heart",
            descricao: "Sociedade Auxiliadora Feminina",
            atividades: [
                "Reuniões de Oração",
                "Trabalhos Manuais",
                "Visitas"
            ],
            lideranca: "Maria Silva",
            gerarAta: true // Indica que este departamento tem botão de gerar ata
        },
        {
            nome: "UMP",
            icone: "fas fa-fire",
            descricao: "União de Mocidade Presbiteriana",
            atividades: [
                "Estudos Bíblicos",
                "Atividades Recreativas",
                "Momentos de Comunhão"
            ],
            lideranca: "Pr. Lucas Souza"
        },
        {
            nome: "UPA",
            icone: "fas fa-star",
            descricao: "União Presbiteriana de Adolescentes",
            atividades: [
                "Estudos Bíblicos",
                "Atividades Recreativas",
                "Momentos de Comunhão"
            ],
            lideranca: "Pr. Lucas Souza"
        },
        {
            nome: "Departamento Infantil",
            icone: "fas fa-child",
            descricao: "Ministério com Crianças",
            atividades: [
                "Escola Dominical Infantil",
                "Culto Infantil",
                "Atividades Especiais"
            ],
            lideranca: "A colocar"
        },
    ];

    function abrirFormularioAta(departamento) {
        Swal.fire({
            title: `Gerar Ata - ${departamento}`,
            html: `
                <form id="ataForm" class="ata-form">
                    <div class="form-group">
                        <label for="numeroAta">Número da Ata:</label>
                        <input type="number" id="numeroAta" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="dataReuniao">Data e Hora da Reunião:</label>
                        <input type="datetime-local" id="dataReuniao" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="objetivo">Objetivo:</label>
                        <input type="text" id="objetivo" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="localReuniao">Local da Reunião:</label>
                        <input type="text" id="localReuniao" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="enderecoLocalReuniao">Endereço:</label>
                        <input type="text" id="enderecoLocalReuniao" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="presidente">Presidente:</label>
                        <input type="text" id="presidente" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="vicePresidente">Vice-Presidente:</label>
                        <input type="text" id="vicePresidente" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="primeiroSecretario">1º Secretário:</label>
                        <input type="text" id="primeiroSecretario" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="segundoSecretario">2º Secretário:</label>
                        <input type="text" id="segundoSecretario" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="tesoureiro">Tesoureiro:</label>
                        <input type="text" id="tesoureiro" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="conselheiro">Conselheiro:</label>
                        <input type="text" id="conselheiro" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="outrosMembros">Outros Membros (um por linha):</label>
                        <textarea id="outrosMembros" class="swal2-textarea" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="textoDevocional">Texto Devocional:</label>
                        <input type="text" id="textoDevocional" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="responsavelExposicao">Responsável pela Exposição:</label>
                        <input type="text" id="responsavelExposicao" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="responsavelOracao">Responsável pela Oração:</label>
                        <input type="text" id="responsavelOracao" class="swal2-input" required>
                    </div>
                    <div class="form-group">
                        <label for="pautaDiscussao">Pauta de Discussão:</label>
                        <textarea id="pautaDiscussao" class="swal2-textarea" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="horarioTermino">Horário de Término:</label>
                        <input type="text" id="horarioTermino" class="swal2-input" placeholder="HH:MM" required>
                    </div>
                </form>
            `,
            showCancelButton: true,
            confirmButtonText: 'Gerar Ata',
            cancelButtonText: 'Cancelar',
            width: '800px',
            didOpen: () => {
                // Carregar dados salvos
                carregarDadosSalvos();

                // Adicionar máscara de hora
                const horarioTermino = document.getElementById('horarioTermino');
                if (horarioTermino) {
                    horarioTermino.addEventListener('input', function () {
                        formatarHora(this);
                    });
                }
            },
            preConfirm: () => {
                const form = document.getElementById('ataForm');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return false;
                }
                return true;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                gerarAta();
            }
        });
    }

    function renderDepartamentos() {
        const grid = document.getElementById('departamentosGrid');

        departamentos.forEach(dep => {
            const card = document.createElement('div');
            card.className = 'departamento-card';

            // Criar o botão de ata se o departamento tiver a propriedade gerarAta
            const botaoAta = dep.gerarAta ? `
                <button class="gerar-ata-btn" onclick="abrirFormularioAta('${dep.nome}')">
                    <i class="fas fa-file-alt"></i> Gerar Ata
                </button>
            ` : '';

            card.innerHTML = `
                <div class="departamento-header">
                    <i class="${dep.icone}"></i>
                    <h3>${dep.nome}</h3>
                </div>
                <div class="departamento-content">
                    <p>${dep.descricao}</p>
                    <p class="lideranca"><i class="fas fa-user"></i> ${dep.lideranca}</p>
                    <div class="atividades">
                        <h4>Atividades:</h4>
                        <ul>
                            ${dep.atividades.map(a => `<li>${a}</li>`).join('')}
                        </ul>
                    </div>
                    ${botaoAta}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Expor a função para o escopo global
    window.abrirFormularioAta = abrirFormularioAta;

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

