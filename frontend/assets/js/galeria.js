document.addEventListener('DOMContentLoaded', async () => {
    // --- Seletores DOM ---
    const galleryGrid = document.getElementById('galleryGrid');
    const categoryTabsContainer = document.getElementById('categoryTabs');

    // --- Variáveis Globais ---
    let allPhotos = [];
    let categories = [];

    // --- FUNÇÕES DE API (Embutidas) ---
    // (Assume que CONFIG e AuthService estão disponíveis globalmente)
    async function fetchFromApi(endpoint, options = {}) {
        const url = `${CONFIG.API_URL}${endpoint}`;
        const token = AuthService.getToken();
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(url, { ...options, headers });
            if (response.status === 204) return null;
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || `Erro ${response.status}`);
            return data;
        } catch (error) {
            console.error(`API Error (${url}):`, error);
            mostrarMensagem(error.message, 'error');
            throw error;
        }
    }

    async function uploadToApi(endpoint, formData) { // Para upload de arquivo
        const url = `${CONFIG.API_URL}${endpoint}`;
        const token = AuthService.getToken();
        const headers = { ...formData.headers }; // O navegador define o Content-Type para multipart/form-data
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(url, { method: 'POST', body: formData, headers: headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || `Erro ${response.status}`);
            return data;
        } catch (error) {
            console.error(`API Upload Error (${url}):`, error);
            mostrarMensagem(error.message, 'error');
            throw error;
        }
    }

    // --- Funções de Renderização ---
    function renderPhotos(photosToRender) {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';
        if (!photosToRender || photosToRender.length === 0) {
            galleryGrid.innerHTML = '<p style="text-align:center; width:100%;">Nenhuma foto encontrada para esta categoria.</p>';
            return;
        }
        // Ordena as fotos pela data de upload mais recente
        photosToRender.sort((a,b) => new Date(b.dataUpload) - new Date(a.dataUpload));

        photosToRender.forEach(photo => {
            galleryGrid.innerHTML += createPhotoCard(photo);
        });
    }

    function createPhotoCard(photo) {
        const dataUpload = new Date(photo.dataUpload).toLocaleDateString('pt-BR');
        // Encontra a descrição da categoria a partir do array 'categories'
        const categoriaInfo = categories.find(c => c.name === photo.categoria);
        const categoriaDesc = categoriaInfo ? categoriaInfo.description : photo.categoria.replace(/_/g, ' ');

        return `
            <div class="photo-card" data-id="${photo.id}">
                <div class="photo-image-container" onclick="openLightbox('${photo.url}')">
                    <img src="${photo.url}" alt="${photo.descricao || 'Foto da Galeria'}" class="photo-image" loading="lazy">
                </div>
                <div class="photo-info">
                    <p class="photo-description">${photo.descricao || 'Sem descrição'}</p>
                    <div class="photo-meta">
                        <span><i class="fas fa-calendar-alt"></i> ${dataUpload}</span>
                        <span><i class="fas fa-tag"></i> ${categoriaDesc}</span>
                    </div>
                </div>
                ${isPastor() ? `
                    <div class="photo-actions">
                        <button class="btn-delete" onclick="confirmDeletePhoto(${photo.id})" title="Excluir Foto"><i class="fas fa-trash"></i></button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // NOVA FUNÇÃO para centralizar a lógica de filtragem e renderização
    function filtrarErenderizarFotos() {
        if (!categoryTabsContainer) return;
        const activeTab = categoryTabsContainer.querySelector('.tab-btn.active');
        const category = activeTab ? activeTab.dataset.category : 'TODAS';
        const photosToDisplay = (category === 'TODAS') ? allPhotos : allPhotos.filter(p => p.categoria === category);
        renderPhotos(photosToDisplay);
    }

    function renderCategoryTabs(categoriesData) {
        if (!categoryTabsContainer) return;
        categoryTabsContainer.innerHTML = '<button class="tab-btn active" data-category="TODAS">Todas</button>';

        categoriesData.forEach(cat => {
            const button = document.createElement('button');
            button.className = 'tab-btn';
            button.dataset.category = cat.name;
            button.textContent = cat.description;
            categoryTabsContainer.appendChild(button);
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filtrarErenderizarFotos(); // Chama a função centralizada
            });
        });
    }

    // --- Lógica de Ações ---
    async function abrirModalNovaFoto() {
        if (!isPastor()) {
            mostrarMensagem("Você não tem permissão para adicionar fotos.", "error");
            return;
        }

        const categoriesOptionsHtml = categories
            .map(cat => `<option value="${cat.name}">${cat.description}</option>`)
            .join('');

        const { value: formValues, isConfirmed } = await Swal.fire({
            title: 'Adicionar Nova Foto',
            html: `
                <div style="text-align: left;">
                    <label for="swal-file" class="swal2-label">Arquivo da Imagem (JPEG ou PNG):</label>
                    <input id="swal-file" type="file" class="swal2-file" accept="image/jpeg, image/png" required>
                    
                    <div id="image-preview-container" style="margin-top: 15px; text-align: center;">
                        <img id="image-preview" src="#" alt="Pré-visualização" style="max-width: 100%; max-height: 200px; border-radius: 5px; border: 1px solid #555; display: none;" />
                    </div>
                    
                    <label for="swal-category" class="swal2-label">Categoria:</label>
                    <select id="swal-category" class="swal2-select" required>
                        <option value="">Selecione a categoria...</option>
                        ${categoriesOptionsHtml}
                    </select>
                    
                    <label for="swal-description" class="swal2-label">Descrição (opcional):</label>
                    <textarea id="swal-description" class="swal2-textarea" placeholder="Breve descrição da foto..." maxlength="250"></textarea>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-upload"></i> Enviar',
            cancelButtonText: 'Cancelar',
            width: '600px',
            didOpen: () => {
                const fileInput = document.getElementById('swal-file');
                const imagePreview = document.getElementById('image-preview');
                fileInput.addEventListener('change', function() {
                    if (this.files && this.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            imagePreview.src = e.target.result;
                            imagePreview.style.display = 'block';
                        }
                        reader.readAsDataURL(this.files[0]);
                    }
                });
            },
            preConfirm: () => {
                const fileInput = document.getElementById('swal-file');
                if (fileInput.files.length === 0) {
                    Swal.showValidationMessage('Por favor, selecione um arquivo de imagem.');
                    return false;
                }
                if (!document.getElementById('swal-category').value) {
                    Swal.showValidationMessage('Por favor, selecione uma categoria.');
                    return false;
                }
                return {
                    file: fileInput.files[0],
                    categoria: document.getElementById('swal-category').value,
                    descricao: document.getElementById('swal-description').value
                };
            }
        });

        if (isConfirmed && formValues) {
            try {
                Swal.showLoading();
                const formData = new FormData();
                formData.append('imagem', formValues.file);
                formData.append('categoria', formValues.categoria);
                formData.append('descricao', formValues.descricao);

                const novaFoto = await uploadToApi('/galeria', formData);
                Swal.close();
                mostrarMensagem('Foto enviada com sucesso!', 'success');

                // --- ATUALIZAÇÃO AUTOMÁTICA ---
                allPhotos.unshift(novaFoto); // Adiciona a nova foto ao início do array
                filtrarErenderizarFotos();   // Re-renderiza a galeria
            } catch (error) {
                Swal.close();
                mostrarMensagem(`Erro ao enviar foto: ${error.message}`, 'error');
            }
        }
    }

    async function confirmDeletePhoto(photoId) {
        if (!isPastor()) return;
        const result = await Swal.fire({
            title: 'Tem certeza?', text: "A foto será excluída permanentemente!", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!', cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                Swal.showLoading();
                await fetchFromApi(`/galeria/${photoId}`, { method: 'DELETE' });
                Swal.close();
                mostrarMensagem('Foto excluída com sucesso!', 'success');

                // --- ATUALIZAÇÃO AUTOMÁTICA ---
                const cardToRemove = document.querySelector(`.photo-card[data-id='${photoId}']`);
                if (cardToRemove) {
                    cardToRemove.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    cardToRemove.style.opacity = '0';
                    cardToRemove.style.transform = 'scale(0.9)';
                    setTimeout(() => cardToRemove.remove(), 300);
                }
                allPhotos = allPhotos.filter(p => p.id !== photoId);
            } catch (error) {
                Swal.close();
                mostrarMensagem(`Erro ao excluir foto: ${error.message}`, 'error');
            }
        }
    }

    function openLightbox(imageUrl) {
        Swal.fire({
            imageUrl: imageUrl, imageWidth: '90%', imageAlt: 'Visualização da Imagem',
            showCloseButton: true, showConfirmButton: false,
            background: 'rgba(0,0,0,0.85)', backdrop: `rgba(0,0,0,0.8)`
        });
    }

    function isPastor() {
        const user = (typeof AuthService !== 'undefined') ? AuthService.getUser() : null;
        return user && user.cargo === 'PASTOR';
    }

    // --- Inicialização da Página ---
    async function init() {
        if (!galleryGrid || !categoryTabsContainer) {
            console.error("Elementos essenciais da galeria não encontrados.");
            return;
        }
        try {
            Swal.showLoading();
            const [fetchedCategories, fetchedPhotos] = await Promise.all([
                fetchFromApi('/galeria/categorias'),
                fetchFromApi('/galeria')
            ]);

            // Mapeia o Enum do backend para um objeto mais descritivo
            const categoryDescriptions = {
                'IGREJA': 'Igreja',
                'UPH': 'UPH',
                'SAF': 'SAF',
                'UMP_UPA': 'UMP/UPA',
                'UCP': 'UCP'
            };
            categories = fetchedCategories.map(cat => ({
                name: cat,
                description: categoryDescriptions[cat] || cat.replace(/_/g, ' ')
            }));

            allPhotos = fetchedPhotos || [];

            renderCategoryTabs(categories);
            renderPhotos(allPhotos); // Renderiza todas as fotos inicialmente
            Swal.close();
        } catch (error) {
            Swal.close();
            galleryGrid.innerHTML = '<p class="error-message">Falha ao carregar a galeria. Tente recarregar a página.</p>';
        }
    }

    // Expondo funções para onclicks no HTML
    window.abrirModalNovaFoto = abrirModalNovaFoto;
    window.confirmDeletePhoto = confirmDeletePhoto;
    window.openLightbox = openLightbox;

    // Lógica do menu, logout, etc.
    const logoutBtnDesktop = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    if (logoutBtnDesktop && typeof AuthService !== 'undefined') logoutBtnDesktop.addEventListener('click', () => AuthService.logout());
    if (logoutBtnMobile && typeof AuthService !== 'undefined') logoutBtnMobile.addEventListener('click', () => AuthService.logout());

    init();
});