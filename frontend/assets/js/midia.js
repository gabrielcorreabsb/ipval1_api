/* assets/js/midia.js */

document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.midia-nav-button');
    const sections = document.querySelectorAll('.midia-section');

    if (navButtons.length && sections.length) {
        // Função para mostrar uma seção e esconder as outras
        const showSection = (sectionId) => {
            sections.forEach(section => {
                section.classList.remove('active');
            });
            navButtons.forEach(button => {
                button.classList.remove('active');
            });

            const sectionToShow = document.getElementById(sectionId);
            const buttonToActivate = document.querySelector(`.midia-nav-button[data-section="${sectionId}"]`);

            if (sectionToShow) {
                sectionToShow.classList.add('active');
            }
            if (buttonToActivate) {
                buttonToActivate.classList.add('active');
            }

            // Initialize agenda only when "eventos" section is active
            if (sectionId === 'eventos' && typeof window.eventosJS !== 'undefined' && !window.agendaInitialized) {
                window.eventosJS.carregarProximosEventos(); // Initialize agenda events
                window.agendaInitialized = true; // Prevent re-initialization
            }
        };

        // Adicionar event listeners aos botões de navegação
        navButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const sectionId = button.dataset.section;
                showSection(sectionId);
            });
        });

        // Mostrar a seção "Geral" por padrão
        showSection('geral');
    }
});

