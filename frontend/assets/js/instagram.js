class InstagramFeed {
    constructor(options = {}) {
        this.posts = [];
        this.currentPost = null;
        this.maxPosts = options.maxPosts || null; // null mostra todos os posts
        this.loading = false;
    }

    async fetchFeed() {
        try {
            const response = await fetch('https://feeds.behold.so/MJLeimStr5TAvUyLKICk');
            const data = await response.json();

            console.log('Total de posts no JSON:', data.posts.length);

            // Mapear todos os posts primeiro
            let posts = data.posts.map(post => ({
                id: post.id,
                permalink: post.permalink,
                mediaUrl: post.mediaType === 'CAROUSEL_ALBUM'
                    ? post.children[0].sizes.large.mediaUrl
                    : post.sizes.large.mediaUrl,
                caption: post.caption,
                type: post.mediaType,
                isVideo: post.mediaType === 'VIDEO',
                timestamp: new Date(post.timestamp),
                carousel: post.mediaType === 'CAROUSEL_ALBUM' ?
                    post.children.map(child => child.sizes.large.mediaUrl) : null,
                videoUrl: post.mediaType === 'VIDEO' ? post.mediaUrl : null
            }));

            // Aplicar limite apenas se maxPosts for definido
            if (this.maxPosts) {
                posts = posts.slice(0, this.maxPosts);
            }

            this.posts = posts;
            console.log('Número de posts após processamento:', this.posts.length);
            return true;
        } catch (error) {
            console.error('Erro ao carregar feed:', error);
            return false;
        }
    }

    createPostElement(post) {
        // Cria um resumo curto da caption (primeiros 100 caracteres)
        const shortCaption = post.caption.length > 100
            ? post.caption.substring(0, 100) + '...'
            : post.caption;

        return `
        <div class="instagram-post" 
             data-post-id="${post.id}" 
             title="${shortCaption.replace(/"/g, '&quot;')}">
            <img src="${post.mediaUrl}" alt="Post do Instagram" loading="lazy">
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
        if (post.isVideo) {
            mediaContent = `
                <video controls autoplay muted>
                    <source src="${post.videoUrl}" type="video/mp4">
                    Seu navegador não suporta vídeos.
                </video>
            `;
        } else if (post.carousel) {
            // Implementação do carrossel
            mediaContent = `
                <div class="carousel-container">
                    <div class="carousel-slide">
                        ${post.carousel.map(url => `
                            <img src="${url}" alt="Post do Instagram">
                        `).join('')}
                    </div>
                    ${post.carousel.length > 1 ? `
                        <button class="carousel-prev">&lt;</button>
                        <button class="carousel-next">&gt;</button>
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
                                    <h4>ipvalparaiso1</h4>
                                    <span class="post-date">${formattedDate}</span>
                                </div>
                            </div>
                            <div class="modal-caption">
                                ${post.caption.replace(/\n/g, '<br>')}
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
            const slides = modal.querySelectorAll('.carousel-slide img');
            const dots = modal.querySelectorAll('.dot');

            const updateSlides = () => {
                slides.forEach((slide, i) => {
                    slide.style.transform = `translateX(${100 * (i - currentSlide)}%)`;
                });
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentSlide);
                });
            };

            modal.querySelector('.carousel-prev')?.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                updateSlides();
            });

            modal.querySelector('.carousel-next')?.addEventListener('click', () => {
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

    async init() {
        const container = document.getElementById('instagram-feed');
        if (!container) return;

        const success = await this.fetchFeed();
        if (!success) {
            container.innerHTML = '<div class="error">Erro ao carregar o feed</div>';
            return;
        }

        console.log('Renderizando posts:', this.posts.length);

        container.innerHTML = `
            <div class="instagram-container">
                <div class="instagram-grid">
                    ${this.posts.map(post => this.createPostElement(post)).join('')}
                </div>
            </div>
        `;

        container.querySelectorAll('.instagram-post').forEach((post, index) => {
            post.addEventListener('click', () => {
                this.openModal(this.posts[index]);
            });
        });
    }
}

// Uso da classe
document.addEventListener('DOMContentLoaded', () => {
    // Para mostrar todos os posts
    const feed = new InstagramFeed();

    // OU para limitar o número de posts
    // const feed = new InstagramFeed({ maxPosts: 12 });

    feed.init();
});