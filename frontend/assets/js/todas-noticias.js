// assets/js/todas-noticias.js

// --- FUNÇÕES DE API E UTILIDADE (EMBUTIDAS NESTE ARQUIVO) ---

/**
 * Função genérica para fazer requisições à API backend.
 * Assume que CONFIG.API_URL e AuthService (com getToken, clearAuthData) estão globais.
 */
async function fazerRequisicao(url, options = {}) {
    // Esta função é uma adaptação da sua, com algumas melhorias para consistência.
    // Ela ainda retorna o objeto Response bruto para GETs públicos,
    // e dados processados ou null para outros casos, o que pode ser inconsistente.
    // Idealmente, ela sempre retornaria dados processados ou lançaria um erro.
    try {
        const isGetRequest = !options.method || options.method.toUpperCase() === 'GET';
        const isPublicNewsEndpoint = url.includes('/noticias/aprovadas'); // Endpoint específico que sabemos ser público

        // Se for uma requisição GET pública, não precisa de token e trata de forma mais simples
        if (isGetRequest && isPublicNewsEndpoint) {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro na requisição (${url}): ${response.status} - ${errorText}`);
            }
            // Para GETs públicos de notícias, retornamos os dados JSON diretamente para simplificar o chamador
            return response.json();
        }

        // Para outros métodos ou GETs que podem ser protegidos
        const token = AuthService.getToken(); // Assumindo que AuthService está global
        if (!token && !url.includes('/auth/login')) { // Se não for login e não tiver token
            console.warn('Token não encontrado para rota protegida, redirecionando para login.');
            AuthService.clearAuthData();
            window.location.replace('../login.html'); // Ajuste o caminho se necessário
            return null; // Interrompe a execução da requisição
        }

        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { ...options, headers: defaultHeaders });

        if (response.status === 204) return null; // No Content

        const responseBody = await response.text();
        let responseData;
        try { responseData = responseBody ? JSON.parse(responseBody) : null; }
        catch (e) { responseData = responseBody; }

        if (!response.ok) {
            console.error(`Erro na API (${url}): Status ${response.status}`, responseData);
            if ((response.status === 401 || response.status === 403) && !url.includes('/auth/login')) {
                AuthService.clearAuthData();
                window.location.replace('../login.html');
            }
            const errorMessage = (responseData && responseData.message) ? responseData.message : `Erro ${response.status}`;
            throw new Error(errorMessage);
        }
        return responseData; // Retorna dados processados para rotas protegidas/POST/PUT/DELETE
    } catch (error) {
        console.error(`Exceção na requisição para ${url}:`, error);
        throw error; // Re-lança para que a função chamadora possa tratar
    }
}

function mostrarMensagem(mensagem, tipo) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            text: mensagem, icon: tipo, toast: true, position: 'top-end',
            showConfirmButton: false, timer: tipo === 'error' ? 4000 : 3000, timerProgressBar: true
        });
    } else {
        alert(mensagem);
    }
}
// --- FIM DAS FUNÇÕES DE API E UTILIDADE ---


document.addEventListener('DOMContentLoaded', async () => {
    // --- Elementos DOM ---
    const loadingDiv = document.getElementById('all-news-loading');
    const newsContainer = document.getElementById('all-news-container');
    const errorDiv = document.getElementById('all-news-error');
    const paginationControls = document.getElementById('all-news-pagination');
    const loadMoreBtn = document.getElementById('btn-load-more-news');

    // --- Estado da Paginação Frontend ---
    let todasAsNoticiasArmazenadas = [];
    let currentPageFrontend = 0;
    const pageSizeFrontend = 9;
    let isLoadingMoreFrontend = false;

    // --- Funções de UI Auxiliares (específicas desta página) ---
    function showPageLoading(show = true) {
        if (loadingDiv) loadingDiv.style.display = show ? 'block' : 'none';
        if (show && newsContainer) newsContainer.style.display = 'none';
        if (show && paginationControls) paginationControls.style.display = 'none';
        if (show && errorDiv) errorDiv.style.display = 'none';
    }
    function showPageContent() {
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (newsContainer) newsContainer.style.display = 'grid';
        if (errorDiv) errorDiv.style.display = 'none';
        if (paginationControls && todasAsNoticiasArmazenadas.length > 0) {
            paginationControls.style.display = 'block';
        } else if (paginationControls) {
            paginationControls.style.display = 'none';
        }
    }
    function showPageError(message = "Não foi possível carregar as notícias.") {
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (newsContainer) newsContainer.style.display = 'none';
        if (paginationControls) paginationControls.style.display = 'none';
        if (errorDiv) {
            errorDiv.innerHTML = `<p>${message}</p>`;
            errorDiv.style.display = 'block';
        }
    }

    // --- Função para Criar Card de Notícia ---
    function criarCardNoticiaParaTodas(noticia, globalIndex) {
        const data = new Date(noticia.dataCriacao);
        const dia = data.getDate();
        const mes = data.toLocaleString('pt-BR', {month: 'short'}).replace('.', '');
        const ano = data.getFullYear();
        const delay = globalIndex * 0.05;
        // ATENÇÃO: Ajuste o href para sua página de detalhe da notícia
        // Se a página todas-noticias.html estiver em /pages/, o link deve ser relativo a ela.
        const detalheNoticiaUrl = `./noticias.html?id=${noticia.id}`;
        // Se todas-noticias.html estiver na raiz do frontend e noticia-detalhe.html em /pages/
        // const detalheNoticiaUrl = `./pages/noticia-detalhe.html?id=${noticia.id}`;

        return `
            <article class="news-card" style="animation-delay: ${delay}s; background-image: url('${noticia.imagemUrl || 'https://placehold.co/600x400/0b6636/ffffff?text=IPV1'}')">
                <div class="news-overlay"></div>
                <div class="calendar-date">
                    <span class="calendar-day">${dia}</span>
                    <span class="calendar-month">${mes}</span>
                    <span class="calendar-year">${ano}</span>
                </div>
                <div class="news-content">
                    <h3 class="news-title">${noticia.titulo}</h3>
                    <p class="news-excerpt">${(noticia.conteudo || '').replace(/<[^>]*>/g, '').slice(0, 100)}...</p>
                    <a href="${detalheNoticiaUrl}" class="news-read-more">
                        Ler Mais <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </article>
        `;
    }

    // --- Carregar Todas as Notícias do Backend UMA VEZ ---
    async function carregarTodasAsNoticiasDoBackend() {
        showPageLoading(true);
        if (newsContainer) newsContainer.innerHTML = '';
        if (paginationControls && loadMoreBtn) {
            loadMoreBtn.textContent = 'Carregar Mais Notícias';
            loadMoreBtn.disabled = false;
            paginationControls.style.display = 'none';
        }

        try {
            // Usa a função fazerRequisicao embutida
            const noticias = await fazerRequisicao(`${CONFIG.API_URL}/noticias/aprovadas`, { method: 'GET' });
            todasAsNoticiasArmazenadas = noticias || [];
            currentPageFrontend = 0;

            if (todasAsNoticiasArmazenadas.length === 0) {
                if (newsContainer) newsContainer.innerHTML = '<p style="text-align:center; width:100%;">Nenhuma notícia encontrada.</p>';
                if (paginationControls) paginationControls.style.display = 'none';
            } else {
                renderNextPageFrontend();
            }
            showPageContent();

        } catch (error) {
            console.error('Erro ao carregar todas as notícias do backend:', error);
            showPageError(error.message || "Falha ao buscar notícias do servidor.");
        }
    }

    // --- Renderizar a Próxima "Página" de Notícias do Array Armazenado ---
    function renderNextPageFrontend() {
        if (isLoadingMoreFrontend || !newsContainer) return;
        isLoadingMoreFrontend = true;
        if (loadMoreBtn) {
            loadMoreBtn.textContent = 'Carregando...';
            loadMoreBtn.disabled = true;
        }

        const startIndex = currentPageFrontend * pageSizeFrontend;
        const endIndex = startIndex + pageSizeFrontend;
        const noticiasDaPagina = todasAsNoticiasArmazenadas.slice(startIndex, endIndex);

        if (noticiasDaPagina.length > 0) {
            noticiasDaPagina.forEach((noticia, index) => {
                const globalIndex = startIndex + index;
                newsContainer.innerHTML += criarCardNoticiaParaTodas(noticia, globalIndex);
            });
            currentPageFrontend++;
        }

        if (endIndex >= todasAsNoticiasArmazenadas.length) {
            if (loadMoreBtn) {
                loadMoreBtn.textContent = 'Todas as notícias carregadas';
                loadMoreBtn.disabled = true;
            }
            if (paginationControls && todasAsNoticiasArmazenadas.length > 0) {
                // Opcional: paginationControls.style.display = 'none';
            }
        } else {
            if (loadMoreBtn) {
                loadMoreBtn.textContent = 'Carregar Mais Notícias';
                loadMoreBtn.disabled = false;
            }
        }
        isLoadingMoreFrontend = false;
        if (paginationControls && todasAsNoticiasArmazenadas.length > 0) {
            paginationControls.style.display = 'block';
        }
        if (currentPageFrontend === 0 && noticiasDaPagina.length === 0 && todasAsNoticiasArmazenadas.length === 0) {
            // Não faz nada, já tratado em carregarTodasAsNoticiasDoBackend
        } else if (newsContainer.style.display === 'none') { // Se o container ainda estiver escondido
            showPageContent();
        }
    }

    // --- Inicialização da Página ---
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', renderNextPageFrontend);
    } else if (paginationControls) {
        paginationControls.style.display = 'none';
        console.warn("Botão 'btn-load-more-news' não encontrado.");
    }

    // Lógica de Autenticação (adaptada do seu liturgias.js)
    // Se esta página for pública, esta verificação pode não ser necessária
    // ou pode ser usada para mostrar/esconder funcionalidades de admin (improvável aqui).
    if (typeof AuthService !== 'undefined' && !AuthService.isAuthenticated() && !window.location.pathname.includes('login.html')) {
        // Se esta página NÃO É PÚBLICA e o usuário não está autenticado, redireciona.
        // Se for pública, remova este if.
        // Para uma lista de notícias públicas, este if provavelmente não é necessário.
        // window.location.replace('../login.html'); // Ajuste se necessário
        // return; // Interrompe a execução se redirecionar
    }

    await carregarTodasAsNoticiasDoBackend();

    // --- Lógica de Banner e Botão Voltar ao Topo ---
    const constructionBanner = document.getElementById('constructionBanner');
    const closeCtaBannerBtn = document.getElementById('closeCtaBannerBtn');
    const mainHeader = document.getElementById('mainHeader');

    function adjustHeaderTop() {
        if (mainHeader && constructionBanner && getComputedStyle(constructionBanner).display !== 'none' && !constructionBanner.classList.contains('hidden')) {
            mainHeader.style.top = `${constructionBanner.offsetHeight}px`;
        } else if (mainHeader) {
            mainHeader.style.top = '0px';
        }
    }
    function showConstructionBanner() {
        if (constructionBanner) {
            const dismissed = localStorage.getItem('constructionBannerDismissed_v1');
            if (!dismissed) {
                constructionBanner.style.display = 'flex';
                constructionBanner.classList.remove('hidden');
            } else {
                constructionBanner.style.display = 'none';
            }
            adjustHeaderTop();
            if (!constructionBanner.dataset.listenerAttached) {
                constructionBanner.addEventListener('transitionend', adjustHeaderTop);
                constructionBanner.dataset.listenerAttached = 'true';
            }
        } else {
            adjustHeaderTop();
        }
    }
    function hideConstructionBanner() {
        if (constructionBanner) {
            constructionBanner.classList.add('hidden');
            localStorage.setItem('constructionBannerDismissed_v1', 'true');
        }
    }
    if (closeCtaBannerBtn) {
        closeCtaBannerBtn.addEventListener('click', hideConstructionBanner);
    }
    showConstructionBanner();
    window.addEventListener('resize', adjustHeaderTop);

    const backToTopBtn = document.getElementById('backToTop'); // Certifique-se do ID correto no HTML
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300 || document.documentElement.scrollTop > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});