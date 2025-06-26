// Garante que jsPDF esteja disponível globalmente se incluído via CDN
const { jsPDF } = window.jspdf || { jsPDF: null };
const LOGO_IPV1_BASE64 = 'data:image/png;base64,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';

document.addEventListener('DOMContentLoaded', async () => {
    // --- Elementos DOM Principais da Página ---
    const mainLoadingDiv = document.getElementById('public-liturgy-loading');
    const liturgiesForMonthContainer = document.getElementById('liturgies-for-selected-month-container');
    const mainErrorDiv = document.getElementById('public-liturgy-error');
    const selectMonthEl = document.getElementById('select-month');
    const selectYearEl = document.getElementById('select-year');
    const mainPageTitleEl = document.getElementById('main-page-title');
    const mainPageSubtitleEl = document.getElementById('main-page-subtitle');

    // --- Elementos do Modal de Detalhe da Liturgia ---
    const liturgyDetailModal = document.getElementById('liturgyDetailModal');
    const closeDetailModalBtn = document.querySelector('.close-liturgy-detail-modal');
    const modalTitleEl = document.getElementById('modal-liturgy-title');
    const modalDateEl = document.getElementById('modal-liturgy-date');
    const modalDescriptionEl = document.getElementById('modal-liturgy-description');
    const modalBibleVersionSelect = document.getElementById('modal-bible-version-select');
    const modalDefaultBibleVersionEl = document.getElementById('modal-liturgy-bible-version');
    const modalItemsContainer = document.getElementById('modal-liturgy-items-container');
    const btnCompileShareWhatsapp = document.getElementById('btn-compile-share-whatsapp');
    const btnDownloadLiturgyPDF = document.getElementById('btn-download-liturgy-pdf');

    // --- Variáveis Globais de Dados ---
    let todasAsLiturgiasGlobais = [];
    let versoesBibliaApiExternaGlobais = [];
    let livrosLocaisGlobais = [];
    let liturgiaAtualNoModal = null;
    let userAnnotations = {};
    let markedVerses = {};

    // --- Event Listeners ---
    if (closeDetailModalBtn) {
        closeDetailModalBtn.addEventListener('click', hideLiturgyDetailModal);
    }
    if (liturgyDetailModal) {
        liturgyDetailModal.addEventListener('click', function(event) {
            if (event.target === liturgyDetailModal) hideLiturgyDetailModal();
        });
    }
    if (btnCompileShareWhatsapp) {
        btnCompileShareWhatsapp.addEventListener('click', compileAndShareViaWhatsapp);
    }
    if (btnDownloadLiturgyPDF) {
        btnDownloadLiturgyPDF.addEventListener('click', generateAndDownloadLiturgyPDF);
    }
    if (selectMonthEl) {
        selectMonthEl.addEventListener('change', carregarLiturgiasDoMesSelecionado);
    }
    if (selectYearEl) {
        selectYearEl.addEventListener('change', carregarLiturgiasDoMesSelecionado);
    }
    if (modalBibleVersionSelect) {
        modalBibleVersionSelect.addEventListener('change', () => {
            if (liturgiaAtualNoModal && modalItemsContainer) {
                modalItemsContainer.querySelectorAll('.bible-text-accordion-content.open').forEach(acc => {
                    acc.innerHTML = ''; acc.classList.remove('open');
                });
                modalItemsContainer.querySelectorAll('.reference-text-display.active').forEach(link => link.classList.remove('active'));
            }
        });
    }

    // --- Funções de UI Auxiliares ---
    function showMainLoading(show = true) {
        if(mainLoadingDiv) mainLoadingDiv.style.display = show ? 'block' : 'none';
        if(liturgiesForMonthContainer && show) liturgiesForMonthContainer.style.display = 'none';
        if(mainErrorDiv && show) mainErrorDiv.style.display = 'none';
    }
    function showMainContent() {
        if(mainLoadingDiv) mainLoadingDiv.style.display = 'none';
        if(liturgiesForMonthContainer) liturgiesForMonthContainer.style.display = 'block';
        if(mainErrorDiv) mainErrorDiv.style.display = 'none';
    }
    function showMainError(message = "Não foi possível carregar os dados.") {
        if(mainLoadingDiv) mainLoadingDiv.style.display = 'none';
        if(liturgiesForMonthContainer) liturgiesForMonthContainer.style.display = 'none';
        if(mainErrorDiv) { mainErrorDiv.innerHTML = `<p>${message}</p>`; mainErrorDiv.style.display = 'block'; }
    }
    function hideLiturgyDetailModal() {
        if(liturgyDetailModal) {
            liturgyDetailModal.classList.remove('active');
            setTimeout(() => { if(liturgyDetailModal) liturgyDetailModal.style.display = 'none'; }, 300);
        }
        document.body.style.overflow = '';
        if (window.location.search.includes('id=')) {
            history.pushState(null, '', window.location.pathname);
        }
        liturgiaAtualNoModal = null; userAnnotations = {}; markedVerses = {};
    }

    // --- Populando Selects ---
    function popularSelectsMesAno() {
        const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
        const anoAtual = new Date().getFullYear();
        if(selectMonthEl) {
            meses.forEach((mes, index) => {
                const option = new Option(mes, index + 1);
                if ((index + 1) === (new Date().getMonth() + 1)) option.selected = true;
                selectMonthEl.add(option);
            });
        }
        if(selectYearEl) {
            for (let i = anoAtual; i >= anoAtual - 3; i--) {
                const option = new Option(i, i);
                if (i === anoAtual) option.selected = true;
                selectYearEl.add(option);
            }
        }
    }
    function popularSelectVersaoBibliaModal() {
        if (!modalBibleVersionSelect || !versoesBibliaApiExternaGlobais) return;
        modalBibleVersionSelect.innerHTML = '';
        versoesBibliaApiExternaGlobais.forEach(versao => {
            if (versao.siglaApi && versao.nomeCompleto) {
                modalBibleVersionSelect.add(new Option(versao.nomeCompleto, versao.siglaApi));
            }
        });
    }

    // --- Carregar e Exibir Liturgias por Mês ---
    async function carregarLiturgiasDoMesSelecionado() {
        if (!selectMonthEl || !selectYearEl || !liturgiesForMonthContainer) {
            console.warn("Elementos de seleção de data ou container de liturgias não encontrados.");
            return;
        }
        const mes = parseInt(selectMonthEl.value);
        const ano = parseInt(selectYearEl.value);
        if (isNaN(mes) || isNaN(ano)) return;

        showMainLoading(true);
        liturgiesForMonthContainer.innerHTML = '';
        try {
            if (todasAsLiturgiasGlobais.length === 0) {
                const liturgias = await getLiturgias(); // Vem do api.js
                todasAsLiturgiasGlobais = liturgias || [];
            }
            const liturgiasDoMes = todasAsLiturgiasGlobais.filter(lit => {
                const dataLiturgia = new Date(lit.data + "T00:00:00Z");
                return dataLiturgia.getUTCFullYear() === ano && (dataLiturgia.getUTCMonth() + 1) === mes;
            });
            liturgiasDoMes.sort((a,b) => new Date(b.data) - new Date(a.data));

            if (liturgiasDoMes.length === 0) {
                liturgiesForMonthContainer.innerHTML = '<p style="text-align:center; margin-top:20px;">Nenhuma liturgia encontrada para este período.</p>';
            } else {
                const ul = document.createElement('ul');
                ul.style.listStyleType = 'none'; ul.style.paddingLeft = '0';
                liturgiasDoMes.forEach(liturgia => {
                    const li = document.createElement('li');
                    li.className = 'liturgy-list-entry';
                    li.innerHTML = `
                        <div class="liturgy-item-info">
                            <h3>${liturgia.titulo}</h3>
                            <p class="date">Data: ${new Date(liturgia.data + "T00:00:00Z").toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                        </div>
                        <div class="liturgy-item-actions">
                            <button class="btn-view-liturgy"><i class="fas fa-eye"></i> Ver Detalhes</button>
                        </div>`;
                    li.addEventListener('click', () => displayLiturgyInModal(liturgia.id));
                    ul.appendChild(li);
                });
                liturgiesForMonthContainer.appendChild(ul);
            }
            showMainContent();
        } catch (error) {
            console.error(`Erro ao carregar liturgias para ${mes}/${ano}:`, error);
            showMainError(`Erro ao carregar liturgias: ${error.message}`);
        }
    }

    // --- Exibir Detalhes de UMA Liturgia no Modal ---
    async function displayLiturgyInModal(liturgiaId) {
        if(!liturgyDetailModal || !modalTitleEl || !modalItemsContainer || !modalBibleVersionSelect) {
            console.error("Elementos do modal de detalhes não encontrados."); return;
        }
        userAnnotations = {}; markedVerses = {};

        modalTitleEl.textContent = 'Carregando Liturgia...';
        if(modalDateEl) modalDateEl.textContent = '';
        if(modalDescriptionEl) modalDescriptionEl.textContent = '';
        if(modalDefaultBibleVersionEl) modalDefaultBibleVersionEl.textContent = '';
        modalItemsContainer.innerHTML = '<div class="loading-indicator"><p>Carregando itens...</p></div>';

        liturgyDetailModal.style.display = 'flex';
        setTimeout(() => liturgyDetailModal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';

        try {
            const liturgiaData = todasAsLiturgiasGlobais.find(l => l.id === liturgiaId) || await getLiturgyById(liturgiaId);
            if (!liturgiaData) throw new Error(`Liturgia ${liturgiaId} não encontrada.`);
            liturgiaAtualNoModal = liturgiaData;

            document.title = `${liturgiaData.titulo} - Liturgia IPV1`;
            modalTitleEl.textContent = liturgiaData.titulo;
            if(modalDateEl) modalDateEl.textContent = `Data: ${new Date(liturgiaData.data + "T00:00:00Z").toLocaleDateString('pt-BR', {timeZone: 'UTC'})}`;
            if(modalDescriptionEl) modalDescriptionEl.textContent = liturgiaData.descricao || 'Sem descrição.';

            const versaoPadraoInfo = versoesBibliaApiExternaGlobais.find(v => v.enumNome === liturgiaData.versaoBibliaPadrao);
            if(modalDefaultBibleVersionEl) modalDefaultBibleVersionEl.textContent = `Versão Padrão: ${versaoPadraoInfo ? versaoPadraoInfo.nomeCompleto : liturgiaData.versaoBibliaPadrao}`;
            if(modalBibleVersionSelect) modalBibleVersionSelect.value = versaoPadraoInfo ? versaoPadraoInfo.siglaApi : (versoesBibliaApiExternaGlobais[0]?.siglaApi || '');

            modalItemsContainer.innerHTML = '';
            if (liturgiaData.itens && liturgiaData.itens.length > 0) {
                liturgiaData.itens.sort((a,b) => a.ordem - b.ordem).forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('liturgy-item-card', `tipo-${item.tipo.toLowerCase().replace(/_/g, '')}`);
                    const itemKey = `item-${liturgiaData.id}-${item.ordem}`;
                    let contentHtml = '';

                    switch (item.tipo) {
                        case 'TITULO_SECAO': contentHtml = `<h3>${item.conteudoTextual || 'Título'}</h3>`; break;
                        case 'TEXTO_SIMPLES': case 'ANUNCIO': case 'ORACAO_COMUNITARIA':
                            contentHtml = `<div class="item-text-content"><p>${(item.conteudoTextual || '').replace(/\n/g, '<br>')}</p></div>`; break;
                        case 'HINO':
                            const hParts = (item.conteudoTextual || '').split('-');
                            contentHtml = `<div class="hino-content"><p class="hino-title">${hParts[0] ? hParts[0].trim() : 'Hino'}</p>${hParts[1] ? `<p class="hino-number">${hParts[1].trim()}</p>` : ''}</div>`; break;
                        case 'REFERENCIA_BIBLICA':
                            const refTxt = item.referenciaDisplayFormatada || `${item.livroBiblia} ${item.capituloBiblia}:${item.versiculoInicioBiblia}`;
                            const refLnk = document.createElement('a');
                            refLnk.href = '#'; refLnk.classList.add('reference-text-display');
                            refLnk.innerHTML = `<i class="fas fa-book-open"></i> <span class="ref-text-span">${refTxt}</span>`;
                            const accCont = document.createElement('div');
                            accCont.classList.add('bible-text-accordion-content');
                            refLnk.addEventListener('click', async (e) => {
                                e.preventDefault(); refLnk.classList.toggle('active');
                                const isOpen = accCont.classList.toggle('open');
                                if (isOpen && (accCont.innerHTML === '' || accCont.innerHTML.includes('loading-indicator'))) {
                                    accCont.innerHTML = '<div class="loading-indicator" style="padding:10px 0;"><p>Carregando...</p></div>';
                                    await displayBibleVerseInAccordion(modalBibleVersionSelect.value, item.livroBiblia, item.capituloBiblia, item.versiculoInicioBiblia, item.versiculoFimBiblia, accCont, itemKey, refTxt);
                                } else if (!isOpen) { accCont.innerHTML = ''; }
                            });
                            itemDiv.appendChild(refLnk); itemDiv.appendChild(accCont); break;
                        default: contentHtml = `<p><em>${item.conteudoTextual || 'Item não especificado'}</em></p>`;
                    }
                    if (item.tipo !== 'REFERENCIA_BIBLICA') itemDiv.innerHTML = contentHtml;

                    if (item.tipo !== 'TITULO_SECAO') {
                        const annotationToggleBtn = document.createElement('button');
                        annotationToggleBtn.innerHTML = '<i class="fas fa-pencil-alt"></i> Anotar';
                        annotationToggleBtn.classList.add('btn-toggle-annotation');
                        const annotationTextarea = document.createElement('textarea');
                        annotationTextarea.classList.add('item-annotation-textarea');
                        annotationTextarea.dataset.itemKey = itemKey;
                        annotationTextarea.placeholder = 'Sua anotação...';
                        annotationTextarea.value = userAnnotations[itemKey] || '';
                        annotationToggleBtn.onclick = () => {
                            annotationTextarea.style.display = annotationTextarea.style.display === 'none' ? 'block' : 'none';
                            if (annotationTextarea.style.display === 'block') annotationTextarea.focus();
                        };
                        annotationTextarea.oninput = () => { userAnnotations[itemKey] = annotationTextarea.value.trim(); };
                        itemDiv.appendChild(annotationToggleBtn); itemDiv.appendChild(annotationTextarea);
                    }
                    modalItemsContainer.appendChild(itemDiv);
                });
            } else { modalItemsContainer.innerHTML = '<p style="text-align:center;">Nenhum item nesta liturgia.</p>'; }
        } catch (error) {
            console.error("Erro ao exibir detalhes da liturgia no modal:", error);
            if(modalTitleEl) modalTitleEl.textContent = 'Erro ao Carregar';
            if(modalItemsContainer) modalItemsContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
        }
    }

    async function displayBibleVerseInAccordion(versionSiglaApi, livroEnumNome, capitulo, vInicio, vFim, targetDiv, parentItemKey, originalReferenceText) {
        const livroSelecionado = livrosLocaisGlobais.find(l => l.enumNome === livroEnumNome);
        if (!livroSelecionado) { targetDiv.innerHTML = '<p class="error-message" style="padding:10px;">Livro não configurado.</p>'; return; }
        const abrevLivroApi = livroSelecionado.abrevApi;
        try {
            const versiculosArray = await fetchVerseRangeFromBibleDigital(versionSiglaApi, abrevLivroApi, capitulo, vInicio, vFim || vInicio); // Função do api.js
            if (versiculosArray && versiculosArray.length > 0) {
                let versesHtml = '';
                versiculosArray.forEach(v => {
                    const verseKey = `${parentItemKey}-verse-${capitulo}-${v.number}`;
                    const isMarked = !!markedVerses[verseKey];
                    versesHtml += `<p class="verse ${isMarked ? 'marked' : ''}" data-verse-key="${verseKey}" data-verse-text="${v.text}" data-verse-ref="${livroSelecionado.nomeCompleto} ${capitulo}:${v.number}"><sup>${v.number}</sup> ${v.text}</p>
                                 <textarea class="verse-annotation-input" data-verse-key-for-annotation="${verseKey}" placeholder="Sua nota sobre ${livroSelecionado.nomeCompleto} ${capitulo}:${v.number}..." style="display:${isMarked ? 'block':'none'}">${markedVerses[verseKey]?.annotation || ''}</textarea>`;
                });
                targetDiv.innerHTML = `<div class="verse-text-display">${versesHtml}</div>`;
                targetDiv.querySelectorAll('.verse').forEach(verseEl => verseEl.addEventListener('click', () => toggleVerseMark(verseEl)));
                targetDiv.querySelectorAll('.verse-annotation-input').forEach(textarea => textarea.addEventListener('input', (e) => saveVerseAnnotation(e.target)));
            } else { targetDiv.innerHTML = '<p style="padding:10px;">Texto bíblico não encontrado para esta referência e versão.</p>'; }
        } catch (error) {
            console.error("Erro ao buscar versos para accordion:", error);
            targetDiv.innerHTML = `<p class="error-message" style="padding:10px;">Falha ao carregar texto bíblico: ${error.message}</p>`;
        }
    }
    function toggleVerseMark(verseElement) {
        const verseKey = verseElement.dataset.verseKey;
        const verseText = verseElement.dataset.verseText;
        const verseRef = verseElement.dataset.verseRef;
        const annotationTextarea = verseElement.nextElementSibling;
        verseElement.classList.toggle('marked');
        if (verseElement.classList.contains('marked')) {
            markedVerses[verseKey] = { text: verseText, annotation: (annotationTextarea ? annotationTextarea.value.trim() : ''), reference: verseRef };
            if(annotationTextarea) annotationTextarea.style.display = 'block';
        } else {
            delete markedVerses[verseKey];
            if(annotationTextarea) { annotationTextarea.style.display = 'none'; annotationTextarea.value = ''; }
        }
    }
    function saveVerseAnnotation(textareaElement) {
        const verseKey = textareaElement.dataset.verseKeyForAnnotation;
        if (markedVerses[verseKey]) {
            markedVerses[verseKey].annotation = textareaElement.value.trim();
        } else if (textareaElement.value.trim() !== '') {
            const verseP = textareaElement.previousElementSibling;
            if (verseP && verseP.classList.contains('verse')) {
                toggleVerseMark(verseP);
                if(markedVerses[verseKey]) markedVerses[verseKey].annotation = textareaElement.value.trim();
            }
        }
    }

    // --- Compilar e Compartilhar via WhatsApp ---
    function compileAndShareViaWhatsapp() {
        if (!liturgiaAtualNoModal) { mostrarMensagem("Nenhuma liturgia ativa.", "info"); return; }
        let shareText = `*${liturgiaAtualNoModal.titulo.toUpperCase()}*\n`;
        shareText += `_${new Date(liturgiaAtualNoModal.data + "T00:00:00Z").toLocaleDateString('pt-BR', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'})}_\n\n`;
        let hasContentToShare = false;
        liturgiaAtualNoModal.itens.sort((a,b)=> a.ordem - b.ordem).forEach(item => {
            const itemKey = `item-${liturgiaAtualNoModal.id}-${item.ordem}`;
            let itemHeader = ""; let itemContentForShare = "";
            switch(item.tipo) {
                case 'TITULO_SECAO': itemHeader = `\n*--- ${item.conteudoTextual.toUpperCase()} ---*\n`; break;
                case 'HINO': itemHeader = `*Hino:* ${item.conteudoTextual}\n`; break;
                case 'REFERENCIA_BIBLICA': itemHeader = `*Leitura:* ${item.referenciaDisplayFormatada}\n`; break;
                case 'TEXTO_SIMPLES': itemContentForShare = `${item.conteudoTextual}\n`; break;
                case 'ORACAO_COMUNITARIA': itemHeader = `*Oração Comunitária*\n`; itemContentForShare = item.conteudoTextual ? `_${item.conteudoTextual}_\n` : ''; break;
                case 'ANUNCIO': itemHeader = `*Anúncio*\n`; itemContentForShare = item.conteudoTextual ? `${item.conteudoTextual}\n` : ''; break;
            }
            if (itemHeader) shareText += itemHeader;
            if (itemContentForShare) shareText += itemContentForShare;
            if (userAnnotations[itemKey] && userAnnotations[itemKey] !== "") {
                shareText += `    _Minha Anotação:_ ${userAnnotations[itemKey]}\n`; hasContentToShare = true;
            }
            if (itemHeader || itemContentForShare || (userAnnotations[itemKey] && userAnnotations[itemKey] !== "")) { shareText += "\n"; }
        });
        const sortedMarkedVerseKeys = Object.keys(markedVerses).sort((a,b)=>{
            const pA = a.split('-'); const pB = b.split('-');
            return (parseInt(pA[2])-parseInt(pB[2])) || (parseInt(pA[3])-parseInt(pB[3])) || (parseInt(pA[4])-parseInt(pB[4]));
        });
        if (sortedMarkedVerseKeys.length > 0) {
            shareText += "*--- VERSÍCULOS MARCADOS ---*\n\n";
            sortedMarkedVerseKeys.forEach(verseKey => {
                const verseData = markedVerses[verseKey];
                shareText += `*${verseData.reference}:*\n_"${verseData.text}"_\n`;
                if (verseData.annotation && verseData.annotation !== "") { shareText += `    _Nota:_ ${verseData.annotation}\n`; }
                shareText += "\n"; hasContentToShare = true;
            });
        }
        const initialLength = `*${liturgiaAtualNoModal.titulo.toUpperCase()}*\n_${new Date(liturgiaAtualNoModal.data + "T00:00:00Z").toLocaleDateString('pt-BR', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'})}_\n\n`.length;
        if (shareText.length <= initialLength && !hasContentToShare && Object.keys(userAnnotations).filter(k=>userAnnotations[k]).length === 0 && sortedMarkedVerseKeys.length === 0) {
            mostrarMensagem("Nada para compartilhar.", "info"); return;
        }
        shareText = shareText.replace(/\n\n\n+/g, '\n\n').trim();
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }

    // --- Gerar e Baixar PDF ---
    async function generateAndDownloadLiturgyPDF() {
        if (!jsPDF) {
            mostrarMensagem("Biblioteca PDF não está disponível. Por favor, recarregue a página.", "error");
            console.error("jsPDF não carregado ou não definido.");
            return;
        }
        if (!liturgiaAtualNoModal) {
            mostrarMensagem("Nenhuma liturgia ativa para gerar PDF.", "info");
            return;
        }

        Swal.fire({
            title: 'Gerando PDF da Liturgia...',
            text: 'Aguarde um momento...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            let yPosition = 15; // Margem superior inicial em mm
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            const usableWidth = pageWidth - 2 * margin;
            const paragraphSpacing = 3;
            const itemSpacing = 4; // Espaço entre itens principais da liturgia

            // Função helper para adicionar texto com quebra de página automática
            function addProcessedText(text, x, y, options = {}) {
                const fontSize = options.fontSize || 10;
                const fontStyle = options.fontStyle || "normal";
                const color = options.color || [0, 0, 0]; // Preto por padrão
                const align = options.align || 'left';
                const lineSpacingFactor = options.lineSpacingFactor || 1.2; // Ajuste para mais espaçamento entre linhas
                const isHtml = options.isHtml || false;

                doc.setFontSize(fontSize);
                doc.setFont("helvetica", fontStyle); // Usar fontes padrão (Helvetica, Times, Courier)
                doc.setTextColor(color[0], color[1], color[2]);

                let lines;
                const textToSplit = text || ""; // Garante que não seja null ou undefined
                if (isHtml) {
                    const textParts = textToSplit.split('<br>');
                    lines = [];
                    textParts.forEach(part => {
                        lines = lines.concat(doc.splitTextToSize(part, usableWidth - (align === 'center' ? 0 : (x - margin))));
                    });
                } else {
                    lines = doc.splitTextToSize(textToSplit, usableWidth - (align === 'center' ? 0 : (x - margin)));
                }

                const textBlockHeight = lines.length * (fontSize * 0.352778) * lineSpacingFactor;

                if (y + textBlockHeight > doc.internal.pageSize.getHeight() - margin - 10) { // Reserva espaço no rodapé
                    doc.addPage();
                    y = margin;
                    // Se quiser repetir o logo e nome da igreja em novas páginas, adicione aqui
                }
                doc.text(lines, x, y, { align: align });
                return y + textBlockHeight + (options.customSpacingAfter || 0);
            }

            // 1. Adicionar Logo Centralizado
            const logoOriginalWidth = 200; // Largura original do seu logo em pixels (EXEMPLO)
            const logoOriginalHeight = 139; // Altura original do seu logo em pixels (EXEMPLO)
            const desiredLogoWidthMM = 50; // Largura desejada do logo no PDF em mm
            // Calcula altura proporcionalmente para não distorcer
            const logoHeightMM = (logoOriginalHeight / logoOriginalWidth) * desiredLogoWidthMM;
            const logoX = (pageWidth - desiredLogoWidthMM) / 2; // Centralizado
            const logoY = yPosition;

            try {
                if (LOGO_IPV1_BASE64 && LOGO_IPV1_BASE64.startsWith('data:image')) {
                    // Tenta deduzir o formato da string base64
                    let format = 'PNG'; // Padrão
                    if (LOGO_IPV1_BASE64.startsWith('data:image/jpeg')) format = 'JPEG';
                    else if (LOGO_IPV1_BASE64.startsWith('data:image/jpg')) format = 'JPG';

                    doc.addImage(LOGO_IPV1_BASE64, format, logoX, logoY, desiredLogoWidthMM, logoHeightMM);
                    yPosition += logoHeightMM + 5; // Espaço após o logo
                } else {
                    console.warn("String Base64 do logo não definida ou inválida.");
                }
            } catch (e) {
                console.error("Erro ao adicionar o logo ao PDF:", e);
            }



            // 3. Título da Liturgia
            yPosition = addProcessedText(liturgiaAtualNoModal.titulo, pageWidth / 2, yPosition,
                { fontSize: 16, fontStyle: 'bold', align: 'center', color: [11, 102, 54], customSpacingAfter: 3 }); // --color-primary

            // 4. Data
            yPosition = addProcessedText(
                `Data da Liturgia/Estudo: ${new Date(liturgiaAtualNoModal.data + "T00:00:00Z").toLocaleDateString('pt-BR', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'})}`,
                pageWidth / 2, yPosition, { fontSize: 10, fontStyle: 'italic', align: 'center', color: [80, 80, 80], customSpacingAfter: paragraphSpacing + 8 }
            );

            // 5. Itens da Liturgia
            liturgiaAtualNoModal.itens.sort((a, b) => a.ordem - b.ordem).forEach(item => {
                let itemPrefix = ""; let itemText = item.conteudoTextual || "";
                let itemFontSize = 11; let itemFontStyle = "normal"; let itemColor = [0,0,0];
                let sectionTitle = false; let isHtml = false;
                let customSpacing = paragraphSpacing;

                switch (item.tipo) {
                    case 'TITULO_SECAO':
                        itemText = (item.conteudoTextual || "Seção").toUpperCase();
                        itemFontSize = 13; itemFontStyle = 'bold'; itemColor = [8, 74, 39]; // --color-accent
                        sectionTitle = true; customSpacing = 2;
                        yPosition += 4; // Espaço extra antes de um título de seção
                        break;
                    case 'HINO': itemPrefix = "Hino: "; itemFontStyle = 'italic'; itemColor = [50,50,50]; break;
                    case 'REFERENCIA_BIBLICA': itemPrefix = "Leitura: "; itemText = item.referenciaDisplayFormatada || ""; itemFontStyle = 'bolditalic'; itemColor = [11,102,54]; break;
                    case 'ORACAO_COMUNITARIA':itemPrefix = "Oração: "; itemFontStyle = 'italic'; if (item.conteudoTextual) isHtml = true; break;
                    case 'ANUNCIO':itemPrefix = "Anúncio: "; if (item.conteudoTextual) isHtml = true; break;
                    case 'TEXTO_SIMPLES': if (item.conteudoTextual) isHtml = true; break;
                }

                let fullItemText = (itemPrefix + itemText).trim();
                if (fullItemText) {
                    yPosition = addProcessedText(fullItemText, margin, yPosition,
                        { fontSize: itemFontSize, fontStyle: itemFontStyle, color: itemColor, isHtml: isHtml, customSpacingAfter: (userAnnotations[`item-${liturgiaAtualNoModal.id}-${item.ordem}`] ? 1 : customSpacing) });
                    if (sectionTitle) {
                        doc.setLineWidth(0.2); doc.setDrawColor(220, 220, 220); // Linha divisória cinza claro
                        doc.line(margin, yPosition - customSpacing +1 , pageWidth - margin, yPosition - customSpacing +1); doc.setDrawColor(0);
                        yPosition += 1;
                    }
                }
                const itemKey = `item-${liturgiaAtualNoModal.id}-${item.ordem}`;
                if (userAnnotations[itemKey]) {
                    yPosition = addProcessedText(`    Anotação: ${userAnnotations[itemKey]}`, margin + 5, yPosition, { fontSize: 9, fontStyle: 'italic', color: [100,100,100], customSpacingAfter: customSpacing });
                }
                yPosition += (fullItemText || userAnnotations[itemKey]) ? itemSpacing : 0;
            });

            // 6. Versículos Marcados
            const sortedMarkedVerseKeys = Object.keys(markedVerses).sort((a,b)=>{
                const pA=a.split('-');const pB=b.split('-');
                return (parseInt(pA[2])-parseInt(pB[2]))||(parseInt(pA[3])-parseInt(pB[3]))||(parseInt(pA[4])-parseInt(pB[4]));
            });
            if (sortedMarkedVerseKeys.length > 0) {
                yPosition += 8; // Mais espaço antes dos versículos
                yPosition = addProcessedText("VERSÍCULOS MARCADOS", margin, yPosition, { fontSize: 13, fontStyle: 'bold', color: [11,102,54], customSpacingAfter: 2 });
                doc.setLineWidth(0.2); doc.setDrawColor(220,220,220); doc.line(margin, yPosition -1, pageWidth - margin, yPosition -1); doc.setDrawColor(0); yPosition += 3;

                sortedMarkedVerseKeys.forEach(verseKey => {
                    const verseData = markedVerses[verseKey];
                    yPosition = addProcessedText(`${verseData.reference}:`, margin, yPosition, { fontSize: 10, fontStyle: 'bolditalic', color: [8,74,39] });
                    yPosition = addProcessedText(`    “${verseData.text}”`, margin + 5, yPosition, { fontSize: 10, fontStyle: 'italic', color: [50,50,50], customSpacingAfter: (verseData.annotation ? 1 : paragraphSpacing) });
                    if (verseData.annotation) {
                        yPosition = addProcessedText(`        Nota: ${verseData.annotation}`, margin + 10, yPosition, { fontSize: 9, fontStyle: 'italic', color: [100,100,100], customSpacingAfter: paragraphSpacing });
                    }
                    yPosition += 2; // Espaço entre versículos
                });
            }

            // Rodapé simples (opcional)
            const finalY = doc.internal.pageSize.getHeight() - 10;
            if (finalY > yPosition + 10) { // Só adiciona se houver espaço
                doc.setFontSize(8);
                doc.setFont("helvetica", "italic");
                doc.setTextColor(150,150,150);
                doc.text("Gerado por Sistema IPV1", pageWidth / 2, finalY, { align: 'center' });
            }


            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0,19);
            doc.save(`liturgia_${liturgiaAtualNoModal.titulo.replace(/[^a-z0-9]/gi, '_').slice(0,25).toLowerCase()}_${timestamp}.pdf`);
            Swal.close();
            mostrarMensagem("PDF da liturgia gerado com sucesso!", "success");

        } catch (err) {
            console.error("Erro ao gerar PDF com jsPDF:", err);
            Swal.close();
            mostrarMensagem("Erro ao gerar o PDF da liturgia.", "error");
        }
    }

    // --- Inicialização da Página ---
    async function initPage() {
        showMainLoading(true);
        try {
            const [versoesResp, livrosResp] = await Promise.all([getBibleVersionsLocal(), getBibleBooksLocal()]);
            versoesBibliaApiExternaGlobais = versoesResp || [];
            livrosLocaisGlobais = livrosResp || [];
            popularSelectsMesAno();
            popularSelectVersaoBibliaModal();
            const params = new URLSearchParams(window.location.search);
            const directLiturgyId = params.get('id');
            if (directLiturgyId) {
                if(mainPageTitleEl) mainPageTitleEl.textContent = "Detalhes da Liturgia";
                if(mainPageSubtitleEl) mainPageSubtitleEl.style.display = 'none';
                if(liturgiesForMonthContainer) liturgiesForMonthContainer.style.display = 'none';
                if(selectMonthEl && selectMonthEl.parentElement) selectMonthEl.parentElement.style.display = 'none';
                showMainLoading(false);
                await displayLiturgyInModal(parseInt(directLiturgyId));
            } else {
                if(selectMonthEl && selectYearEl && selectMonthEl.parentElement) {
                    selectMonthEl.parentElement.style.display = 'flex';
                    await carregarLiturgiasDoMesSelecionado();
                } else { showMainError("Controles de data não encontrados."); }
            }
        } catch (error) { console.error("Erro Crítico na Inicialização:", error); showMainError(`Erro ao inicializar: ${error.message}`); }
        finally { showMainLoading(false); }
    }

    // --- Lógica de Banner e Botão Voltar ao Topo ---
    const constructionBanner = document.getElementById('constructionBanner');
    const closeCtaBannerBtn = document.getElementById('closeCtaBannerBtn');
    const mainHeader = document.getElementById('mainHeader');
    function adjustHeaderTop() {
        if (mainHeader && constructionBanner && getComputedStyle(constructionBanner).display !== 'none' && !constructionBanner.classList.contains('hidden')) {
            mainHeader.style.top = `${constructionBanner.offsetHeight}px`;
        } else if (mainHeader) { mainHeader.style.top = '0px'; }
    }
    function showConstructionBanner() {
        if (constructionBanner) {
            const dismissed = localStorage.getItem('constructionBannerDismissed_v1');
            if (!dismissed) {
                constructionBanner.style.display = 'flex'; constructionBanner.classList.remove('hidden');
            } else { constructionBanner.style.display = 'none'; }
            adjustHeaderTop();
            if (!constructionBanner.dataset.listenerAttached) {
                constructionBanner.addEventListener('transitionend', adjustHeaderTop);
                constructionBanner.dataset.listenerAttached = 'true';
            }
        } else { adjustHeaderTop(); }
    }
    function hideConstructionBanner() {
        if (constructionBanner) { constructionBanner.classList.add('hidden'); localStorage.setItem('constructionBannerDismissed_v1', 'true');}
    }
    if (closeCtaBannerBtn) closeCtaBannerBtn.addEventListener('click', hideConstructionBanner);
    showConstructionBanner();
    window.addEventListener('resize', adjustHeaderTop);
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) backToTopBtn.classList.add('show');
            else backToTopBtn.classList.remove('show');
        });
    }
    initPage();
});