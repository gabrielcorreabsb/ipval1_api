// assets/js/visualizar-liturgia.js

document.addEventListener('DOMContentLoaded', async () => {
    const loadingDiv = document.getElementById('liturgy-loading');
    const contentDiv = document.getElementById('liturgy-content');
    const errorDiv = document.getElementById('liturgy-error');

    const titleEl = document.getElementById('liturgy-title');
    const dateEl = document.getElementById('liturgy-date');
    const descriptionEl = document.getElementById('liturgy-description');
    const bibleVersionEl = document.getElementById('liturgy-bible-version');
    const itemsContainer = document.getElementById('liturgy-items-container');

    // Modal de Versículo Bíblico
    const verseModal = document.getElementById('bibleVerseModal');
    const verseModalTitle = document.getElementById('bibleVerseModalTitle');
    const verseModalBody = document.getElementById('bibleVerseModalBody');
    const closeVerseModalBtn = document.querySelector('.close-bible-verse-modal');

    if (closeVerseModalBtn) {
        closeVerseModalBtn.onclick = () => verseModal.style.display = 'none';
    }
    window.onclick = function(event) {
        if (event.target == verseModal) {
            verseModal.style.display = 'none';
        }
    }

    function showLoading() {
        loadingDiv.style.display = 'block';
        contentDiv.style.display = 'none';
        errorDiv.style.display = 'none';
    }

    function showContent() {
        loadingDiv.style.display = 'none';
        contentDiv.style.display = 'block';
        errorDiv.style.display = 'none';
    }

    function showError() {
        loadingDiv.style.display = 'none';
        contentDiv.style.display = 'none';
        errorDiv.style.display = 'block';
    }

    async function loadLiturgy() {
        showLoading();
        const params = new URLSearchParams(window.location.search);
        const liturgiaId = params.get('id');

        if (!liturgiaId) {
            titleEl.textContent = 'Liturgia não encontrada';
            document.title = 'Liturgia não encontrada - IPV1';
            descriptionEl.textContent = 'O ID da liturgia não foi fornecido na URL.';
            showError();
            return;
        }

        try {
            // Carregar versões e livros primeiro (se necessário para formatação)
            // ou assumir que estarão disponíveis se o usuário navegou de outra página
            // Para simplificar, vamos buscar tudo que precisamos.
            const [liturgiaData, versoesLocais, livrosLocais] = await Promise.all([
                getLiturgyById(liturgiaId), // Do seu api.js
                getBibleVersionsLocal(),    // Do seu api.js
                getBibleBooksLocal()        // Do seu api.js
            ]);

            if (!liturgiaData) {
                throw new Error("Dados da liturgia não recebidos.");
            }

            document.title = `${liturgiaData.titulo} - Liturgia IPV1`;
            titleEl.textContent = liturgiaData.titulo;
            dateEl.textContent = `Data: ${new Date(liturgiaData.data + "T00:00:00").toLocaleDateString('pt-BR', {timeZone: 'UTC'})}`;
            descriptionEl.textContent = liturgiaData.descricao || '';

            const versaoInfo = versoesLocais.find(v => v.enumNome === liturgiaData.versaoBibliaPadrao);
            bibleVersionEl.textContent = `Versão Bíblica Padrão: ${versaoInfo ? versaoInfo.nomeCompleto : liturgiaData.versaoBibliaPadrao}`;

            itemsContainer.innerHTML = ''; // Limpa itens anteriores
            if (liturgiaData.itens && liturgiaData.itens.length > 0) {
                liturgiaData.itens.sort((a,b) => a.ordem - b.ordem).forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('liturgy-item', `tipo-${item.tipo.toLowerCase().replace(/_/g, '')}`);

                    switch (item.tipo) {
                        case 'TITULO_SECAO':
                            itemDiv.innerHTML = `<h3>${item.conteudoTextual}</h3>`;
                            break;
                        case 'TEXTO_SIMPLES':
                        case 'ANUNCIO':
                        case 'ORACAO_COMUNITARIA':
                            itemDiv.innerHTML = `<p>${item.conteudoTextual.replace(/\n/g, '<br>')}</p>`; // Preserva quebras de linha
                            break;
                        case 'HINO':
                            itemDiv.innerHTML = `<p><strong>Hino:</strong> ${item.conteudoTextual}</p>`;
                            break;
                        case 'REFERENCIA_BIBLICA':
                            const refText = document.createElement('a');
                            refText.href = '#';
                            refText.classList.add('reference-text');
                            refText.textContent = item.referenciaDisplayFormatada || `${item.livroBiblia} ${item.capituloBiblia}:${item.versiculoInicioBiblia}`;
                            refText.onclick = async (e) => {
                                e.preventDefault();
                                await displayBibleVerse(
                                    liturgiaData.versaoBibliaPadrao, // Enum Nome: "ARA", "NVI"
                                    item.livroBiblia, // Enum Nome: "GENESIS", "JOAO"
                                    item.capituloBiblia,
                                    item.versiculoInicioBiblia,
                                    item.versiculoFimBiblia,
                                    item.referenciaDisplayFormatada,
                                    versoesLocais, // Passa a lista de versões carregadas
                                    livrosLocais   // Passa a lista de livros carregados
                                );
                            };
                            itemDiv.appendChild(refText);
                            // Placeholder para o texto bíblico que será carregado sob demanda
                            const bibleTextDiv = document.createElement('div');
                            bibleTextDiv.classList.add('bible-text-content');
                            bibleTextDiv.id = `bible-text-${item.livroBiblia}-${item.capituloBiblia}-${item.versiculoInicioBiblia}`;
                            bibleTextDiv.style.display = 'none'; // Começa escondido
                            itemDiv.appendChild(bibleTextDiv);
                            break;
                        default:
                            itemDiv.innerHTML = `<p><em>Tipo de item não reconhecido: ${item.conteudoTextual || ''}</em></p>`;
                    }
                    itemsContainer.appendChild(itemDiv);
                });
            } else {
                itemsContainer.innerHTML = '<p>Nenhum item nesta liturgia.</p>';
            }
            showContent();
        } catch (error) {
            console.error("Erro ao carregar liturgia:", error);
            titleEl.textContent = 'Erro ao Carregar Liturgia';
            descriptionEl.textContent = error.message || 'Não foi possível carregar os detalhes da liturgia.';
            showError();
        }
    }

    async function displayBibleVerse(versaoEnumNome, livroEnumNome, capitulo, vInicio, vFim, referenciaDisplay, todasVersoes, todosLivros) {
        verseModalTitle.textContent = referenciaDisplay || "Texto Bíblico";
        verseModalBody.innerHTML = 'Carregando versículos...';
        verseModal.style.display = 'flex'; // Mostra o modal

        const versaoSelecionada = todasVersoes.find(v => v.enumNome === versaoEnumNome);
        const livroSelecionado = todosLivros.find(l => l.enumNome === livroEnumNome);

        if (!versaoSelecionada || !livroSelecionado) {
            verseModalBody.innerHTML = '<p>Erro: Versão ou livro não encontrado nos dados locais.</p>';
            return;
        }

        const siglaVersaoApi = versaoSelecionada.siglaApi;
        const abrevLivroApi = livroSelecionado.abrevApi;

        try {
            const versiculos = await fetchVerseRangeFromBibleDigital(siglaVersaoApi, abrevLivroApi, capitulo, vInicio, vFim || vInicio);

            if (versiculos && versiculos.length > 0) {
                verseModalBody.innerHTML = versiculos.map(v => `<p class="verse"><sup>${v.number}</sup> ${v.text}</p>`).join('');
            } else {
                verseModalBody.innerHTML = '<p>Texto bíblico não encontrado ou não disponível.</p>';
            }
        } catch (error) {
            console.error("Erro ao buscar versículos:", error);
            verseModalBody.innerHTML = `<p>Falha ao carregar o texto bíblico: ${error.message}</p>`;
        }
    }

    // Scripts do banner e menu (você já os tem)
    // Inicialização do banner de construção (exemplo, adapte do seu `obra.js`)
    const constructionBanner = document.getElementById('constructionBanner');
    const closeCtaBannerBtn = document.getElementById('closeCtaBannerBtn');
    const mainHeader = document.getElementById('mainHeader');

    function showConstructionBanner() {
        if (constructionBanner) constructionBanner.style.display = 'block';
        if (mainHeader && constructionBanner) mainHeader.style.top = `${constructionBanner.offsetHeight}px`;
    }

    function hideConstructionBanner() {
        if (constructionBanner) {
            constructionBanner.classList.add('hidden'); // Para animação
            // Espera a animação terminar para ajustar o header
            setTimeout(() => {
                if (mainHeader) mainHeader.style.top = '0px';
            }, 300); // Mesmo tempo da transição CSS
        }
    }

    if (closeCtaBannerBtn) {
        closeCtaBannerBtn.addEventListener('click', hideConstructionBanner);
    }
    // Chamar showConstructionBanner se a lógica do seu obra.js decidir mostrar
    // showConstructionBanner(); // Descomente e adapte conforme sua lógica

    // Carregar a liturgia
    loadLiturgy();
});