class InstagramPosts { // Renamed to InstagramPosts
    constructor(options = {}, feedSelectorClass) { // Added feedSelectorClass
        // Configurações básicas
        this.videoPostsPerPage = options.videoPostsPerPage || 6;
        this.loadDelay = options.loadDelay || 800;
        this.instagramUsername = options.username || 'ipvalparaiso1';
        this.videoHashtags = options.videoHashtags || []; // Use videoHashtags as in your original code
        this.feedSelectorClass = feedSelectorClass; // Store feed selector class
        this.includeImages = options.includeImages !== undefined ? options.includeImages : true; // Option to include images, default true


        // Estado interno
        this.videoPosts = [];
        this.displayedVideoPosts = [];
        this.currentVideoPage = 0;
        this.allVideosLoaded = false;
        this.loadingVideos = false;
        this.initialized = false;

        // Elementos DOM - Dynamic selectors using feedSelectorClass
        this.container = document.querySelector(`.${feedSelectorClass} .instagram-videos-container`); // Container within feed
        this.videosGrid = document.querySelector(`.${feedSelectorClass} .instagram-videos-grid`); // Grid within feed
        this.loader = document.querySelector(`.${feedSelectorClass} .instagram-videos-loader`); // Loader within feed
        this.loadMoreBtn = document.querySelector(`.${feedSelectorClass} .load-more-videos-btn`); // Load more button within feed


        // Verificar se temos acesso ao token
        try {
            this.accessToken = CONFIG.INSTAGRAM.ACCESS_TOKEN;
            if (!this.accessToken) {
                throw new Error('Token de acesso do Instagram não encontrado');
            }
        } catch (error) {
            console.error('Erro ao acessar token do Instagram:', error);
            this.mostrarErroVideos();
            return;
        }

        // Bind de métodos para manter o contexto correto
        this.loadMoreVideos = this.loadMoreVideos.bind(this);
        this.init = this.init.bind(this);
        this.handleEscKey = this.handleEscKey.bind(this); // Bind handleEscKey
        this.retryInit = this.retryInit.bind(this); // Bind retryInit
        this.mostrarErroVideos = this.mostrarErroVideos.bind(this); // Bind mostrarErroVideos
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

            // Mapear e filtrar posts com hashtags específicas
            let allPosts = data.data.map(post => {
                let thumbnailUrl = post.thumbnail_url; // Default for videos
                let mediaUrlToUse = post.media_url;
                const isVideo = post.media_type === 'VIDEO';
                const isImage = post.media_type === 'IMAGE';
                const isCarousel = post.media_type === 'CAROUSEL_ALBUM';


                if (isImage) {
                    thumbnailUrl = post.media_url; // Use image itself as thumbnail for images
                } else if (isCarousel) {
                    // For carousel, use thumbnail of the first item
                    if (post.children && post.children.data.length > 0) {
                        thumbnailUrl = post.children.data[0].thumbnail_url || post.children.data[0].media_url; // Try thumbnail, else use media_url
                    } else {
                        thumbnailUrl = post.thumbnail_url || post.media_url; // Fallback to parent post's thumbnail or media_url
                    }
                    mediaUrlToUse = null; // Carousels don't have direct media_url, use children in modal
                }


                return {
                    id: post.id,
                    permalink: post.permalink,
                    mediaUrl: mediaUrlToUse, // Main media URL (video or main image, null for carousel)
                    caption: post.caption || '',
                    type: post.media_type,
                    isVideo: isVideo,
                    isImage: isImage,
                    isCarousel: isCarousel,
                    timestamp: new Date(post.timestamp),
                    videoUrl: isVideo ? post.media_url : null, // Video URL for videos
                    thumbnailUrl: thumbnailUrl, // Thumbnail for all types
                    children: isCarousel ? post.children.data : null // Children for carousels
                };
            });

            // Filtrar posts
            this.videoPosts = allPosts.filter(post => {
                if (this.feedSelectorClass === 'sermoes-feed' || this.feedSelectorClass === 'eventos-feed') {
                    if (!this.includeImages && !post.isVideo) return false; // Exclude non-videos if includeImages is false
                }


                if (this.videoHashtags && this.videoHashtags.length > 0) {
                    const caption = post.caption.toLowerCase();
                    return this.videoHashtags.some(tag =>
                        caption.includes(`#${tag}`) || caption.includes(`#${tag} `) ||
                        caption.includes(` #${tag}`) || caption.includes(` #${tag} `)
                    );
                }
                return true; // If no hashtags, include all (for geral-feed)
            });


            console.log(`Found ${this.videoPosts.length} posts for ${this.feedSelectorClass} with hashtags: ${this.videoHashtags.join(', ')}`);
            return true;
        } catch (error) {
            console.error('Error loading Instagram posts for ${this.feedSelectorClass}:', error);
            this.mostrarErroVideos(this); // Pass instance to error handler
            return false;
        }
    }

    createVideoElement(post) { // Renamed from createVideoElement to createPostElement and now accepts 'post'
        // Verificar se temos uma thumbnail válida
        if (!post.thumbnailUrl) {
            console.error('Invalid thumbnail for post:', post.id);
            return '';
        }

        // Cria um resumo curto da caption (primeiros 100 caracteres)
        const shortCaption = post.caption && post.caption.length > 100
            ? post.caption.substring(0, 100) + '...'
            : (post.caption || '');

        // Formatar a data no estilo das notícias
        const date = post.timestamp;
        const day = date.getDate().toString().padStart(2, '0');

        // Array com os nomes dos meses em português abreviados
        const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        let mediaContent = '';
        let playButton = '';

        if (post.isVideo) {
            playButton = `
                <div class="video-play-button">
                    <i class="fas fa-play"></i>
                </div>`;
        }


        mediaContent = `
            <div class="video-thumbnail">
                <img src="${post.thumbnailUrl}" alt="Instagram Post" loading="lazy">
                ${playButton}
            </div>`;


        return `
    <div class="instagram-video-post fade-in"
         data-post-id="${post.id}"
         title="${shortCaption.replace(/"/g, '"')}">
        <div class="video-thumbnail-container" data-post-id="${post.id}">
            ${mediaContent}
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

    openModal(post) { // Renamed to openModal and now accepts generic 'post'
        const formattedDate = post.timestamp.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        let modalMediaContent = '';

        if (post.isVideo) {
            if (!post.videoUrl) {
                console.error('Invalid video URL:', post.id);
                return;
            }
            modalMediaContent = `
                <div class="video-container">
                    <video controls autoplay playsinline>
                        <source src="${post.videoUrl}" type="video/mp4">
                        Your browser does not support videos.
                    </video>
                </div>`;
        } else if (post.isImage) {
            modalMediaContent = `
                <div class="image-container">
                    <img src="${post.mediaUrl}" alt="Instagram Image">
                </div>`;
        } else if (post.isCarousel) {
            modalMediaContent = this.createCarouselModalContent(post.children);
        }


        // Criar o modal
        const modalHTML = `
        <div class="instagram-modal">
            <div class="modal-content">
                <button class="modal-close">×</button>
                <div class="modal-grid">
                    <div class="modal-media">
                        ${modalMediaContent}
                    </div>
                    <div class="modal-info">
                        <div class="modal-header">
                            <img src="./assets/imgs/img_instagram.jpg" alt="Profile" class="profile-pic">
                            <div class="header-text">
                                <h4>${this.instagramUsername}</h4>
                                <span class="post-date">${formattedDate}</span>
                            </div>
                        </div>
                        <div class="modal-caption">
                            ${(post.caption || '').replace(/\n/g, '<br>')}
                        </div>
                        <div class="modal-actions">
                            <a href="${post.permalink}" target="_blank" class="instagram-link">
                                <i class="fab fa-instagram"></i> View on Instagram
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

        // Error handling for media loading
        const mediaElement = modal.querySelector('video') || modal.querySelector('img');
        if (mediaElement) {
            mediaElement.addEventListener('error', (e) => {
                console.error('Error loading media:', e, post);
                mediaElement.parentElement.innerHTML = `
                <div class="media-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading media</p>
                    <a href="${post.permalink}" target="_blank" class="instagram-link">
                        <i class="fab fa-instagram"></i> View on Instagram
                    </a>
                </div>
            `;
            });
        }

        // Success logging for media load
        if (post.isVideo && modal.querySelector('video')) {
            modal.querySelector('video').addEventListener('loadeddata', () => {
                console.log('Video loaded successfully');
            });
        } else if (post.isImage && modal.querySelector('img')) {
            modal.querySelector('img').addEventListener('load', () => {
                console.log('Image loaded successfully');
            });
        }
    }

    createCarouselModalContent(carouselItems) {
        if (!carouselItems || carouselItems.length === 0) return '<p>Carousel has no items.</p>';

        let carouselHTML = `<div class="carousel-container">`;
        carouselItems.forEach(item => {
            let mediaTag = '';
            if (item.media_type === 'VIDEO') {
                mediaTag = `<video controls playsinline><source src="${item.media_url}" type="video/mp4">Your browser does not support videos.</video>`;
            } else if (item.media_type === 'IMAGE') {
                mediaTag = `<img src="${item.media_url}" alt="Carousel item">`;
            }
            carouselHTML += `<div class="carousel-item">${mediaTag}</div>`;
        });
        carouselHTML += `</div>`;
        return carouselHTML;
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
            console.error('Video grid container not found for selector:', this.feedSelectorClass);
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
        console.log(`Loading posts ${startIndex + 1} to ${endIndex} of ${this.videoPosts.length} for ${this.feedSelectorClass}`);

        // Usar setTimeout com o delay configurável para criar um efeito de carregamento mais lento
        setTimeout(() => {
            // Adicionar os vídeos ao container
            nextVideos.forEach(post => { // Use 'post' here as it can be video or image
                // Verificar se o vídeo já foi adicionado (evitar duplicação)
                if (!document.querySelector(`.instagram-video-post[data-post-id="${post.id}"]`)) {
                    const postElement = this.createVideoElement(post); // Use createPostElement
                    if (postElement) {
                        this.videosGrid.insertAdjacentHTML('beforeend', postElement);
                        this.displayedVideoPosts.push(post);
                    }
                }
            });

            // Adicionar event listeners aos novos vídeos
            const newVideoElements = this.videosGrid.querySelectorAll('.instagram-video-post:not([data-initialized])');
            newVideoElements.forEach((postElement) => { // Use 'postElement'
                const postId = postElement.getAttribute('data-post-id');
                const post = this.videoPosts.find(p => p.id === postId); // Use 'post'
                if (post) {
                    // Adicionar event listener ao thumbnail container
                    const thumbnailContainer = postElement.querySelector('.video-thumbnail-container');
                    if (thumbnailContainer) {
                        thumbnailContainer.addEventListener('click', () => {
                            this.openModal(post); // Use openModal with 'post'
                        });
                    }


                    postElement.setAttribute('data-initialized', 'true');
                }
            });

            this.currentVideoPage++;

            // Verificar se carregamos todos os vídeos
            if (endIndex >= this.videoPosts.length) {
                this.allVideosLoaded = true;
                console.log(`All ${this.videoPosts.length} posts loaded for ${this.feedSelectorClass}.`);

                // Ocultar o botão "Carregar mais" se todos os vídeos foram carregados
                if (this.loadMoreBtn) {
                    this.loadMoreBtn.style.display = 'none';
                }
            }

            // Esconder o indicador de carregamento
            if (this.loader) this.loader.style.display = 'none';

            this.loadingVideos = false;

            // Log para debug
            console.log(`Loaded ${this.displayedVideoPosts.length} of ${this.videoPosts.length} posts in total for ${this.feedSelectorClass}`);
        }, this.loadDelay);
    }

    setupLoadMoreVideosButton() {
        if (this.loadMoreBtn) { // Check if loadMoreBtn exists
            // Remover event listeners anteriores para evitar duplicação
            this.loadMoreBtn.replaceWith(this.loadMoreBtn.cloneNode(true));

            // Adicionar novo event listener
            this.loadMoreBtn.addEventListener('click', () => {
                this.loadMoreVideos();
            });
        }
    }

    retryInit() {
        this.init();
    }


    // Método para extrair título do vídeo da caption
    extractTitle(caption) {
        if (!caption) return 'Post'; // Generic title 'Post'

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
        return 'Post'; // Return generic title 'Post'
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

    mostrarErroVideos(instance) { // Take instance as argument
        if (!this.container) return;

        const videosGrid = this.container.querySelector('.instagram-videos-grid');
        if (videosGrid) {
            videosGrid.innerHTML = `
                <div class="error-videos">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Não foi possível carregar as postagens</p>
                    <button class="retry-btn">
                        <i class="fas fa-redo"></i> Tentar novamente
                    </button>
                </div>
            `;
            const retryButton = videosGrid.querySelector('.retry-btn');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    instance.retryInit(); // Call retryInit on instance
                });
            }
        }


        // Ocultar o loader e o botão de carregar mais
        if (this.loader) this.loader.style.display = 'none';
        if (this.loadMoreBtn) this.loadMoreBtn.style.display = 'none';
    }

    async init() {
        // Evitar inicialização duplicada
        if (this.initialized) return;
        this.initialized = true;

        // Verificar se o container existe
        if (!this.container) {
            console.error('Video container not found for selector:', this.feedSelectorClass); // Added feedSelectorClass log
            return;
        }

        // Mostrar indicador de carregamento
        if (this.loader) this.loader.style.display = 'block';

        // Buscar e filtrar vídeos
        const success = await this.fetchVideos();

        // Se não houver vídeos ou ocorrer um erro, ocultar a seção
        if (!success || this.videoPosts.length === 0) {
            if (this.container) this.container.style.display = 'none'; // Check if container exists before hiding
            return;
        }

        // Carregar o primeiro lote de vídeos
        this.loadMoreVideos();

        // Configurar o botão "Carregar mais vídeos"
        this.setupLoadMoreVideosButton();
    }
}

