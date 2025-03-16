class InstagramVideos {
    constructor(options = {}) {
        // Configurações básicas
        this.videoPostsPerPage = options.videoPostsPerPage || 3;
        this.loadDelay = options.loadDelay || 1200;
        this.instagramUsername = options.username || 'ipvalparaiso1';
        this.videoHashtags = options.videoHashtags || ['sermão', 'eventos'];

        // Estado interno
        this.videoPosts = [];
        this.displayedVideoPosts = [];
        this.currentVideoPage = 0;
        this.allVideosLoaded = false;
        this.loadingVideos = false;
        this.initialized = false;

        // Elementos DOM - atualizados para o novo layout
        this.container = document.querySelector('.instagram-videos-container');
        this.videosGrid = document.querySelector('.instagram-videos-grid');
        this.loader = document.getElementById('instagram-videos-loader');
        this.loadMoreBtn = document.getElementById('load-more-videos');

        // Verificar se temos acesso ao token
        try {
            this.accessToken = CONFIG.INSTAGRAM.ACCESS_TOKEN;
            if (!this.accessToken) {
                throw new Error('Token de acesso do Instagram não encontrado');
            }
        } catch (error) {
            console.error('Erro ao acessar token do Instagram:', error);
            this.mostrarErroConfiguracao();
            return;
        }

        // Bind de métodos para manter o contexto correto
        this.loadMoreVideos = this.loadMoreVideos.bind(this);
        this.init = this.init.bind(this);
    }

    async fetchVideos() {
        try {
            // Buscar posts do Instagram
            const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_url,media_type,thumbnail_url}&access_token=${this.accessToken}`);

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();
            console.log('Total de posts recebidos da API:', data.data.length);

            // Mapear e filtrar apenas vídeos com hashtags específicas
            let allPosts = data.data.map(post => {
                // Para vídeos, precisamos garantir que temos a thumbnail
                const isVideo = post.media_type === 'VIDEO';
                const thumbnailUrl = isVideo ? post.thumbnail_url : null;

                return {
                    id: post.id,
                    permalink: post.permalink,
                    mediaUrl: post.media_url,
                    caption: post.caption || '',
                    type: post.media_type,
                    isVideo: isVideo,
                    timestamp: new Date(post.timestamp),
                    // URL do vídeo para reprodução
                    videoUrl: isVideo ? post.media_url : null,
                    // Armazenamos a thumbnail separadamente para vídeos
                    thumbnailUrl: thumbnailUrl
                };
            });

            // Filtrar apenas vídeos com as hashtags específicas
            this.videoPosts = allPosts.filter(post => {
                // Verificar se é um vídeo
                if (!post.isVideo) return false;

                // Verificar se a legenda contém alguma das hashtags
                const caption = post.caption.toLowerCase();
                return this.videoHashtags.some(tag =>
                    caption.includes(`#${tag}`) || caption.includes(`#${tag} `) ||
                    caption.includes(` #${tag}`) || caption.includes(` #${tag} `)
                );
            });

            console.log(`Encontrados ${this.videoPosts.length} vídeos com as hashtags: ${this.videoHashtags.join(', ')}`);
            return true;
        } catch (error) {
            console.error('Erro ao carregar vídeos do Instagram:', error);
            this.mostrarErroVideos();
            return false;
        }
    }

    createVideoElement(video) {
        // Verificar se temos uma thumbnail válida
        if (!video.thumbnailUrl) {
            console.error('Thumbnail inválida para o vídeo:', video.id);
            return '';
        }

        // Cria um resumo curto da caption (primeiros 100 caracteres)
        const shortCaption = video.caption && video.caption.length > 100
            ? video.caption.substring(0, 100) + '...'
            : (video.caption || '');

        // Formatar a data no estilo das notícias
        const date = video.timestamp;
        const day = date.getDate().toString().padStart(2, '0');

        // Array com os nomes dos meses em português abreviados
        const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        return `
    <div class="instagram-video-post fade-in" 
         data-post-id="${video.id}" 
         title="${shortCaption.replace(/"/g, '&quot;')}">
        <div class="video-thumbnail-container" data-post-id="${video.id}">
            <div class="video-thumbnail">
                <img src="${video.thumbnailUrl}" alt="Vídeo do Instagram" loading="lazy">
            </div>
            <div class="video-date">
                <div class="video-date-day">${day}</div>
                <div class="video-date-month">${month}</div>
            </div>
            <div class="video-play-button">
                <i class="fas fa-play"></i>
            </div>
        </div>
        <div class="video-info">
            <h4 class="video-title">${this.extractTitle(video.caption)}</h4>
        </div>
    </div>
    `;
    }

    openModal(video) {
        // Verificar se temos uma URL de vídeo válida
        if (!video.videoUrl) {
            console.error('URL de vídeo inválida:', video.id);
            return;
        }

        const formattedDate = video.timestamp.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // Criar o modal
        const modalHTML = `
        <div class="instagram-modal">
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-grid">
                    <div class="modal-media">
                        <div class="video-container">
                            <video controls autoplay playsinline>
                                <source src="${video.videoUrl}" type="video/mp4">
                                Seu navegador não suporta vídeos.
                            </video>
                        </div>
                    </div>
                    <div class="modal-info">
                        <div class="modal-header">
                            <img src="./assets/imgs/img_instagram.jpg" alt="Perfil" class="profile-pic">
                            <div class="header-text">
                                <h4>${this.instagramUsername}</h4>
                                <span class="post-date">${formattedDate}</span>
                            </div>
                        </div>
                        <div class="modal-caption">
                            ${(video.caption || '').replace(/\n/g, '<br>')}
                        </div>
                        <div class="modal-actions">
                            <a href="${video.permalink}" target="_blank" class="instagram-link">
                                <i class="fab fa-instagram"></i> Ver no Instagram
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

        // Adicionar o modal ao body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';

        // Adicionar event listeners para fechar o modal
        const modal = document.querySelector('.instagram-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
        });

        // Adicionar event listener para tecla ESC
        document.addEventListener('keydown', this.handleEscKey);

        // Verificar se o vídeo está carregando corretamente
        const videoElement = modal.querySelector('video');
        videoElement.addEventListener('error', (e) => {
            console.error('Erro ao carregar o vídeo:', e);
            videoElement.parentElement.innerHTML = `
            <div class="video-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar o vídeo</p>
                <a href="${video.permalink}" target="_blank" class="instagram-link">
                    <i class="fab fa-instagram"></i> Ver no Instagram
                </a>
            </div>
        `;
        });

        // Adicionar event listener para quando o vídeo estiver pronto
        videoElement.addEventListener('loadeddata', () => {
            console.log('Vídeo carregado com sucesso');
        });
    }

// Método para lidar com a tecla ESC
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

    closeModal() {
        const modal = document.querySelector('.instagram-modal');
        if (modal) {
            // Pausar o vídeo antes de fechar o modal
            const videoElement = modal.querySelector('video');
            if (videoElement) {
                videoElement.pause();
            }

            // Remover o event listener da tecla ESC
            document.removeEventListener('keydown', this.handleEscKey);

            // Remover o modal e restaurar o scroll
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    loadMoreVideos() {
        if (this.loadingVideos || this.allVideosLoaded) return;

        this.loadingVideos = true;

        // Mostrar indicador de carregamento
        if (this.loader) this.loader.style.display = 'block';

        if (!this.videosGrid) {
            console.error('Container de grade de vídeos não encontrado');
            this.loadingVideos = false;
            return;
        }

        const startIndex = this.currentVideoPage * this.videoPostsPerPage;
        const endIndex = Math.min(startIndex + this.videoPostsPerPage, this.videoPosts.length);

        // Verificar se ainda há vídeos para carregar
        if (startIndex >= this.videoPosts.length) {
            this.allVideosLoaded = true;
            if (this.loader) this.loader.style.display = 'none';
            this.loadingVideos = false;
            return;
        }

        // Obter os próximos vídeos
        const nextVideos = this.videoPosts.slice(startIndex, endIndex);
        console.log(`Carregando vídeos ${startIndex+1} a ${endIndex} de ${this.videoPosts.length}`);

        // Usar setTimeout com o delay configurável para criar um efeito de carregamento mais lento
        setTimeout(() => {
            // Adicionar os vídeos ao container
            nextVideos.forEach(video => {
                // Verificar se o vídeo já foi adicionado (evitar duplicação)
                if (!document.querySelector(`.instagram-video-post[data-post-id="${video.id}"]`)) {
                    const videoElement = this.createVideoElement(video);
                    if (videoElement) {
                        this.videosGrid.insertAdjacentHTML('beforeend', videoElement);
                        this.displayedVideoPosts.push(video);
                    }
                }
            });

            // Adicionar event listeners aos novos vídeos
            const newVideoElements = this.videosGrid.querySelectorAll('.instagram-video-post:not([data-initialized])');
            newVideoElements.forEach((videoElement) => {
                const postId = videoElement.getAttribute('data-post-id');
                const video = this.videoPosts.find(p => p.id === postId);
                if (video) {
                    // Adicionar event listener ao thumbnail container
                    const thumbnailContainer = videoElement.querySelector('.video-thumbnail-container');
                    if (thumbnailContainer) {
                        thumbnailContainer.addEventListener('click', () => {
                            this.openModal(video);
                        });
                    }

                    // Adicionar event listener específico ao botão "Assistir"
                    const readBtn = videoElement.querySelector('.video-read-btn');
                    if (readBtn) {
                        readBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.openModal(video);
                        });
                    }

                    videoElement.setAttribute('data-initialized', 'true');
                }
            });

            this.currentVideoPage++;

            // Verificar se carregamos todos os vídeos
            if (endIndex >= this.videoPosts.length) {
                this.allVideosLoaded = true;
                console.log(`Todos os ${this.videoPosts.length} vídeos foram carregados.`);

                // Ocultar o botão "Carregar mais" se todos os vídeos foram carregados
                if (this.loadMoreBtn) {
                    this.loadMoreBtn.style.display = 'none';
                }
            }

            // Esconder o indicador de carregamento
            if (this.loader) this.loader.style.display = 'none';

            this.loadingVideos = false;

            // Log para debug
            console.log(`Carregados ${this.displayedVideoPosts.length} de ${this.videoPosts.length} vídeos no total`);
        }, this.loadDelay);
    }

    setupLoadMoreVideosButton() {
        const loadMoreBtn = document.getElementById('load-more-videos');
        if (loadMoreBtn) {
            // Remover event listeners anteriores para evitar duplicação
            loadMoreBtn.replaceWith(loadMoreBtn.cloneNode(true));

            // Adicionar novo event listener
            document.getElementById('load-more-videos').addEventListener('click', () => {
                this.loadMoreVideos();
            });
        }
    }

    // Método para extrair título do vídeo da caption
    extractTitle(caption) {
        if (!caption) return 'Vídeo';

        // Tentar extrair a primeira linha como título
        const lines = caption.split('\n');
        if (lines.length > 0) {
            const firstLine = lines[0].trim();
            // Se a primeira linha for curta, usá-la como título
            if (firstLine.length > 0 && firstLine.length < 100) {
                return firstLine;
            }
        }

        // Caso contrário, usar um título genérico
        return 'Vídeo';
    }

    // Método para extrair hashtags da caption
    extractHashtags(caption) {
        if (!caption) return [];

        const hashtags = [];
        const regex = /#(\w+)/g;
        let match;

        while ((match = regex.exec(caption)) !== null) {
            hashtags.push(match[1]);
        }

        return hashtags;
    }

    mostrarErroVideos() {
        if (!this.container) return;

        const videosGrid = this.container.querySelector('.instagram-videos-grid');
        if (videosGrid) {
            videosGrid.innerHTML = `
                <div class="error-videos">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Não foi possível carregar os vídeos</p>
                    <button onclick="instagramVideosInstance.init()" class="retry-btn">
                        <i class="fas fa-redo"></i> Tentar novamente
                    </button>
                </div>
            `;
        }

        // Ocultar o loader e o botão de carregar mais
        const loader = document.getElementById('instagram-videos-loader');
        if (loader) loader.style.display = 'none';

        const loadMoreBtn = document.getElementById('load-more-videos');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    }

    async init() {
        // Evitar inicialização duplicada
        if (this.initialized) return;
        this.initialized = true;

        // Verificar se o container existe
        if (!this.container) {
            console.error('Container de vídeos não encontrado');
            return;
        }

        // Mostrar indicador de carregamento
        const loader = document.getElementById('instagram-videos-loader');
        if (loader) loader.style.display = 'block';

        // Buscar e filtrar vídeos
        const success = await this.fetchVideos();

        // Se não houver vídeos ou ocorrer um erro, ocultar a seção
        if (!success || this.videoPosts.length === 0) {
            this.container.style.display = 'none';
            return;
        }

        // Carregar o primeiro lote de vídeos
        this.loadMoreVideos();

        // Configurar o botão "Carregar mais vídeos"
        this.setupLoadMoreVideosButton();
    }
}

// Inicialização da classe
let instagramVideosInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já existe uma instância
    if (!instagramVideosInstance) {
        instagramVideosInstance = new InstagramVideos({
            videoPostsPerPage: 3,
            loadDelay: 1200,
            username: 'ipvalparaiso1',
            videoHashtags: ['sermão', 'eventos']
        });

        instagramVideosInstance.init();
    }
});