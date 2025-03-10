// Funções de utilidade
async function fazerRequisicao(url, options = {}) {
    try {
        // Se for uma requisição GET, não precisa de token
        if (!options.method || options.method === 'GET') {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            return response;
        }

        // Para outros métodos (POST, PUT, DELETE)
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }

        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const mergedOptions = {
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };

        const response = await fetch(url, mergedOptions);

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.replace('./login.html');
            return null;
        }

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}


        function mostrarMensagem(mensagem, tipo) {
            // Se você estiver usando SweetAlert2
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    text: mensagem,
                    icon: tipo,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            } else {
                // Fallback para alert normal
                alert(mensagem);
            }
        }

// Função para carregar dados da igreja
        async function carregarDadosIgreja() {
            try {
                const response = await fazerRequisicao(`${CONFIG.API_URL}/configuracoes`);
                const config = await response.json();

                // Preencher horários dos cultos
                const horariosCultosElement = document.getElementById('horariosCultos');
                if (config.horarioCultos) {
                    const horarios = config.horarioCultos.split('\n');
                    horariosCultosElement.innerHTML = horarios.map(horario => `
                <div class="programacao-item">
                    <span>${horario}</span>
                </div>
            `).join('');
                }

                // Preencher endereço
                const enderecoElement = document.getElementById('enderecoIgreja');
                if (config.endereco) {
                    enderecoElement.innerHTML = `
                <p><i class="fas fa-map-marker-alt"></i> ${config.endereco}</p>
            `;
                }

                // Preencher informações de contato
                const contatoElement = document.getElementById('contatoInfo');
                contatoElement.innerHTML = `
            ${config.telefone ? `
                <div class="contato-item">
                    <i class="fas fa-phone"></i>
                    <span>${config.telefone}</span>
                </div>
            ` : ''}
            ${config.whatsapp ? `
                <div class="contato-item">
                    <i class="fab fa-whatsapp"></i>
                    <span>${config.whatsapp}</span>
                </div>
            ` : ''}
            ${config.email ? `
                <div class="contato-item">
                    <i class="fas fa-envelope"></i>
                    <span>${config.email}</span>
                </div>
            ` : ''}
        `;

            } catch (error) {
                console.error('Erro ao carregar dados da igreja:', error);
                mostrarMensagem('Erro ao carregar informações da igreja', 'error');
            }
        }

// Função para verificar se o usuário está logado
        function getUsuarioLogado() {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    console.warn('Nenhum usuário encontrado no localStorage');
                    return null;
                }

                const user = JSON.parse(userStr);
                console.log('Usuário recuperado:', user);

                if (!user.idUsuario) {
                    console.warn('Usuário sem idUsuario:', user);
                }

                return user;
            } catch (error) {
                console.error('Erro ao recuperar usuário:', error);
                return null;
            }
        }

// Função para verificar se é pastor
        function isPastor() {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                return user && user.cargo === 'PASTOR';
            } catch (error) {
                console.error('Erro ao verificar cargo:', error);
                return false;
            }
        }

// Inicialização quando a página carregar
        document.addEventListener('DOMContentLoaded', () => {
            carregarDadosIgreja();

            // Configurar botão de logout se existir
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    try {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.replace('./login.html');
                    } catch (error) {
                        console.error('Erro ao fazer logout:', error);
                        mostrarMensagem('Erro ao fazer logout', 'error');
                    }
                });
            }
        });

// Adicione esta função junto com as outras funções de carregamento
        async function carregarSobreNos() {
            try {
                const response = await fazerRequisicao(`${CONFIG.API_URL}/configuracoes`);
                const config = await response.json();

                const sobreIgrejaElement = document.getElementById('sobreIgrejaContent');
                if (config.sobreIgreja) {
                    // Dividir o texto em parágrafos e criar elementos HTML
                    const paragrafos = config.sobreIgreja.split('\n').filter(p => p.trim());
                    sobreIgrejaElement.innerHTML = paragrafos
                        .map(paragrafo => `<p>${paragrafo}</p>`)
                        .join('');
                }
            } catch (error) {
                console.error('Erro ao carregar informações sobre a igreja:', error);
                mostrarMensagem('Erro ao carregar informações sobre a igreja', 'error');
            }
        }

// Adicione a chamada da função no DOMContentLoaded
        document.addEventListener('DOMContentLoaded', () => {
            carregarDadosIgreja();
            carregarSobreNos(); // Adicione esta linha
        });

