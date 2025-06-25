// assets/js/visualizar-liturgia.js

document.addEventListener('DOMContentLoaded', async () => {
    // Elementos da página principal de listagem
    const mainLoadingDiv = document.getElementById('public-liturgy-loading');
    const mainContentContainer = document.getElementById('liturgies-by-month-container');
    const mainErrorDiv = document.getElementById('public-liturgy-error');
    const mainPageTitle = document.getElementById('main-page-title');
    const mainPageSubtitle = document.getElementById('main-page-subtitle');

    // Elementos do Modal de Detalhe da Liturgia
    const liturgyDetailModal = document.getElementById('liturgyDetailModal');
    const closeDetailModalBtn = document.querySelector('.close-liturgy-detail-modal');
    const modalTitleEl = document.getElementById('modal-liturgy-title');
    const modalDateEl = document.getElementById('modal-liturgy-date');
    const modalDescriptionEl = document.getElementById('modal-liturgy-description');
    const modalBibleVersionEl = document.getElementById('modal-liturgy-bible-version');
    const modalItemsContainer = document.getElementById('modal-liturgy-items-container');

    // Elementos para o texto bíblico embutido no modal da liturgia
    const verseEmbedContainer = document.getElementById('modal-item-verse-text-container');
    const verseEmbedTitle = document.getElementById('modal-item-verse-title');
    const verseEmbedBody = document.getElementById('modal-item-verse-body');
    const closeVerseEmbedBtn = document.getElementById('close-verse-embed-btn');

    let todasAsLiturgiasGlobais = [];
    let versoesLocaisGlobais = [];
    let livrosLocaisGlobais = [];

    // Event Listeners dos Modais
    if (closeDetailModalBtn) {
        closeDetailModalBtn.onclick = () => hideLiturgyDetailModal();
    }
    if (liturgyDetailModal) {
        liturgyDetailModal.onclick = function(event) {
            if (event.target === liturgyDetailModal) { // Só fecha se clicar no backdrop
                hideLiturgyDetailModal();
            }
        }
    }
    if (closeVerseEmbedBtn) {
        closeVerseEmbedBtn.onclick = () => {
            if(verseEmbedContainer) {
                verseEmbedContainer.classList.remove('visible');
                setTimeout(() => {
                    if(verseEmbedContainer) verseEmbedContainer.style.display = 'none';
                }, 300); // Tempo da transição CSS (se houver)
            }
        }
    }

    function showMainLoading() {
        if(mainLoadingDiv) mainLoadingDiv.style.display = 'block';
        if(mainContentContainer) mainContentContainer.style.display = 'none';
        if(mainErrorDiv) mainErrorDiv.style.display = 'none';
    }

    function showMainContent() {
        if(mainLoadingDiv) mainLoadingDiv.style.display = 'none';
        if(mainContentContainer) mainContentContainer.style.display = 'block';
        if(mainErrorDiv) mainErrorDiv.style.display = 'none';
    }

    function showMainError() {
        if(mainLoadingDiv) mainLoadingDiv.style.display = 'none';
        if(mainContentContainer) mainContentContainer.style.display = 'none';
        if(mainErrorDiv) mainErrorDiv.style.display = 'block';
    }

    function hideLiturgyDetailModal() {
        if(liturgyDetailModal) {
            liturgyDetailModal.classList.remove('active'); // Para animação de fade-out
            setTimeout(() => {
                if(liturgyDetailModal) liturgyDetailModal.style.display = 'none';
            }, 300); // Deve corresponder à duração da transição em CSS
        }
        if(verseEmbedContainer) { // Também esconde o embed de versículo
            verseEmbedContainer.classList.remove('visible');
            verseEmbedContainer.style.display = 'none';
        }
        document.body.style.overflow = '';
        if (window.location.search.includes('id=')) {
            history.pushState(null, '', window.location.pathname);
        }
    }

    async function fetchAndDisplayAllLiturgies() {
        showMainLoading();
        try {
            // Carrega todos os dados necessários em paralelo
            const [liturgiasResponse, versoesResponse, livrosResponse] = await Promise.all([
                getLiturgias(), getBibleVersionsLocal(), getBibleBooksLocal()
            ]);

            todasAsLiturgiasGlobais = liturgiasResponse || [];
            versoesLocaisGlobais = versoesResponse || [];
            livrosLocaisGlobais = livrosResponse || [];

            if (!mainContentContainer) {
                console.error("Container principal de conteúdo não encontrado.");
                showMainError(); return;
            }
            mainContentContainer.innerHTML = ''; // Limpa antes de adicionar

            if (todasAsLiturgiasGlobais.length === 0) {
                mainContentContainer.innerHTML = '<p style="text-align:center;">Nenhuma liturgia encontrada.</p>';
                showMainContent();
                return;
            }

            const liturgiesByMonth = todasAsLiturgiasGlobais.reduce((acc, liturgy) => {
                // ... (lógica de agrupamento como antes) ...
                const date = new Date(liturgy.data + "T00:00:00");
                const monthYear = `${date.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' })} de ${date.getUTCFullYear()}`;
                if (!acc[monthYear]) acc[monthYear] = [];
                acc[monthYear].push(liturgy);
                return acc;
            }, {});

            const sortedMonthYears = Object.keys(liturgiesByMonth).sort((a, b) => {
                // ... (lógica de ordenação de meses como antes) ...
                const parseMonthYear = (myStr) => {
                    const parts = myStr.split(' de ');
                    const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
                    return new Date(parseInt(parts[1]), monthNames.indexOf(parts[0].toLowerCase()));
                };
                return parseMonthYear(b) - parseMonthYear(a);
            });

            let animationDelay = 0;
            for (const monthYear of sortedMonthYears) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'month-group';
                groupDiv.style.animationDelay = `${animationDelay}s`; // Para efeito cascata no CSS
                animationDelay += 0.15;
                groupDiv.innerHTML = `<h2 class="month-group-header">${monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}</h2>`;

                const ul = document.createElement('ul');
                ul.style.listStyleType = 'none'; ul.style.paddingLeft = '0';
                liturgiesByMonth[monthYear].sort((a,b) => new Date(b.data) - new Date(a.data));

                liturgiesByMonth[monthYear].forEach(liturgy => {
                    const li = document.createElement('li');
                    li.className = 'liturgy-list-entry';
                    li.dataset.liturgyId = liturgy.id; // Armazena o ID para o evento de clique
                    li.innerHTML = `
                        <div class="liturgy-item-info">
                            <h3>${liturgy.titulo}</h3>
                            <p class="date">Data: ${new Date(liturgy.data + "T00:00:00").toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                        </div>
                        <div class="liturgy-item-actions">
                            <button class="btn-view-liturgy"><i class="fas fa-eye"></i> Ver Detalhes</button>
                        </div>
                    `;
                    // Adiciona o event listener à LI inteira ou especificamente ao botão
                    li.addEventListener('click', () => displayLiturgyInModal(liturgy.id));
                    ul.appendChild(li);
                });
                groupDiv.appendChild(ul);
                mainContentContainer.appendChild(groupDiv);
            }
            showMainContent();
        } catch (error) {
            console.error("Erro ao carregar todas as liturgias:", error);
            if(mainPageSubtitle) mainPageSubtitle.textContent = "Ocorreu um erro ao carregar as liturgias.";
            showMainError();
        }
    }

    async function displayLiturgyInModal(liturgiaId) {
        if(!liturgyDetailModal || !modalTitleEl || !modalItemsContainer) {
            console.error("Elementos do modal de detalhe da liturgia não foram encontrados!");
            return;
        }

        // Limpa e mostra loading no modal
        modalTitleEl.textContent = 'Carregando Liturgia...';
        if(modalDateEl) modalDateEl.textContent = '';
        if(modalDescriptionEl) modalDescriptionEl.textContent = '';
        if(modalBibleVersionEl) modalBibleVersionEl.textContent = '';
        modalItemsContainer.innerHTML = '<div class="loading-indicator"><p>Carregando itens...</p></div>';
        if(verseEmbedContainer) {
            verseEmbedContainer.classList.remove('visible');
            verseEmbedContainer.style.display = 'none';
        }

        liturgyDetailModal.style.display = 'flex'; // Torna o modal (backdrop) visível
        setTimeout(() => liturgyDetailModal.classList.add('active'), 10); // Ativa animação de entrada
        document.body.style.overflow = 'hidden';

        try {
            // Garante que dados globais de versões/livros estejam carregados
            if (versoesLocaisGlobais.length === 0 || livrosLocaisGlobais.length === 0) {
                console.log("Carregando dados de versões e livros para o modal...");
                const [versoes, livros] = await Promise.all([getBibleVersionsLocal(), getBibleBooksLocal()]);
                versoesLocaisGlobais = versoes || [];
                livrosLocaisGlobais = livros || [];
            }

            const liturgiaData = await getLiturgyById(liturgiaId);

            if (!liturgiaData) throw new Error(`Liturgia com ID ${liturgiaId} não encontrada.`);

            document.title = `${liturgiaData.titulo} - Liturgia IPV1`;
            modalTitleEl.textContent = liturgiaData.titulo;
            if(modalDateEl) modalDateEl.textContent = `Data: ${new Date(liturgiaData.data + "T00:00:00").toLocaleDateString('pt-BR', {timeZone: 'UTC'})}`;
            if(modalDescriptionEl) modalDescriptionEl.textContent = liturgiaData.descricao || '';
            const versaoInfo = versoesLocaisGlobais.find(v => v.enumNome === liturgiaData.versaoBibliaPadrao);
            if(modalBibleVersionEl) modalBibleVersionEl.textContent = `Versão Bíblica: ${versaoInfo ? versaoInfo.nomeCompleto : liturgiaData.versaoBibliaPadrao}`;

            modalItemsContainer.innerHTML = ''; // Limpa o container de itens

            if (liturgiaData.itens && liturgiaData.itens.length > 0) {
                liturgiaData.itens.sort((a,b) => a.ordem - b.ordem).forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('liturgy-item-card', `tipo-${item.tipo.toLowerCase().replace(/_/g, '')}`);
                    let contentHtml = '';

                    switch (item.tipo) {
                        // ... (cases para TITULO_SECAO, TEXTO_SIMPLES, HINO como antes) ...
                        case 'TITULO_SECAO':
                            contentHtml = `<h3>${item.conteudoTextual || 'Título da Seção'}</h3>`;
                            break;
                        case 'TEXTO_SIMPLES': case 'ANUNCIO': case 'ORACAO_COMUNITARIA':
                            contentHtml = `<div class="item-text-content"><p>${(item.conteudoTextual || '').replace(/\n/g, '<br>')}</p></div>`;
                            break;
                        case 'HINO':
                            const hinoParts = (item.conteudoTextual || '').split('-');
                            const hinoNome = hinoParts[0] ? hinoParts[0].trim() : 'Hino';
                            const hinoDetalhe = hinoParts[1] ? hinoParts[1].trim() : '';
                            contentHtml = `<div class="hino-content"><p class="hino-title">${hinoNome}</p>${hinoDetalhe ? `<p class="hino-number">${hinoDetalhe}</p>` : ''}</div>`;
                            break;
                        case 'REFERENCIA_BIBLICA':
                            const referenciaText = item.referenciaDisplayFormatada || `${item.livroBiblia} ${item.capituloBiblia}:${item.versiculoInicioBiblia}`;

                            const refLink = document.createElement('a');
                            refLink.href = '#';
                            refLink.classList.add('reference-text-display');
                            refLink.innerHTML = `<i class="fas fa-book-open"></i> ${referenciaText}`; // Ícone de livro aberto

                            const accordionContent = document.createElement('div');
                            accordionContent.classList.add('bible-text-accordion-content');
                            // accordionContent.id = `bible-text-embed-${liturgiaId}-${item.ordem}`; // ID único se necessário

                            refLink.addEventListener('click', async (e) => {
                                e.preventDefault();
                                refLink.classList.toggle('active'); // Para estilizar o link quando ativo
                                const isOpen = accordionContent.classList.toggle('open');

                                if (isOpen && accordionContent.innerHTML === '') { // Carrega só na primeira vez que abre
                                    accordionContent.innerHTML = '<div class="loading-indicator" style="padding:10px 0;"><p>Carregando...</p></div>';
                                    await displayBibleVerseInAccordion(
                                        liturgiaData.versaoBibliaPadrao, item.livroBiblia,
                                        item.capituloBiblia, item.versiculoInicioBiblia, item.versiculoFimBiblia,
                                        accordionContent // Passa o container do texto
                                    );
                                } else if (!isOpen) {
                                    // Se quiser limpar o conteúdo ao fechar para recarregar sempre:
                                    // accordionContent.innerHTML = '';
                                }
                            });
                            itemDiv.appendChild(refLink);
                            itemDiv.appendChild(accordionContent); // Adiciona o container do accordion
                            break;
                        default:
                            contentHtml = `<p><em>Item: ${item.conteudoTextual || ''}</em></p>`;
                    }
                    if (item.tipo !== 'REFERENCIA_BIBLICA') { itemDiv.innerHTML = contentHtml; }
                    if(modalItemsContainer) modalItemsContainer.appendChild(itemDiv);
                });
            } else {
                modalItemsContainer.innerHTML = '<p style="text-align:center;">Nenhum item nesta liturgia.</p>';
            }
        } catch (error) {
            console.error("Erro ao exibir detalhes da liturgia no modal:", error);
            if(modalTitleEl) modalTitleEl.textContent = 'Erro ao Carregar Liturgia';
            if(modalItemsContainer) modalItemsContainer.innerHTML = `<p class="error-message">${error.message || 'Não foi possível carregar os itens.'}</p>`;
        }
    }

    // NOVA função para popular o conteúdo do accordion
    async function displayBibleVerseInAccordion(versaoEnumNome, livroEnumNome, capitulo, vInicio, vFim, targetDiv) {
        const versaoSelecionada = versoesLocaisGlobais.find(v => v.enumNome === versaoEnumNome);
        const livroSelecionado = livrosLocaisGlobais.find(l => l.enumNome === livroEnumNome);

        if (!versaoSelecionada || !livroSelecionado) {
            targetDiv.innerHTML = '<p class="error-message" style="padding:10px;">Erro: Dados de versão/livro.</p>';
            return;
        }
        const siglaVersaoApi = versaoSelecionada.siglaApi;
        const abrevLivroApi = livroSelecionado.abrevApi;

        try {
            const versiculosArray = await fetchVerseRangeFromBibleDigital(siglaVersaoApi, abrevLivroApi, capitulo, vInicio, vFim || vInicio);
            if (versiculosArray && versiculosArray.length > 0) {
                targetDiv.innerHTML = `<div class="verse-text-display">` +
                    versiculosArray.map(v => `<p class="verse"><sup>${v.number}</sup> ${v.text}</p>`).join('') +
                    `</div>`;
            } else {
                targetDiv.innerHTML = '<p style="padding:10px;">Texto bíblico não encontrado.</p>';
            }
        } catch (error) {
            console.error("Erro ao buscar versículos para accordion:", error);
            targetDiv.innerHTML = `<p class="error-message" style="padding:10px;">Falha ao carregar: ${error.message}</p>`;
        }
    }

    async function displayBibleVerseInEmbed(versaoEnumNome, livroEnumNome, capitulo, vInicio, vFim, referenciaDisplay) {
        if(!verseEmbedContainer || !verseEmbedTitle || !verseEmbedBody) { return; }

        verseEmbedTitle.textContent = referenciaDisplay || "Texto Bíblico";
        verseEmbedBody.innerHTML = '<div class="loading-indicator" style="padding:10px 0;"><p>Carregando...</p></div>';
        verseEmbedContainer.style.display = 'block';
        setTimeout(() => verseEmbedContainer.classList.add('visible'), 10);

        const versaoSelecionada = versoesLocaisGlobais.find(v => v.enumNome === versaoEnumNome);
        const livroSelecionado = livrosLocaisGlobais.find(l => l.enumNome === livroEnumNome);

        if (!versaoSelecionada || !livroSelecionado) {
            verseEmbedBody.innerHTML = '<p class="error-message">Erro: Configuração de versão/livro inválida.</p>';
            return;
        }
        const siglaVersaoApi = versaoSelecionada.siglaApi;
        const abrevLivroApi = livroSelecionado.abrevApi;

        try {
            const versiculosArray = await fetchVerseRangeFromBibleDigital(siglaVersaoApi, abrevLivroApi, capitulo, vInicio, vFim || vInicio);
            if (versiculosArray && versiculosArray.length > 0) {
                verseEmbedBody.innerHTML = `<div class="verse-text-display">` +
                    versiculosArray.map(v => `<p class="verse"><sup>${v.number}</sup> ${v.text}</p>`).join('') +
                    `</div>`;
            } else {
                verseEmbedBody.innerHTML = '<p>Texto bíblico não encontrado.</p>';
            }
        } catch (error) {
            console.error("Erro ao buscar versículos para embed:", error);
            verseEmbedBody.innerHTML = `<p class="error-message">Falha ao carregar texto: ${error.message}</p>`;
        }
    }

    // Inicialização da Página
    const params = new URLSearchParams(window.location.search);
    const directLiturgyId = params.get('id');

    if (directLiturgyId) {
        if(mainPageTitle) mainPageTitle.textContent = "Detalhes da Liturgia";
        if(mainPageSubtitle) mainPageSubtitle.style.display = 'none';
        if(mainContentContainer) mainContentContainer.style.display = 'none';
        if(mainLoadingDiv) mainLoadingDiv.style.display = 'none';
        displayLiturgyInModal(directLiturgyId);
    } else {
        fetchAndDisplayAllLiturgies();
    }

    // ... (Sua lógica de banner e botão voltar ao topo como antes) ...
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
                constructionBanner.style.display = 'flex'; // Ou o display original do banner
                constructionBanner.classList.remove('hidden');
            } else {
                constructionBanner.style.display = 'none';
            }
            adjustHeaderTop();
            // Adiciona um listener para o evento de transição do banner, se houver
            constructionBanner.addEventListener('transitionend', adjustHeaderTop);
        } else {
            adjustHeaderTop(); // Garante que o header está correto mesmo sem banner
        }
    }
    function hideConstructionBanner() {
        if (constructionBanner) {
            constructionBanner.classList.add('hidden');
            localStorage.setItem('constructionBannerDismissed_v1', 'true');
            // O adjustHeaderTop será chamado pelo transitionend
        }
    }
    if (closeCtaBannerBtn) {
        closeCtaBannerBtn.addEventListener('click', hideConstructionBanner);
    }
    showConstructionBanner();
    window.addEventListener('resize', adjustHeaderTop);


    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        window.addEventListener('scroll', function () { // MUDADO PARA addEventListener
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
    }
});