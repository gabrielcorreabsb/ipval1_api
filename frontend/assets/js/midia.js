class InstagramFeed {
    constructor(options = {}, feedSelectorClass) {
        // Primeiro, definir os métodos que serão vinculados
        this.loadMore = this.loadMore.bind(this);
        this.init = this.init.bind(this);
        this.handlePostClick = this.handlePostClick.bind(this);
        this.handleEscKey = this.handleEscKey.bind(this);

        // Configurações básicas
        this.postsPerPage = options.postsPerPage || 6;
        this.loadDelay = options.loadDelay || 800;
        this.username = options.username || 'ipvalparaiso1';
        this.hashtags = options.hashtags || [];
        this.includeImages = options.includeImages !== undefined ? options.includeImages : true;
        this.feedSelectorClass = feedSelectorClass;
        this.isMainPage = options.isMainPage || false;

        // Estado interno
        this.posts = [];
        this.displayedPosts = [];
        this.currentPage = 0;
        this.allPostsLoaded = false;
        this.loading = false;
        this.initialized = false;

        // Elementos DOM
        this.initializeDOMElements();

        // Verificar token
        this.initializeToken();
    }

    initializeDOMElements() {
        try {
            if (this.isMainPage) {
                this.container = document.querySelector('.instagram-videos-container');
                this.postsGrid = document.querySelector('.instagram-videos-grid');
                this.loader = document.getElementById('instagram-videos-loader');
                this.loadMoreBtn = document.querySelector('.btn-ver-todos');
            } else {
                this.container = document.getElementById(this.feedSelectorClass);
                if (this.container) {
                    this.postsGrid = this.container.querySelector('.instagram-videos-grid');
                    this.loader = this.container.querySelector('.instagram-videos-loader');
                    this.loadMoreBtn = this.container.querySelector('.load-more-videos-btn');
                }
            }

            if (!this.container || !this.postsGrid) {
                console.warn('Elementos DOM necessários não encontrados');
            }
        } catch (error) {
            console.error('Erro ao inicializar elementos DOM:', error);
        }
    }

    initializeToken() {
        try {
            // Verificar se CONFIG está definido globalmente
            if (typeof CONFIG === 'undefined') {
                throw new Error('Objeto CONFIG não encontrado');
            }

            // Verificar se o token do Instagram existe
            if (!CONFIG.INSTAGRAM || !CONFIG.INSTAGRAM.ACCESS_TOKEN) {
                throw new Error('Token de acesso do Instagram não encontrado no CONFIG');
            }

            this.accessToken = CONFIG.INSTAGRAM.ACCESS_TOKEN;
            console.log('Token do Instagram inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar token:', error.message);
            this.mostrarErro('Erro de configuração: ' + error.message);
        }
    }

    async fetchPosts() {
        try {
            console.log('Iniciando fetch de posts...');
            const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_url,media_type,thumbnail_url}';
            const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${this.accessToken}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Total de posts recebidos:', data.data.length);

            if (!data.data || !Array.isArray(data.data)) {
                throw new Error('Formato de dados inválido');
            }

            // Criar Set para rastrear IDs únicos
            const processedIds = new Set();

            // Filtrar e processar os posts
            this.posts = data.data
                .filter(post => {
                    // Se o post já foi processado, ignorar
                    if (processedIds.has(post.id)) {
                        return false;
                    }

                    // Se estiver na página principal, mostrar apenas vídeos
                    if (this.isMainPage && post.media_type !== 'VIDEO') {
                        return false;
                    }

                    // Se não incluir imagens e for uma imagem, filtrar
                    if (!this.includeImages && post.media_type === 'IMAGE') {
                        return false;
                    }

                    // Se houver hashtags específicas, verificar
                    if (this.hashtags.length > 0) {
                        const caption = (post.caption || '').toLowerCase();
                        const hasMatchingHashtag = this.hashtags.some(tag => {
                            const hashtagPattern = new RegExp(`#${tag.toLowerCase()}(?:\\s|$)`, 'i');
                            return hashtagPattern.test(caption);
                        });

                        if (!hasMatchingHashtag) {
                            return false;
                        }
                    }

                    // Adicionar ID ao Set de posts processados
                    processedIds.add(post.id);
                    return true;
                })
                .map(post => ({
                    id: post.id,
                    mediaUrl: post.media_url,
                    thumbnailUrl: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
                    permalink: post.permalink,
                    caption: post.caption || '',
                    mediaType: post.media_type,
                    timestamp: new Date(post.timestamp)
                }));

            console.log(`Posts processados para ${this.feedSelectorClass}:`, this.posts.length);
            return true;
        } catch (error) {
            console.error('Erro ao buscar posts:', error);
            this.mostrarErro(`Erro ao carregar posts: ${error.message}`);
            return false;
        }
    }

    createPostElement(post) {
        const isVideo = post.mediaType === 'VIDEO';

        // Formatar a data
        const day = post.timestamp.getDate().toString().padStart(2, '0');
        const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const month = monthNames[post.timestamp.getMonth()];

        return `
            <div class="instagram-video-post fade-in" data-post-id="${post.id}">
                <div class="video-thumbnail-container" onclick="event.preventDefault(); this.closest('.instagram-video-post').dispatchEvent(new CustomEvent('postClick'));">
                    <div class="video-thumbnail">
                        <img src="${post.thumbnailUrl}" alt="Instagram Post" loading="lazy">
                        ${isVideo ? `
                            <div class="video-play-button">
                                <i class="fas fa-play"></i>
                            </div>
                        ` : ''}
                    </div>
                    <div class="video-date">
                        <div class="video-date-day">${day}</div>
                        <div class="video-date-month">${month}</div>
                    </div>
                </div>
                <div class="video-info">
                    <h4 class="video-title">${this.extractTitle(post.caption)}</h4>
                </div>
            </div>
        `;
    }

    createModal(post) {
        const isVideo = post.mediaType === 'VIDEO';
        const formattedDate = post.timestamp.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        return `
            <div class="instagram-modal">
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <div class="modal-grid">
                        <div class="modal-media">
                            ${isVideo ? `
                                <div class="video-container">
                                    <video controls autoplay playsinline>
                                        <source src="${post.mediaUrl}" type="video/mp4">
                                        Seu navegador não suporta vídeos.
                                    </video>
                                </div>
                            ` : `
                                <img src="${post.mediaUrl}" alt="Instagram Post">
                            `}
                        </div>
                        <div class="modal-info">
                            <div class="modal-header">
                                <img src="./assets/imgs/logo-igreja.jpg" class="profile-pic" alt="Logo IPB">
                                <div class="header-text">
                                    <h4>Igreja Presbiteriana de Valparaíso 1</h4>
                                    <span class="post-date">${formattedDate}</span>
                                </div>
                            </div>
                            <div class="modal-caption">
                                ${this.formatCaption(post.caption)}
                            </div>
                            <div class="modal-actions">
                                <a href="${post.permalink}" target="_blank" rel="noopener noreferrer" class="instagram-link">
                                    <i class="fab fa-instagram"></i>
                                    Ver no Instagram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    handlePostClick(event) {
        const postElement = event.currentTarget;
        const postId = postElement.dataset.postId;
        const post = this.posts.find(p => p.id === postId);

        if (!post) return;

        const modal = this.createModal(post);
        document.body.insertAdjacentHTML('beforeend', modal);
        document.body.style.overflow = 'hidden';

        const modalElement = document.querySelector('.instagram-modal');
        const closeButton = modalElement.querySelector('.modal-close');

        const closeModal = () => {
            const video = modalElement.querySelector('video');
            if (video) video.pause();

            modalElement.classList.add('modal-closing');
            setTimeout(() => {
                modalElement.remove();
                document.body.style.overflow = '';
            }, 300);
        };

        closeButton.addEventListener('click', closeModal);
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) closeModal();
        });
        document.addEventListener('keydown', this.handleEscKey);
    }

    handleEscKey(e) {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.instagram-modal');
            if (modal) {
                document.removeEventListener('keydown', this.handleEscKey);
                document.body.style.overflow = '';
                modal.remove();
            }
        }
    }

    loadMore() {
        if (this.loading || this.allPostsLoaded) return;

        this.loading = true;
        if (this.loader) this.loader.style.display = 'block';

        const startIndex = this.currentPage * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const nextPosts = this.posts.slice(startIndex, endIndex);

        if (nextPosts.length === 0) {
            this.allPostsLoaded = true;
            if (this.loader) this.loader.style.display = 'none';
            if (this.loadMoreBtn && !this.isMainPage) {
                this.loadMoreBtn.style.display = 'none';
            }
            this.loading = false;
            return;
        }

        setTimeout(() => {
            nextPosts.forEach(post => {
                const postElement = this.createPostElement(post);
                if (postElement) {
                    this.postsGrid.insertAdjacentHTML('beforeend', postElement);
                }
            });

            this.currentPage++;
            this.loading = false;

            if (this.loader) this.loader.style.display = 'none';

            // Atualizar botão "Ver todos" na página principal
            if (this.isMainPage && this.loadMoreBtn) {
                this.loadMoreBtn.href = './pages/midia.html';
            }
            // Atualizar botão "Carregar mais" na página de mídia
            else if (this.loadMoreBtn) {
                this.loadMoreBtn.style.display =
                    (startIndex + this.postsPerPage) >= this.posts.length ? 'none' : 'block';
            }

            // Adicionar event listeners aos novos posts
            const newPosts = this.postsGrid.querySelectorAll('.instagram-video-post:not([data-initialized])');
            newPosts.forEach(post => {
                post.addEventListener('postClick', this.handlePostClick.bind(this));
                post.setAttribute('data-initialized', 'true');
            });
        }, this.loadDelay);
    }

    extractTitle(caption) {
        if (!caption) return 'Post do Instagram';
        const lines = caption.split('\n');
        return lines[0].trim() || 'Post do Instagram';
    }

    formatCaption(caption) {
        if (!caption) return '';
        return caption
            .replace(/#(\w+)/g, '<a href="https://www.instagram.com/explore/tags/$1" target="_blank" rel="noopener noreferrer">#$1</a>')
            .replace(/@(\w+)/g, '<a href="https://www.instagram.com/$1" target="_blank" rel="noopener noreferrer">@$1</a>')
            .replace(/\n/g, '<br>');
    }

    mostrarErro(mensagem = 'Não foi possível carregar os posts') {
        if (!this.postsGrid) return;

        this.postsGrid.innerHTML = `
            <div class="error-videos">
                <i class="fas fa-exclamation-circle"></i>
                <p>${mensagem}</p>
                <button onclick="this.closest('.error-videos').parentElement.dispatchEvent(new CustomEvent('retry'))" class="retry-button">
                    Tentar novamente
                </button>
            </div>
        `;

        if (this.loader) this.loader.style.display = 'none';
        if (this.loadMoreBtn && !this.isMainPage) this.loadMoreBtn.style.display = 'none';

        this.postsGrid.addEventListener('retry', () => this.init());
    }

    async init() {
        if (this.initialized) return;

        console.log(`Inicializando feed: ${this.isMainPage ? 'Página Principal' : this.feedSelectorClass}`);

        if (this.loader) this.loader.style.display = 'block';

        const success = await this.fetchPosts();

        if (!success || this.posts.length === 0) {
            this.mostrarErro('Nenhum post encontrado');
            return;
        }

        this.loadMore();

        if (this.loadMoreBtn && !this.isMainPage) {
            this.loadMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadMore();
            });
        }

        this.initialized = true;
    }
}


function setupMediaTabs() {
    const tabButtons = document.querySelectorAll('.midia-nav-button'); // Alterado para .midia-nav-button
    const sections = document.querySelectorAll('.midia-section');

    function showSection(sectionId) {
        console.log('Mostrando seção:', sectionId);

        // Ocultar todas as seções
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // Remover classe ativa de todos os botões
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });

        // Mostrar a seção selecionada
        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            selectedSection.style.display = 'block';
            selectedSection.classList.add('active');
        }

        // Adicionar classe ativa ao botão correspondente
        const activeButton = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    // Adicionar event listeners aos botões
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = button.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Mostrar seção inicial (geral)
    const initialSection = window.location.hash.slice(1) || 'geral';
    showSection(initialSection);
}

// Mantenha apenas a inicialização principal
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Verificar se estamos na página principal
        const videosSection = document.getElementById('videos');
        if (videosSection) {
            console.log('Inicializando feed na página principal');
            const mainFeed = new InstagramFeed({
                postsPerPage: 3,
                loadDelay: 800,
                username: 'ipvalparaiso1',
                hashtags: ['sermão'],
                isMainPage: true
            });
            mainFeed.init();
        }
        // Verificar se estamos na página de mídia
        else if (window.location.pathname.includes('midia.html')) {
            console.log('Inicializando feeds na página de mídia');

            Promise.all([
                // Feed de Eventos
                new InstagramFeed({
                    postsPerPage: 6,
                    loadDelay: 800,
                    username: 'ipvalparaiso1',
                    hashtags: ['eventos'],  // Removido 'eventosIgreja' para evitar duplicação
                    includeImages: true
                }, 'eventos-feed').init(),

                // Feed de Sermões
                new InstagramFeed({
                    postsPerPage: 6,
                    loadDelay: 900,
                    username: 'ipvalparaiso1',
                    hashtags: ['sermão', 'sermoes', 'pregação'],
                    includeImages: false
                }, 'sermoes-feed').init(),

                // Feed Geral
                new InstagramFeed({
                    postsPerPage: 6,
                    loadDelay: 1000,
                    username: 'ipvalparaiso1',
                    hashtags: [],
                    includeImages: true
                }, 'geral-feed').init()
            ])
                .then(() => {
                    setupMediaTabs();
                })
                .catch(error => {
                    console.error('Erro ao inicializar feeds:', error);
                });
        }
    } catch (error) {
        console.error('Erro ao inicializar Instagram Feed:', error);
    }
});

// No midia.js, adicione estas funções:

// Função para carregar eventos mini
async function carregarEventosMini() {
    const eventosList = document.querySelector('.eventos-mini-list');
    if (!eventosList) {
        console.warn('Container de eventos mini não encontrado');
        return;
    }

    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Reseta o horário para início do dia

        const dataLimite = new Date();
        dataLimite.setMonth(dataLimite.getMonth() + 3); // 3 meses à frente

        // Construir URL com parâmetros de data
        const url = new URL(`${CONFIG.API_URL}/agenda`);
        url.searchParams.append('dataInicio', hoje.toISOString().split('T')[0]);
        url.searchParams.append('dataFim', dataLimite.toISOString().split('T')[0]);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const eventos = await response.json();

        // Filtra apenas eventos futuros e ordena por data
        const eventosFuturos = eventos
            .filter(evento => {
                const dataEvento = new Date(evento.dataInicio);
                return dataEvento >= hoje;
            })
            .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))
            .slice(0, 5); // Limita a 5 eventos

        if (!eventosFuturos || eventosFuturos.length === 0) {
            eventosList.innerHTML = `
                <div class="no-eventos-mini">
                    <i class="fas fa-calendar-times"></i>
                    <p>Não há eventos programados para os próximos meses.</p>
                </div>
            `;
            return;
        }

        eventosList.innerHTML = eventosFuturos.map(evento => {
            const data = new Date(evento.dataInicio);
            const dia = data.getDate();
            const mes = data.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
            const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            // Verifica se o evento é hoje
            const isHoje = data.toDateString() === hoje.toDateString();
            const dataClass = isHoje ? 'evento-mini-data hoje' : 'evento-mini-data';

            return `
                <div class="evento-mini-card">
                    <div class="${dataClass}">
                        <span class="evento-mini-dia">${dia}</span>
                        <span class="evento-mini-mes">${mes}</span>
                    </div>
                    <div class="evento-mini-info">
                        <h4 class="evento-mini-titulo">${evento.titulo}</h4>
                        <div class="evento-mini-detalhes">
                            <span class="evento-mini-hora">
                                <i class="fas fa-clock"></i> ${hora}
                            </span>
                            <span class="evento-mini-local">
                                <i class="fas fa-map-marker-alt"></i> ${evento.localEvento || 'Local a definir'}
                            </span>
                        </div>
                        <div class="evento-mini-actions">
                            <a href="../pages/agenda.html" class="evento-mini-btn mais-detalhes">
                                <i class="fas fa-calendar-alt"></i> Mais detalhes
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Adicione um estilo especial para eventos do dia
        if (document.querySelector('.evento-mini-data.hoje')) {
            const style = document.createElement('style');
            style.textContent = `
                .evento-mini-data.hoje {
                    background-color: var(--color-accent);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(11, 102, 54, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(11, 102, 54, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(11, 102, 54, 0); }
                }
            `;
            document.head.appendChild(style);
        }

    } catch (error) {
        console.error('Erro ao carregar eventos mini:', error);
        eventosList.innerHTML = `
            <div class="no-eventos-mini">
                <i class="fas fa-exclamation-circle"></i>
                <p>Não foi possível carregar os eventos. Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

// Função para mostrar detalhes do evento
function mostrarDetalhesMiniEvento(evento) {
    Swal.fire({
        title: evento.titulo,
        html: `
            <div class="event-details-modal">
                <p><strong>Data:</strong> ${new Date(evento.dataInicio).toLocaleDateString()}</p>
                <p><strong>Hora:</strong> ${new Date(evento.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                ${evento.descricao ? `<p><strong>Descrição:</strong> ${evento.descricao}</p>` : ''}
                ${evento.localEvento ? `<p><strong>Local:</strong> ${evento.localEvento}</p>` : ''}
            </div>
        `,
        confirmButtonText: 'Fechar',
        confirmButtonColor: '#0b6636'
    });
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    try {
        const videosSection = document.getElementById('videos');
        if (videosSection) {
            // ... código para página principal ...
        } else if (window.location.pathname.includes('midia.html')) {
            console.log('Inicializando feeds na página de mídia');

            // Inicializar os feeds do Instagram e configurar os eventos
            Promise.all([
                // ... seus feeds existentes ...
            ])
                .then(() => {
                    setupMediaTabs();
                    // Carregar eventos mini se estivermos na seção de eventos
                    if (window.location.hash === '#eventos') {
                        carregarEventosMini();
                    }
                })
                .catch(error => {
                    console.error('Erro ao inicializar feeds:', error);
                });

            // Adicionar listener para o botão de eventos
            const eventosButton = document.querySelector('[data-section="eventos"]');
            if (eventosButton) {
                eventosButton.addEventListener('click', carregarEventosMini);
            }
        }
    } catch (error) {
        console.error('Erro ao inicializar:', error);
    }
});