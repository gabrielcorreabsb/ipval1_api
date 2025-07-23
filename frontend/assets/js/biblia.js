// assets/js/biblia.js

// --- PLANO DE LEITURA (Pode ser movido para plano-leitura.js e importado) ---
const PLANO_LEITURA_ANUAL = [];

function gerarPlanoLeituraSequencial(livros, capitulosPorDia) {
    if (PLANO_LEITURA_ANUAL.length > 0) return;

    // A lista completa de capítulos da Bíblia, na ordem
    let todosOsCapitulos = [];
    livros.forEach(livro => {
        for (let i = 1; i <= livro.chapters; i++) {
            todosOsCapitulos.push({
                bookAbbrev: livro.abbrev.pt,
                chapter: i,
                bookName: livro.name
            });
        }
    });
    const CAPITULOS_DE_DESLOCAMENTO = -76;
    // =====================================================================

    let plano = [];
    for (let dia = 1; dia <= 366; dia++) {
        const capitulosDoDia = [];
        const startIndex = ((dia - 1) * capitulosPorDia) + CAPITULOS_DE_DESLOCAMENTO;

        for (let i = 0; i < capitulosPorDia; i++) {
            const capituloIndex = startIndex + i;
            if (capituloIndex < todosOsCapitulos.length) {
                capitulosDoDia.push(todosOsCapitulos[capituloIndex]);
            } else {
                // Se o plano acabar (já leu a Bíblia toda + deslocamento), adiciona placeholder
                capitulosDoDia.push({ bookAbbrev: "fim", chapter: 0, bookName: "Fim" });
            }
        }
        plano.push(capitulosDoDia);
    }

    PLANO_LEITURA_ANUAL.push(...plano);
}


