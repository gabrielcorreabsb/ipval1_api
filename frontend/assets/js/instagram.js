class InstagramFeed {
    constructor(options = {}) {
        this.posts = [];
        this.displayedPosts = [];
        this.currentPost = null;
        this.maxPosts = options.maxPosts || 20; // Limite total de posts
        this.postsPerPage = options.postsPerPage || 4; // 4 posts por vez (uma linha)
        this.loadDelay = options.loadDelay || 1200; // Tempo de carregamento mais lento
        this.currentPage = 0;
        this.loading = false;
        this.allLoaded = false;
        this.accessToken = CONFIG.INSTAGRAM.ACCESS_TOKEN;
        this.instagramUsername = options.username || 'ipvalparaiso1';
        this.initialized = false; // Flag para evitar inicialização duplicada
    }

    async fetchFeed() {
        try {
            // Adicionando thumbnail_url para vídeos
            const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_url,media_type,thumbnail_url}&access_token=${this.accessToken}`);

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();
            console.log('Total de posts recebidos da API:', data.data.length);

            // Mapear os posts para o formato esperado pelo seu código
            let posts = data.data.map(post => {
                // Para vídeos, precisamos garantir que temos a thumbnail
                const isVideo = post.media_type === 'VIDEO';
                const thumbnailUrl = isVideo ? post.thumbnail_url : null;

                return {
                    id: post.id,
                    permalink: post.permalink,
                    // Para vídeos, usamos thumbnail_url para exibição na grade
                    mediaUrl: isVideo ? thumbnailUrl : (
                        post.media_type === 'CAROUSEL_ALBUM'
                            ? (post.children?.data[0]?.media_url || post.media_url)
                            : post.media_url
                    ),
                    caption: post.caption || '',
                    type: post.media_type,
                    isVideo: isVideo,
                    timestamp: new Date(post.timestamp),
                    carousel: post.media_type === 'CAROUSEL_ALBUM' && post.children?.data
                        ? post.children.data.map(child => {
                            // Também verificamos vídeos no carrossel
                            return child.media_type === 'VIDEO' ? child.thumbnail_url : child.media_url;
                        })
                        : null,
                    // URL do vídeo para reprodução
                    videoUrl: isVideo ? post.media_url : null,
                    // Armazenamos a thumbnail separadamente para vídeos
                    thumbnailUrl: thumbnailUrl
                };
            });

            // Limitar ao número máximo total de posts - aplicamos o limite aqui
            this.posts = posts.slice(0, this.maxPosts);

            console.log(`Limitando a ${this.maxPosts} posts no total`);
            console.log('Número de posts após processamento:', this.posts.length);
            return true;
        } catch (error) {
            console.error('Erro ao carregar feed:', error);
            return false;
        }
    }

    createPostElement(post) {
        // Cria um resumo curto da caption (primeiros 100 caracteres)
        const shortCaption = post.caption && post.caption.length > 100
            ? post.caption.substring(0, 100) + '...'
            : (post.caption || '');

        // Usamos mediaUrl para imagens e thumbnailUrl para vídeos na grade
        const displayUrl = post.isVideo ? post.thumbnailUrl : post.mediaUrl;

        // Verificar se temos uma URL válida para exibir
        if (!displayUrl) {
            console.error('URL de mídia inválida para o post:', post.id);
            return '';
        }

        return `
        <div class="instagram-post fade-in" 
             data-post-id="${post.id}" 
             title="${shortCaption.replace(/"/g, '&quot;')}">
            <img src="${displayUrl}" alt="Post do Instagram" loading="lazy">
            <div class="instagram-post-overlay">
                ${post.isVideo ? '<i class="fas fa-play"></i>' : ''}
                ${post.type === 'CAROUSEL_ALBUM' ? '<i class="fas fa-clone"></i>' : ''}
            </div>
            <div class="instagram-post-tooltip">
                <p>${shortCaption}</p>
            </div>
        </div>
        `;
    }

    openModal(post) {
        const formattedDate = post.timestamp.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        let mediaContent = '';
        if (post.isVideo && post.videoUrl) {
            // Para vídeos, usamos o elemento video com controles
            mediaContent = `
                <video controls autoplay>
                    <source src="${post.videoUrl}" type="video/mp4">
                    Seu navegador não suporta vídeos.
                </video>
            `;
            console.log('Carregando vídeo:', post.videoUrl);
        } else if (post.carousel && post.carousel.length > 0) {
            // Implementação do carrossel
            mediaContent = `
                <div class="carousel-container">
                    <div class="carousel-slides">
                        ${post.carousel.map(url => `
                            <div class="carousel-slide">
                                <img src="${url}" alt="Post do Instagram">
                            </div>
                        `).join('')}
                    </div>
                    ${post.carousel.length > 1 ? `
                        <button class="carousel-button prev">&lt;</button>
                        <button class="carousel-button next">&gt;</button>
                        <div class="carousel-dots">
                            ${post.carousel.map((_, i) => `
                                <span class="dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            mediaContent = `<img src="${post.mediaUrl}" alt="Post do Instagram">`;
        }

        const modalHTML = `
            <div class="instagram-modal">
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <div class="modal-grid">
                        <div class="modal-media">
                            ${mediaContent}
                        </div>
                        <div class="modal-info">
                            <div class="modal-header">
                                <img src="../assets/imgs/img_instagram.jpg" alt="Perfil" class="profile-pic">
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
                                    <i class="fab fa-instagram"></i> Ver no Instagram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';

        const modal = document.querySelector('.instagram-modal');

        // Adicionar listeners para o carrossel se existir
        if (post.carousel && post.carousel.length > 1) {
            let currentSlide = 0;
            const slides = modal.querySelectorAll('.carousel-slide');
            const dots = modal.querySelectorAll('.dot');
            const slidesContainer = modal.querySelector('.carousel-slides');

            const updateSlides = () => {
                slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentSlide);
                });
            };

            // Inicializar o carrossel
            updateSlides();

            modal.querySelector('.carousel-button.prev')?.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                updateSlides();
            });

            modal.querySelector('.carousel-button.next')?.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % slides.length;
                updateSlides();
            });

            modal.querySelectorAll('.dot').forEach((dot, i) => {
                dot.addEventListener('click', () => {
                    currentSlide = i;
                    updateSlides();
                });
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
        });
    }

    closeModal() {
        const modal = document.querySelector('.instagram-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    loadMorePosts() {
        if (this.loading || this.allLoaded) return;

        this.loading = true;

        // Mostrar indicador de carregamento
        const loader = document.getElementById('instagram-loader');
        if (loader) loader.style.display = 'block';

        const container = document.querySelector('.instagram-grid');
        if (!container) return;

        const startIndex = this.currentPage * this.postsPerPage;
        const endIndex = Math.min(startIndex + this.postsPerPage, this.posts.length);

        // Verificar se ainda há posts para carregar
        if (startIndex >= this.posts.length) {
            this.allLoaded = true;
            if (loader) loader.style.display = 'none';
            this.loading = false;
            return;
        }

        // Obter os próximos posts
        const nextPosts = this.posts.slice(startIndex, endIndex);

        // Usar setTimeout com o delay configurável para criar um efeito de carregamento mais lento
        setTimeout(() => {
            // Adicionar os posts ao container
            nextPosts.forEach(post => {
                // Verificar se o post já foi adicionado (evitar duplicação)
                if (!document.querySelector(`.instagram-post[data-post-id="${post.id}"]`)) {
                    const postElement = this.createPostElement(post);
                    container.insertAdjacentHTML('beforeend', postElement);
                    this.displayedPosts.push(post);
                }
            });

            // Adicionar event listeners aos novos posts
            const newPostElements = container.querySelectorAll('.instagram-post:not([data-initialized])');
            newPostElements.forEach((postElement) => {
                const postId = postElement.getAttribute('data-post-id');
                const post = this.posts.find(p => p.id === postId);
                if (post) {
                    postElement.addEventListener('click', () => {
                        this.openModal(post);
                    });
                    postElement.setAttribute('data-initialized', 'true');
                }
            });

            this.currentPage++;

            // Verificar se carregamos todos os posts
            if (endIndex >= this.posts.length) {
                this.allLoaded = true;
                console.log(`Todos os ${this.posts.length} posts foram carregados.`);
            }

            // Esconder o indicador de carregamento
            if (loader) loader.style.display = 'none';

            this.loading = false;

            // Log para debug
            console.log(`Carregados ${this.displayedPosts.length} de ${this.posts.length} posts no total`);
        }, this.loadDelay); // Usando o delay configurável
    }

    setupScrollListener() {
        // Remover listeners anteriores para evitar duplicação
        window.removeEventListener('scroll', this.scrollHandler);

        // Função para verificar se o usuário rolou até perto do final da página
        this.scrollHandler = () => {
            if (this.loading || this.allLoaded) return;

            const scrollPosition = window.innerHeight + window.scrollY;
            const bodyHeight = document.body.offsetHeight;

            // Carregar mais posts quando o usuário rolar até 80% da página
            if (scrollPosition >= bodyHeight * 0.8) {
                this.loadMorePosts();
            }
        };

        // Usar throttle para melhorar a performance do scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(this.scrollHandler, 200);
        });
    }

    async init() {
        // Evitar inicialização duplicada
        if (this.initialized) return;
        this.initialized = true;

        const container = document.getElementById('instagram-feed');
        if (!container) return;

        // Mostrar indicador de carregamento
        container.innerHTML = '<div class="loading">Carregando feed do Instagram...</div>';

        const success = await this.fetchFeed();
        if (!success) {
            container.innerHTML = '<div class="error">Erro ao carregar o feed do Instagram</div>';
            return;
        }

        if (this.posts.length === 0) {
            container.innerHTML = '<div class="error">Nenhum post encontrado</div>';
            return;
        }

        console.log(`Inicializando feed com limite de ${this.maxPosts} posts no total`);
        console.log('Posts disponíveis após limitação:', this.posts.length);

        // Limpar o container antes de inicializar
        container.innerHTML = '';

        // Inicializar o container com cabeçalho e botão para o Instagram
        container.innerHTML = `
            <div class="instagram-container">
                <div class="instagram-header">
                    <h3>Instagram</h3>
                    <a href="https://www.instagram.com/${this.instagramUsername}/" target="_blank" class="instagram-profile-link">
                        <i class="fab fa-instagram"></i> Seguir no Instagram
                    </a>
                </div>
                <div class="instagram-grid"></div>
                <div id="instagram-loader" class="loading">Carregando mais posts...</div>
                <div class="instagram-footer">
                    <a href="https://www.instagram.com/${this.instagramUsername}/" target="_blank" class="instagram-view-more">
                        Ver mais no Instagram <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `;

        // Resetar estado
        this.displayedPosts = [];
        this.currentPage = 0;
        this.allLoaded = false;

        // Carregar o primeiro lote de posts
        this.loadMorePosts();

        // Configurar o listener de scroll para carregar mais posts
        this.setupScrollListener();
    }
}

// Uso da classe - garantir que só é criada uma instância
let instagramFeedInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já existe uma instância
    if (!instagramFeedInstance) {
        instagramFeedInstance = new InstagramFeed({
            maxPosts: 20,           // Limite total de posts
            postsPerPage: 4,        // 4 posts por vez (uma linha)
            loadDelay: 1200,        // Tempo de carregamento mais lento (1.2 segundos)
            username: 'ipvalparaiso1'  // Nome de usuário do Instagram
        });

        instagramFeedInstance.init();
    }
});