// Funções para mostrar os modais com SweetAlert2

        function mostrarIgrejaReformada() {
            Swal.fire({
                title: 'A Fé Reformada',
                html: `
            <div class="swal-content">
                <h3 class="swal-subtitle">O que é a Fé Reformada?</h3>
                <p>A Fé Reformada representa a verdadeira religião cristã, recuperada durante a Reforma Protestante dos séculos XVI e XVII. É um relacionamento com Deus, através da mediação de Jesus Cristo, baseado no Evangelho revelado nas Escrituras Sagradas.</p>
                
                <h3 class="swal-subtitle">Fundamentos Compartilhados</h3>
                <p>Compartilhamos com todas as igrejas cristãs históricas as doutrinas fundamentais:</p>
                <ul class="swal-list">
                    <li>A Santíssima Trindade</li>
                    <li>A expiação de Cristo</li>
                    <li>A justificação pela fé</li>
                    <li>O nascimento virginal de Jesus</li>
                    <li>A ressurreição corpórea de Cristo</li>
                    <li>Os milagres do Senhor</li>
                    <li>A inspiração das Escrituras Sagradas</li>
                </ul>

                <h3 class="swal-subtitle">Nossa Identidade</h3>
                <p>Como Igreja Presbiteriana, somos:</p>
                <ul class="swal-list-featured">
                    <li><strong>Reformados em Doutrina:</strong> Seguimos fielmente os princípios da Reforma Protestante</li>
                    <li><strong>Presbiterianos em Governo:</strong> Nossa estrutura é baseada no governo de presbíteros</li>
                    <li><strong>Bíblicos em Fundamento:</strong> A Palavra de Deus é nossa única regra de fé e prática</li>
                </ul>

                <h3 class="swal-subtitle">Distintivos da Fé Reformada</h3>
                <p>Nossa fé se caracteriza por enfatizar:</p>
                <ul class="swal-list">
                    <li>A Soberania de Deus em todas as coisas</li>
                    <li>A Graça Irresistível de Cristo</li>
                    <li>A Autoridade das Escrituras</li>
                    <li>A Salvação pela Graça mediante a Fé</li>
                </ul>
            </div>
        `,
                icon: 'info',
                confirmButtonText: 'Entendi',
                confirmButtonColor: '#4A8B4A',
                width: '800px', // Aumentei a largura para melhor leitura
                showCloseButton: true,
                customClass: {
                    container: 'swal-church-container',
                    popup: 'swal-church-popup',
                    content: 'swal-church-content'
                }
            });
        }


        function mostrarDoutrina() {
            Swal.fire({
                title: 'Nossa Doutrina',
                html: `
            <div class="swal-content">
                <h3 class="swal-subtitle">Símbolos de Fé</h3>
                <p>A Igreja Presbiteriana do Brasil fundamenta sua doutrina em três documentos históricos conhecidos como Símbolos de Fé de Westminster, elaborados entre 1643 e 1649. Estes documentos apresentam de forma sistemática as doutrinas fundamentais das Escrituras Sagradas.</p>

                <div class="swal-document-section">
                    <h4 class="swal-document-title">
                        <i class="fas fa-book-bible"></i>
                        Confissão de Fé de Westminster
                    </h4>
                    <p>Documento principal que expõe de forma sistemática as doutrinas fundamentais da fé reformada em 33 capítulos.</p>
                    <a href="../assets/docs/A_Confissao_de_Fe_de_Westminster.pdf" class="swal-download-btn" target="_blank">
                        <i class="fas fa-file-pdf"></i> Download da Confissão de Fé
                    </a>
                </div>

                <div class="swal-document-section">
                    <h4 class="swal-document-title">
                        <i class="fas fa-scroll"></i>
                        Catecismo Maior de Westminster
                    </h4>
                    <p>Exposição detalhada da doutrina cristã em formato de perguntas e respostas, destinada ao aprofundamento teológico.</p>
                    <a href="../assets/docs/Catecismo_Maior_de_Westminster.pdf" class="swal-download-btn" target="_blank">
                        <i class="fas fa-file-pdf"></i> Download do Catecismo Maior
                    </a>
                </div>

                <div class="swal-document-section">
                    <h4 class="swal-document-title">
                        <i class="fas fa-book"></i>
                        Breve Catecismo de Westminster
                    </h4>
                    <p>Versão concisa e acessível das doutrinas essenciais, ideal para instrução básica na fé reformada.</p>
                    <a href="../assets/docs/Breve_Catecismo_de_Westminster.pdf" class="swal-download-btn" target="_blank">
                        <i class="fas fa-file-pdf"></i> Download do Breve Catecismo
                    </a>
                </div>

                <div class="swal-info-box">
                    <i class="fas fa-info-circle"></i>
                    <p>Estes documentos históricos têm guiado a Igreja Presbiteriana por séculos, oferecendo uma compreensão profunda e sistemática das verdades bíblicas.</p>
                </div>
            </div>
        `,
                icon: 'info',
                confirmButtonText: 'Fechar',
                confirmButtonColor: '#4A8B4A',
                width: '800px',
                showCloseButton: true,
                customClass: {
                    container: 'swal-doctrine-container',
                    popup: 'swal-doctrine-popup',
                    content: 'swal-doctrine-content'
                }
            });
        }

