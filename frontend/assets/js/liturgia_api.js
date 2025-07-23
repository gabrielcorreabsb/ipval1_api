async function fetchFromLocalAPI(endpoint, options = {}) {
    const API_BASE_URL_LOCAL = CONFIG.API_URL; // Garante que pega o valor atual
    const url = `${API_BASE_URL_LOCAL}${endpoint}`;

    try {
        const token = AuthService.getToken(); // Usando AuthService para pegar o token da sua API
        if (!token && !isPublic) { // <-- LÓGICA ALTERADA AQUI
            console.warn('Token não encontrado para rota protegida, redirecionando para login.');
            AuthService.clearAuthData();
            window.location.replace('./login.html');
            return null;
        }

        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers: defaultHeaders
        });

        if (response.status === 204) { // No Content
            return null;
        }

        // Tenta pegar o corpo como JSON, se falhar, pega como texto (para erros não-JSON)
        const responseBody = await response.text();
        let responseData;
        try {
            responseData = responseBody ? JSON.parse(responseBody) : null;
        } catch (e) {
            responseData = responseBody; // Se não for JSON, usa o texto puro
        }


        if (!response.ok) {
            console.error(`Erro na API Local (${url}): Status ${response.status}`, responseData);

            // Se for erro de autenticação/autorização, redireciona para login
            if (response.status === 401 || response.status === 403) {
                // Não mostra Swal aqui para não interromper fluxos que já tratam isso
                // mas garante a limpeza e redirecionamento.
                AuthService.clearAuthData();
                window.location.replace('./login.html'); // Ajuste o caminho
                // Lança um erro para que a promise seja rejeitada e o catch do chamador possa lidar
                throw new Error(`Auth Error: ${response.status}`);
            }
            // Para outros erros, lança um erro com a mensagem do backend, se disponível
            const errorMessage = (responseData && responseData.message) ? responseData.message : `Erro ${response.status}`;
            throw new Error(errorMessage);
        }

        return responseData; // Retorna os dados parseados (JSON ou texto)
    } catch (error) {
        console.error(`Exceção na requisição para ${url}:`, error);
        // Se o erro já for o Auth Error que lançamos acima, não redireciona de novo
        if (error.message && (error.message.includes('401') || error.message.includes('403') || error.message.includes('Auth Error'))) {
            // A lógica de redirecionamento já foi tratada ou será tratada pelo status da resposta
        }
        // Re-lança o erro para que a função chamadora possa tratá-lo (ex: exibir mensagem ao usuário)
        throw error;
    }
}

// --- Funções específicas para endpoints da SUA API ---

// Liturgias
function getLiturgias() {
    return fetchFromLocalAPI('/liturgias', {}, true);
}

function getLiturgyById(id) {
    return fetchFromLocalAPI(`/liturgias/${id}`, {}, true);
}

function createLiturgy(liturgiaData) {
    return fetchFromLocalAPI('/liturgias', {
        method: 'POST',
        body: JSON.stringify(liturgiaData),
    });
}

function updateLiturgy(id, liturgiaData) {
    return fetchFromLocalAPI(`/liturgias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(liturgiaData),
    });
}

function deleteLiturgy(id) {
    return fetchFromLocalAPI(`/liturgias/${id}`, {
        method: 'DELETE',
    });
}

// Informações da Bíblia (do seu backend)
function getBibleVersionsLocal() {
    return fetchFromLocalAPI('/bibliainfo/versoes', {}, true);
}

function getBibleBooksLocal() {
    return fetchFromLocalAPI('/bibliainfo/livros', {}, true);
}

function getBibleTestamentsLocal() {
    return fetchFromLocalAPI('/bibliainfo/testamentos', {}, true);
}

// Adicione aqui outras funções para chamar sua API local conforme necessário
// Ex: getMembros, criarMembro, getUsuarios, etc. (se quiser centralizar tudo aqui)


// -----------------------------------------------------------------------------
// PARTE 2: COMUNICAÇÃO COM A API EXTERNA (abibliadigital.com.br)
// -----------------------------------------------------------------------------

/**
 * Busca o texto de um único versículo da API da Bíblia Digital.
 * @param {string} versionAbbrev - Abreviação da versão (ex: "ra", "nvi").
 * @param {string} bookAbbrev - Abreviação do livro (ex: "gn", "jo").
 * @param {number} chapter - Número do capítulo.
 * @param {number} verseNumber - Número do versículo.
 * @returns {Promise<string|null>} O texto do versículo ou null em caso de erro.
 */
async function fetchVerseTextFromBibleDigital(versionAbbrev, bookAbbrev, chapter, verseNumber) {
    const url = `${API_BASE_URL_BIBLIA_DIGITAL}/verses/${versionAbbrev}/${bookAbbrev}/${chapter}/${verseNumber}`;
    const headers = {};
    if (BIBLIA_DIGITAL_API_TOKEN) {
        headers['Authorization'] = `Bearer ${BIBLIA_DIGITAL_API_TOKEN}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            const errorText = await response.text();
            console.warn(`API Bíblia Digital (Versículo): Erro ${response.status} em ${url}. Detalhes: ${errorText}`);
            // Não lança erro aqui, apenas retorna null para que a UI possa lidar
            return null;
        }
        const data = await response.json();
        // A API para um único versículo retorna o objeto completo, pegamos só o texto
        // Ex: { book: {...}, chapter: {...}, number: 1, text: "..." }
        return data.text;
    } catch (error) {
        console.error(`API Bíblia Digital (Versículo): Exceção ao buscar ${url}.`, error);
        return null;
    }
}