// Inicialização da classe - Instances for each section
let instagramPostsInstanceEventos = null;
let instagramPostsInstanceSermoes = null;
let instagramPostsInstanceGeral = null;


document.addEventListener('DOMContentLoaded', () => {
    // Inicializar InstagramPosts para a seção de Eventos
    instagramPostsInstanceEventos = new InstagramPosts({
        videoPostsPerPage: 6,
        loadDelay: 800,
        username: 'ipvalparaiso1',
        videoHashtags: ['eventos', 'eventosIgreja', 'eventoIgreja'], // Hashtags for Eventos
        includeImages: true // Include images in Eventos
    }, 'eventos-feed'); // Feed selector class for Eventos
    instagramPostsInstanceEventos.init();

    // Inicializar InstagramPosts para a seção de Sermões
    instagramPostsInstanceSermoes = new InstagramPosts({
        videoPostsPerPage: 6,
        loadDelay: 900,
        username: 'ipvalparaiso1',
        videoHashtags: ['sermão', 'sermoes', 'sermoesIgreja', 'pregação'], // Hashtags for Sermões
        includeImages: false // Exclude images, only videos for Sermões
    }, 'sermoes-feed'); // Feed selector class for Sermões
    instagramPostsInstanceSermoes.init();

    // Inicializar InstagramPosts para a seção Geral
    instagramPostsInstanceGeral = new InstagramPosts({
        videoPostsPerPage: 6,
        loadDelay: 1000,
        username: 'ipvalparaiso1',
        videoHashtags: [], // No hashtags for General feed - load all
        includeImages: true // Include images in General feed
    }, 'geral-feed'); // Feed selector class for Geral
    instagramPostsInstanceGeral.init();

    // Initialize agenda after DOMContentLoaded
    if (typeof window.eventosJS !== 'undefined') {
        window.agendaInitialized = false; // Flag to control agenda initialization
    }
});