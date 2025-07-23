document.addEventListener('DOMContentLoaded', async () => {
    // --- Seletores DOM ---
    const loadingDiv = document.getElementById('gallery-loading');
    const galleryGrid = document.getElementById('gallery-grid-public');
    const errorDiv = document.getElementById('gallery-error');
    const filtersContainer = document.getElementById('gallery-filters');

    // --- Variáveis Globais ---
    let allPhotos = [];
    let categories = [];

    // --- FUNÇÕES DE API (EMBUTIDAS NESTE ARQUIVO) ---

    /**
     * Função genérica para fazer requisições à sua API backend.
     * Assume que CONFIG (de config.js) está disponível globalmente.
     * Como esta é uma página pública, não há manipulação de token de autenticação.
     */
    async function fetchFromLocalAPI(endpoint, options = {}) {
        const url = `${CONFIG.API_URL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'GET', // Apenas GETs para a página pública
                headers: { 'Content-Type': 'application/json', ...options.headers },
                ...options
            });
            if (response.status === 204) return null;
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `Erro do servidor: ${response.status}`);
            }
            return data;
        } catch (error) {
            console.error(`Erro na chamada da API (${url}):`, error);
            throw error; // Re-lança o erro para ser tratado pela função chamadora
        }
    }

    /**
     * Busca a lista de categorias da galeria.
     */
    async function getGalleryCategories() {
        return fetchFromLocalAPI('/galeria/categorias');
    }

    /**
     * Busca a lista de todas as fotos da galeria.
     */
    async function getAllPhotos() {
        return fetchFromLocalAPI('/galeria');
    }
    // --- FIM DAS FUNÇÕES DE API ---


    // --- Funções de UI ---
    function showLoading(show = true) {
        if (loadingDiv) loadingDiv.style.display = show ? 'block' : 'none';
        if (galleryGrid && show) galleryGrid.style.display = 'none';
        if (errorDiv && show) errorDiv.style.display = 'none';
    }

    function showContent() {
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (galleryGrid) galleryGrid.style.display = 'grid';
        if (errorDiv) errorDiv.style.display = 'none';
    }

    function showError(message = "Não foi possível carregar a galeria.") {
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (galleryGrid) galleryGrid.style.display = 'none';
        if (errorDiv) {
            errorDiv.innerHTML = `<p>${message}</p>`;
            errorDiv.style.display = 'block';
        }
    }

    // --- Funções de Renderização ---
    function renderFilters(categoriesData) {
        if (!filtersContainer) return;
        filtersContainer.innerHTML = '<button class="filter-btn active" data-category="TODAS">Todas</button>';

        categoriesData.forEach(cat => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.category = cat.name;
            button.textContent = cat.description;
            filtersContainer.appendChild(button);
        });

        filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.dataset.category;
                const photosToDisplay = (category === 'TODAS') ? allPhotos : allPhotos.filter(p => p.categoria === category);
                renderPhotos(photosToDisplay);
            });
        });
    }

    function renderPhotos(photosToRender) {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';
        if (!photosToRender || photosToRender.length === 0) {
            galleryGrid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Nenhuma foto encontrada para esta categoria.</p>';
            return;
        }

        photosToRender.forEach(photo => {
            const dataUpload = new Date(photo.dataUpload).toLocaleDateString('pt-BR');

            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';

            photoItem.innerHTML = `
            <img src="${photo.url}" alt="${photo.descricao || 'Foto da Galeria'}" class="photo-image" loading="lazy">
            <div class="photo-item-overlay">
                <p class="photo-item-description">${photo.descricao || ''}</p>
                <div class="photo-item-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${dataUpload}</span>
                </div>
            </div>
        `;

            // Adiciona o evento de clique para abrir o lightbox
            photoItem.addEventListener('click', () => openLightbox(photo.url, photo.descricao));

            galleryGrid.appendChild(photoItem);
        });
    }

    function openLightbox(imageUrl, description) {
        Swal.fire({
            imageUrl: imageUrl,
            imageWidth: '90%',
            imageAlt: description || 'Visualização da Imagem',
            title: description || '',
            showCloseButton: true,
            showConfirmButton: false,
            background: 'rgba(0,0,0,0.85)',
            backdrop: `rgba(0,0,0,0.85)`,
            width: 'auto',
            padding: '1em'
        });
    }

    // --- Inicialização da Página ---
    async function init() {
        showLoading(true);
        try {
            const [fetchedCategories, fetchedPhotos] = await Promise.all([
                getGalleryCategories(),
                getAllPhotos()
            ]);

            const categoryDescriptions = {
                'IGREJA': 'Igreja', 'UPH': 'UPH', 'SAF': 'SAF',
                'UMP_UPA': 'UMP/UPA', 'UCP': 'UCP'
            };
            categories = fetchedCategories.map(cat => ({
                name: cat,
                description: categoryDescriptions[cat] || cat.replace(/_/g, ' ')
            }));
            allPhotos = fetchedPhotos || [];

            renderFilters(categories);
            renderPhotos(allPhotos);
            showContent();

        } catch (error) {
            console.error("Erro ao carregar a galeria:", error);
            showError(error.message);
        }
    }
    init();
});