/**
 * Busca os dados de um capítulo inteiro da API da Bíblia Digital.
 * @param {string} versionAbbrev - Abreviação da versão.
 * @param {string} bookAbbrev - Abreviação do livro.
 * @param {number} chapter - Número do capítulo.
 * @returns {Promise<object|null>} Objeto com dados do capítulo e lista de versículos, ou null em caso de erro.
 *                                 Estrutura: { book: object, chapter: object, verses: array }
 */
async function fetchChapterDataFromBibleDigital(versionAbbrev, bookAbbrev, chapter) {
    const url = `${API_BASE_URL_BIBLIA_DIGITAL}/verses/${versionAbbrev}/${bookAbbrev}/${chapter}`;
    const headers = {};
    if (BIBLIA_DIGITAL_API_TOKEN) {
        headers['Authorization'] = `Bearer ${BIBLIA_DIGITAL_API_TOKEN}`;
    }
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            const errorText = await response.text();
            console.warn(`API Bíblia Digital (Capítulo): Erro ${response.status} em ${url}. Detalhes: ${errorText}`);
            return null;
        }
        return await response.json(); // Retorna { book: ..., chapter: ..., verses: [...] }
    } catch (error) {
        console.error(`API Bíblia Digital (Capítulo): Exceção ao buscar ${url}.`, error);
        return null;
    }
}

/**
 * Função utilitária para buscar um range de versículos.
 * Internamente, pode chamar fetchChapterDataFromBibleDigital e filtrar,
 * ou fazer múltiplas chamadas a fetchVerseTextFromBibleDigital (menos eficiente).
 * Esta implementação usa fetchChapterDataFromBibleDigital para eficiência.
 * @param {string} versionAbbrev
 * @param {string} bookAbbrev
 * @param {number} chapter
 * @param {number} startVerse
 * @param {number} endVerse (opcional, se omitido ou igual a startVerse, busca só um)
 * @returns {Promise<Array<{number: number, text: string}>>} Array de objetos de versículo ou array vazio.
 */
async function fetchVerseRangeFromBibleDigital(versionAbbrev, bookAbbrev, chapter, startVerse, endVerse) {
    const effectiveEndVerse = endVerse || startVerse;
    if (startVerse > effectiveEndVerse) {
        console.warn("fetchVerseRangeFromBibleDigital: startVerse não pode ser maior que endVerse.");
        return [];
    }

    const chapterData = await fetchChapterDataFromBibleDigital(versionAbbrev, bookAbbrev, chapter);

    if (chapterData && chapterData.verses) {
        return chapterData.verses.filter(verse =>
            verse.number >= startVerse && verse.number <= effectiveEndVerse
        ).map(v => ({ number: v.number, text: v.text })); // Retorna apenas número e texto
    }
    return []; // Retorna array vazio se não encontrar ou erro
}

window.getLiturgias = getLiturgias;
window.getLiturgyById = getLiturgyById;
window.createLiturgy = createLiturgy;
window.updateLiturgy = updateLiturgy;
window.deleteLiturgy = deleteLiturgy;
window.getBibleVersionsLocal = getBibleVersionsLocal;
window.getBibleBooksLocal = getBibleBooksLocal;
window.getBibleTestamentsLocal = getBibleTestamentsLocal;
window.fetchVerseTextFromBibleDigital = fetchVerseTextFromBibleDigital;
window.fetchChapterDataFromBibleDigital = fetchChapterDataFromBibleDigital;
window.fetchVerseRangeFromBibleDigital = fetchVerseRangeFromBibleDigital;