// Função principal para carregar notícias aprovadas
        async function carregarNoticias() {
            try {
                const response = await fetch(`${CONFIG.API_URL}/noticias/aprovadas`);
                if (!response.ok) {
                    throw new Error('Erro ao carregar notícias');
                }

                const noticias = await response.json();
                exibirNoticias(noticias);
            } catch (error) {
                console.error('Erro ao carregar notícias:', error);
                mostrarErroNoticias();
            }
        }

// Função para exibir notícias
        function exibirNoticias(noticias) {
            const grid = document.getElementById('newsGrid');
            if (!grid) return;

            if (!noticias || noticias.length === 0) {
                grid.innerHTML = `
            <div class="no-news">
                <i class="fas fa-newspaper"></i>
                <p>Nenhuma notícia disponível no momento</p>
            </div>
        `;
                return;
            }

            grid.innerHTML = noticias.map((noticia, index) => criarCardNoticia(noticia, index)).join('');
        }

// Função para criar card da notícia
        function criarCardNoticia(noticia, index) {
            const data = new Date(noticia.dataCriacao);
            const dia = data.getDate();
            const mes = data.toLocaleString('pt-BR', {month: 'short'}).replace('.', '');
            const ano = data.getFullYear();

            return `
        <article class="news-card" style="animation-delay: ${index * 0.1}s; background-image: url('${noticia.imagemUrl || 'https://placehold.co/600x400/4A8B4A/ffffff'}')">
            <div class="news-overlay"></div>
            <div class="calendar-date">
                <span class="calendar-day">${dia}</span>
                <span class="calendar-month">${mes}</span>
                <span class="calendar-year">${ano}</span>
            </div>
            <div class="news-content">
                <h3 class="news-title">${noticia.titulo}</h3>
                <p class="news-excerpt">${noticia.conteudo.replace(/<[^>]*>/g, '').slice(0, 100)}...</p>
                <a href="./pages/noticias.html?id=${noticia.id}" class="news-read-more">
                    Ler
                </a>
            </div>
        </article>
    `;
        }

// Função para carregar notícias
        async function carregarNoticias() {
            try {
                const response = await fetch(`${CONFIG.API_URL}/noticias/aprovadas`);
                if (!response.ok) {
                    throw new Error('Erro ao carregar notícias');
                }

                const noticias = await response.json();
                const grid = document.getElementById('newsGrid');

                if (!noticias || noticias.length === 0) {
                    grid.innerHTML = `
                <div class="no-news">
                    <i class="fas fa-newspaper"></i>
                    <p>Nenhuma notícia disponível no momento</p>
                </div>
            `;
                    return;
                }

                grid.innerHTML = noticias.map((noticia, index) => criarCardNoticia(noticia, index)).join('');
            } catch (error) {
                console.error('Erro ao carregar notícias:', error);
                mostrarErroNoticias();
            }
        }

// Função para mostrar erro ao carregar notícias
        function mostrarErroNoticias() {
            const grid = document.getElementById('newsGrid');
            if (grid) {
                grid.innerHTML = `
            <div class="error-news">
                <i class="fas fa-exclamation-circle"></i>
                <p>Não foi possível carregar as notícias</p>
                <button onclick="carregarNoticias()" class="retry-btn">
                    <i class="fas fa-redo"></i> Tentar novamente
                </button>
            </div>
        `;
            }
        }

// Função para compartilhar notícia
        async function compartilharNoticia(titulo, url) {
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: titulo,
                        text: 'Confira esta notícia da Igreja Presbiteriana!',
                        url: url
                    });
                } else {
                    await navigator.clipboard.writeText(url);
                    mostrarMensagem('Link copiado para a área de transferência!', 'success');
                }
            } catch (error) {
                console.error('Erro ao compartilhar:', error);
            }
        }

// Função para mostrar mensagens
        function mostrarMensagem(texto, tipo) {
            Swal.fire({
                text: texto,
                icon: tipo,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }

// Inicialização
        document.addEventListener('DOMContentLoaded', () => {
            carregarNoticias();
        });

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

// Carregar configurações quando a página carregar
        document.addEventListener('DOMContentLoaded', carregarConfiguracoesFooter);