document.addEventListener('DOMContentLoaded', async () => {
    // --- Seletores de Elementos ---
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const versionSelect = document.getElementById('bible-version-select');
    const bookSelect = document.getElementById('bible-book-select');
    const chapterSelect = document.getElementById('bible-chapter-select');
    const bibleTextContainer = document.getElementById('bible-text-container');
    const challengeVersionSelect = document.getElementById('challenge-version-select');
    const challengeDateEl = document.getElementById('challenge-date');
    const challengeReadingRefEl = document.getElementById('challenge-reading-ref');
    const challengeTextContainer = document.getElementById('challenge-text-container');

    // --- Variáveis Globais ---
    let allBooks = [];
    let allVersions = [];

    // --- Lógica das Abas ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const targetContent = document.getElementById(tab.dataset.tab);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // --- Funções Auxiliares ---
    function showLoadingInContainer(container, message = "Carregando...") {
        if (container) container.innerHTML = `<div class="loading-indicator"><p>${message}</p></div>`;
    }
    function renderBibleText(container, data) {
        if (!container || !data || !data.verses) {
            if (container) container.innerHTML = '<p>Não foi possível carregar o texto.</p>';
            return;
        }
        let html = `<h3 class="chapter-title">${data.book.name} ${data.chapter.number}</h3>`;
        html += data.verses.map(v => `<p class="verse"><sup>${v.number}</sup> ${v.text}</p>`).join('');
        container.innerHTML = html;
    }

    // --- Lógica da Bíblia Online ---
    async function populateBibleReaderControls() {
        if (!versionSelect || !bookSelect) return;
        const versionMap = { "nvi": "Nova Versão Internacional", "ra": "Almeida Revista e Atualizada" };
        allVersions.forEach(versionObj => {
            const versionSigla = versionObj.version;
            const versionName = versionMap[versionSigla] || versionSigla.toUpperCase();
            const option = new Option(versionName, versionSigla);
            const challengeOption = option.cloneNode(true);
            versionSelect.add(option);
            if (challengeVersionSelect) challengeVersionSelect.add(challengeOption);
        });

        bookSelect.innerHTML = '<option value="">Selecione o Livro</option>';
        allBooks.forEach(book => {
            const option = new Option(book.name, book.abbrev.pt);
            option.dataset.chapters = book.chapters;
            bookSelect.add(option);
        });

        bookSelect.addEventListener('change', () => {
            populateChapterSelect();
            if(bibleTextContainer) bibleTextContainer.innerHTML = '<p class="placeholder-text">Selecione o capítulo.</p>';
        });
        chapterSelect.addEventListener('change', loadSelectedChapter);
        versionSelect.addEventListener('change', loadSelectedChapter);
    }

    function populateChapterSelect() {
        if (!bookSelect || !chapterSelect) return;
        const selectedBookOption = bookSelect.options[bookSelect.selectedIndex];
        const numChapters = selectedBookOption ? parseInt(selectedBookOption.dataset.chapters, 10) : 0;
        chapterSelect.innerHTML = '<option value="">Capítulo</option>';
        if (numChapters > 0) {
            for (let i = 1; i <= numChapters; i++) {
                chapterSelect.add(new Option(i, i));
            }
        }
    }

    async function loadSelectedChapter() {
        if (!versionSelect || !bookSelect || !chapterSelect || !bibleTextContainer) return;
        const version = versionSelect.value;
        const bookAbbrev = bookSelect.value;
        const chapter = chapterSelect.value;
        if (!version || !bookAbbrev || !chapter) return;
        showLoadingInContainer(bibleTextContainer);
        try {
            const chapterData = await fetchChapterFromBibleDigital(version, bookAbbrev, chapter);
            renderBibleText(bibleTextContainer, chapterData);
        } catch (error) {
            console.error("Erro ao carregar capítulo:", error);
            bibleTextContainer.innerHTML = `<p class="error-message">Erro ao carregar o texto. Tente novamente.</p>`;
        }
    }

    // --- Lógica do Desafio de Leitura ---
    function getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0); const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24; return Math.floor(diff / oneDay);
    }

    async function loadChallengeReading() {
        if (!challengeDateEl || !challengeReadingRefEl || !challengeTextContainer || !challengeVersionSelect) return;

        const today = new Date();
        const dayOfYear = getDayOfYear(today);
        const formattedDate = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
        challengeDateEl.textContent = `Desafio Leitura Bíblica 2025 - dia ${formattedDate}`;

        // Consulta o plano de leitura para o dia atual (índice é dia - 1)
        const chaptersToReadToday = PLANO_LEITURA_ANUAL[dayOfYear - 1];

        if (!chaptersToReadToday || chaptersToReadToday.length === 0 || chaptersToReadToday[0].bookAbbrev === 'fim') {
            challengeReadingRefEl.textContent = "Parabéns, você concluiu o desafio anual!";
            challengeTextContainer.innerHTML = "<p>Aguarde o plano do próximo ano!</p>";
            return;
        }

        const firstReading = chaptersToReadToday[0];
        const lastReading = chaptersToReadToday[chaptersToReadToday.length - 1];
        let readingRefText = (firstReading.bookAbbrev === lastReading.bookAbbrev) ?
            `${firstReading.bookName} ${firstReading.chapter} a ${lastReading.chapter}` :
            `${firstReading.bookName} ${firstReading.chapter} a ${lastReading.bookName} ${lastReading.chapter}`;
        challengeReadingRefEl.textContent = `Hoje a leitura é de ${readingRefText}`;

        showLoadingInContainer(challengeTextContainer, `Carregando ${readingRefText}...`);
        const version = challengeVersionSelect.value;
        if (!version) {
            challengeTextContainer.innerHTML = '<p>Por favor, selecione uma versão da Bíblia.</p>';
            return;
        }

        try {
            let fullTextHtml = '';
            const chapterPromises = chaptersToReadToday.map(reading =>
                fetchChapterFromBibleDigital(version, reading.bookAbbrev, reading.chapter)
            );
            const allChapterData = await Promise.all(chapterPromises);
            allChapterData.forEach(chapterData => {
                if (chapterData) {
                    fullTextHtml += `<h3 class="chapter-title">${chapterData.book.name} ${chapterData.chapter.number}</h3>`;
                    fullTextHtml += chapterData.verses.map(v => `<p class="verse"><sup>${v.number}</sup> ${v.text}</p>`).join('');
                }
            });
            challengeTextContainer.innerHTML = fullTextHtml || '<p>Não foi possível carregar o texto do desafio.</p>';
        } catch (error) {
            console.error("Erro ao carregar leitura do desafio:", error);
            challengeTextContainer.innerHTML = `<p class="error-message">Erro ao carregar a leitura. Tente novamente.</p>`;
        }
    }

    // --- Inicialização da Página ---
    async function initPage() {
        showLoadingInContainer(bibleTextContainer, 'Carregando dados da Bíblia...');
        showLoadingInContainer(challengeTextContainer);
        try {
            // Busca dados da API Externa
            const [versionsResp, booksResp] = await Promise.all([
                getBibleVersions(), // De api.js
                getBibleBooks()     // De api.js
            ]);
            allVersions = versionsResp.filter(v => ['nvi', 'ra'].includes(v.version)) || [];
            allBooks = booksResp || [];

            // Gera o plano de leitura uma única vez com base nos livros carregados
            gerarPlanoLeituraSequencial(allBooks, 4); // 4 capítulos por dia

            await populateBibleReaderControls();
            await loadChallengeReading();
            if(challengeVersionSelect) challengeVersionSelect.addEventListener('change', loadChallengeReading);

        } catch (error) {
            console.error("Erro Crítico na Inicialização:", error);
            const errorMsg = `<p class="error-message">Erro ao inicializar: ${error.message}</p>`;
            if(bibleTextContainer) bibleTextContainer.innerHTML = errorMsg;
            if(challengeTextContainer) challengeTextContainer.innerHTML = errorMsg;
        }
    }

    initPage();
});