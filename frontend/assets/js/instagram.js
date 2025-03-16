class InstagramFeed {
    constructor(options = {}) {
        // Propriedades existentes
        this.posts = [];
        this.displayedPosts = [];
        this.currentPost = null;
        this.maxPosts = options.maxPosts || 20;
        this.postsPerPage = options.postsPerPage || 4;
        this.loadDelay = options.loadDelay || 1200;
        this.currentPage = 0;
        this.loading = false;
        this.allLoaded = false;
        this.accessToken = CONFIG.INSTAGRAM.ACCESS_TOKEN;
        this.instagramUsername = options.username || 'ipvalparaiso1';
        this.initialized = false;

        // Novas propriedades para a seção de vídeos
        this.videoPosts = [];
        this.displayedVideoPosts = [];
        this.currentVideoPage = 0;
        this.videoPostsPerPage = options.videoPostsPerPage || 3;
        this.allVideosLoaded = false;
        this.loadingVideos = false;
        this.videoHashtags = options.videoHashtags || ['sermão', 'eventos'];
    }



    async fetchFeed() {
        try {
            // Código existente para buscar o feed
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

            // NOVO: Filtrar vídeos com as hashtags específicas
            this.filterVideosByHashtags();

            console.log(`Limitando a ${this.maxPosts} posts no total`);
            console.log('Número de posts após processamento:', this.posts.length);
            console.log('Número de vídeos com hashtags específicas:', this.videoPosts.length);
            return true;
        } catch (error) {
            console.error('Erro ao carregar feed:', error);
            return false;
        }
    }

    // NOVO: Método para filtrar vídeos com hashtags específicas
    filterVideosByHashtags() {
        // Filtrar apenas vídeos que contêm as hashtags especificadas
        this.videoPosts = this.posts.filter(post => {
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
    }

    // Métodos existentes...
    createPostElement(post) {
        // Código existente...
    }

    openModal(post) {
        // Código existente...
    }

    closeModal() {
        // Código existente...
    }

    loadMorePosts() {
        // Código existente...
    }

    // NOVO: Método para carregar mais vídeos
    loadMoreVideos() {
        if (this.loadingVideos || this.allVideosLoaded) return;

        this.loadingVideos = true;

        // Mostrar indicador de carregamento
        const loader = document.getElementById('instagram-videos-loader');
        if (loader) loader.style.display = 'block';

        const container = document.querySelector('.instagram-videos-grid');
        if (!container) return;

        const startIndex = this.currentVideoPage * this.videoPostsPerPage;
        const endIndex = Math.min(startIndex + this.videoPostsPerPage, this.videoPosts.length);

        // Verificar se ainda há vídeos para carregar
        if (startIndex >= this.videoPosts.length) {
            this.allVideosLoaded = true;
            if (loader) loader.style.display = 'none';
            this.loadingVideos = false;
            return;
        }

        // Obter os próximos vídeos
        const nextVideos = this.videoPosts.slice(startIndex, endIndex);

        // Usar setTimeout com o delay configurável para criar um efeito de carregamento mais lento
        setTimeout(() => {
            // Adicionar os vídeos ao container
            nextVideos.forEach(video => {
                // Verificar se o vídeo já foi adicionado (evitar duplicação)
                if (!document.querySelector(`.instagram-video-post[data-post-id="${video.id}"]`)) {
                    const videoElement = this.createVideoElement(video);
                    container.insertAdjacentHTML('beforeend', videoElement);
                    this.displayedVideoPosts.push(video);
                }
            });

            // Adicionar event listeners aos novos vídeos
            const newVideoElements = container.querySelectorAll('.instagram-video-post:not([data-initialized])');
            newVideoElements.forEach((videoElement) => {
                const postId = videoElement.getAttribute('data-post-id');
                const video = this.videoPosts.find(p => p.id === postId);
                if (video) {
                    videoElement.addEventListener('click', () => {
                        this.openModal(video);
                    });
                    videoElement.setAttribute('data-initialized', 'true');
                }
            });

            this.currentVideoPage++;

            // Verificar se carregamos todos os vídeos
            if (endIndex >= this.videoPosts.length) {
                this.allVideosLoaded = true;
                console.log(`Todos os ${this.videoPosts.length} vídeos foram carregados.`);
            }

            // Esconder o indicador de carregamento
            if (loader) loader.style.display = 'none';

            this.loadingVideos = false;

            // Log para debug
            console.log(`Carregados ${this.displayedVideoPosts.length} de ${this.videoPosts.length} vídeos no total`);
        }, this.loadDelay);
    }

    // NOVO: Método para criar elemento de vídeo
    createVideoElement(video) {
        // Cria um resumo curto da caption (primeiros 100 caracteres)
        const shortCaption = video.caption && video.caption.length > 100
            ? video.caption.substring(0, 100) + '...'
            : (video.caption || '');

        // Extrair hashtags para exibição
        const hashtags = this.extractHashtags(video.caption);
        const hashtagsHtml = hashtags.length > 0
            ? `<div class="video-hashtags">${hashtags.map(tag => `<span class="hashtag">#${tag}</span>`).join(' ')}</div>`
            : '';

        return `
        <div class="instagram-video-post fade-in" 
             data-post-id="${video.id}" 
             title="${shortCaption.replace(/"/g, '&quot;')}">
            <div class="video-thumbnail">
                <img src="${video.thumbnailUrl}" alt="Vídeo do Instagram" loading="lazy">
                <div class="video-play-button">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="video-info">
                <h4 class="video-title">${this.extractTitle(video.caption)}</h4>
                <p class="video-caption">${shortCaption}</p>
                ${hashtagsHtml}
                <div class="video-date">
                    <i class="far fa-calendar-alt"></i> 
                    ${video.timestamp.toLocaleDateString('pt-BR')}
                </div>
            </div>
        </div>
        `;
    }

    // NOVO: Método para extrair título do vídeo da caption
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

    // NOVO: Método para extrair hashtags da caption
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

    setupScrollListener() {
        // Código existente...
    }

    // NOVO: Método para configurar o botão "Carregar mais vídeos"
    setupLoadMoreVideosButton() {
        const loadMoreBtn = document.getElementById('load-more-videos');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreVideos();
            });
        }
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
            
            <!-- NOVO: Seção de vídeos -->
            ${this.videoPosts.length > 0 ? `
            <div class="instagram-videos-container">
                <div class="instagram-videos-header">
                    <h3>Vídeos</h3>
                    <p>Sermões e eventos especiais da nossa igreja</p>
                </div>
                <div class="instagram-videos-grid"></div>
                <div id="instagram-videos-loader" class="loading">Carregando mais vídeos...</div>
                <div class="instagram-videos-footer">
                    <button id="load-more-videos" class="load-more-videos-btn">
                        Carregar mais vídeos <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>
            ` : ''}
        `;

        // Resetar estado
        this.displayedPosts = [];
        this.currentPage = 0;
        this.allLoaded = false;

        // Resetar estado dos vídeos
        this.displayedVideoPosts = [];
        this.currentVideoPage = 0;
        this.allVideosLoaded = false;

        // Carregar o primeiro lote de posts
        this.loadMorePosts();

        // Carregar o primeiro lote de vídeos se houver
        if (this.videoPosts.length > 0) {
            this.loadMoreVideos();
            this.setupLoadMoreVideosButton();
        }

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
            username: 'ipvalparaiso1',  // Nome de usuário do Instagram
            videoPostsPerPage: 3,    // 3 vídeos por vez
            videoHashtags: ['sermão', 'eventos']  // Hashtags para filtrar vídeos
        });

        instagramFeedInstance.init();
    }
});