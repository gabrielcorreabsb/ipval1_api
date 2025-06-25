// assets/js/liturgias.js

// Variáveis globais para armazenar dados carregados
let todasAsLiturgias = [];
let versoesBibliaDisponiveis = [];
let livrosBibliaDisponiveis = [];

// Estado para o formulário principal e de itens
let editandoLiturgiaId = null;
let itensDaLiturgiaAtual = [];
let editandoItemIndex = null;

// Elementos do DOM (modal de item)
const itemModal = document.getElementById('liturgyItemModal');
console.log('Elemento itemModal capturado:', itemModal); // LOG DE VERIFICAÇÃO INICIAL
const itemForm = document.getElementById('liturgyItemForm');
const itemHiddenIdInput = document.getElementById('itemLiturgiaId');
const itemTipoSelect = document.getElementById('itemTipo');
const itemConteudoTextualDiv = document.getElementById('itemConteudoTextualDiv');
const itemConteudoTextualInput = document.getElementById('itemConteudoTextual');
const itemReferenciaBiblicaDiv = document.getElementById('itemReferenciaBiblicaDiv');
const itemLivroBibliaSelect = document.getElementById('itemLivroBiblia');
const itemCapituloBibliaInput = document.getElementById('itemCapituloBiblia');
const itemVersiculoInicioBibliaInput = document.getElementById('itemVersiculoInicioBiblia');
const itemVersiculoFimBibliaInput = document.getElementById('itemVersiculoFimBiblia');
const itemReferenciaDisplayInput = document.getElementById('itemReferenciaDisplay');
const itemHinoDiv = document.getElementById('itemHinoDiv');
const itemHinoConteudoInput = document.getElementById('itemHinoConteudo');

// --- Funções de Utilidade e Configuração ---
function mostrarMensagem(texto, tipo) {
    Swal.fire({
        text: texto, icon: tipo, toast: true, position: 'top-end',
        showConfirmButton: false, timer: tipo === 'error' ? 5000 : 3000, timerProgressBar: true
    });
}

async function verificarAutenticacaoLiturgy() {
    if (!AuthService.isAuthenticated()) {
        window.location.replace('./login.html');
        return false;
    }
    return true;
}

function isPastor() {
    const user = AuthService.getUser();
    return user && user.cargo === 'PASTOR';
}

// --- Funções Específicas para Liturgias (CRUD Admin) ---

async function carregarDadosIniciaisParaAdmin() {
    try {
        Swal.showLoading();
        const [versoes, livros, liturgias] = await Promise.all([
            getBibleVersionsLocal(), getBibleBooksLocal(), getLiturgias()
        ]);
        versoesBibliaDisponiveis = versoes || [];
        livrosBibliaDisponiveis = livros || [];
        todasAsLiturgias = liturgias || [];
        popularSelectLivros();
        exibirLiturgiasNosCards(todasAsLiturgias);
        Swal.close();
    } catch (error) {
        Swal.close();
        console.error("Erro ao carregar dados iniciais (admin):", error);
        mostrarMensagem('Falha ao carregar dados. Tente recarregar.', 'error');
    }
}

function popularSelectLivros() {
    if (!itemLivroBibliaSelect) {
        console.error("Elemento select de livros não encontrado!");
        return;
    }
    itemLivroBibliaSelect.innerHTML = '<option value="">Selecione o Livro</option>';
    if (livrosBibliaDisponiveis && livrosBibliaDisponiveis.length > 0) {
        livrosBibliaDisponiveis.forEach(livro => {
            const option = document.createElement('option');
            option.value = livro.enumNome;
            option.textContent = livro.nomeCompleto;
            itemLivroBibliaSelect.appendChild(option);
        });
    }
}

function exibirLiturgiasNosCards(liturgias) {
    const grid = document.getElementById('liturgiesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!liturgias || liturgias.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%;">Nenhuma liturgia cadastrada.</p>';
        return;
    }
    liturgias.sort((a,b) => new Date(b.data) - new Date(a.data));
    liturgias.forEach(liturgia => grid.appendChild(criarCardLiturgiaParaAdmin(liturgia)));
}

function criarCardLiturgiaParaAdmin(liturgia) {
    const card = document.createElement('div');
    card.className = 'liturgy-card';
    card.dataset.id = liturgia.id;

    const dataFormatada = new Date(liturgia.data + "T00:00:00").toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    const versaoInfo = versoesBibliaDisponiveis.find(v => v.enumNome === liturgia.versaoBibliaPadrao);
    const versaoNome = versaoInfo ? versaoInfo.nomeCompleto : liturgia.versaoBibliaPadrao;

    card.innerHTML = `
        <div class="liturgy-info">
            <h3>${liturgia.titulo}</h3>
            <p><i class="fas fa-calendar-alt"></i> Data: ${dataFormatada}</p>
            <p><i class="fas fa-book-open"></i> Versão: ${versaoNome}</p>
            ${liturgia.descricao ? `<p><i class="fas fa-info-circle"></i> Descrição: ${liturgia.descricao.substring(0,100)}...</p>` : ''}
            <p><i class="fas fa-list-ol"></i> Itens: ${liturgia.itens ? liturgia.itens.length : 0}</p>
        </div>
        <div class="liturgy-actions">
            ${isPastor() ? `
                <button onclick="abrirModalEditarLiturgia(${liturgia.id})" class="btn-edit" title="Editar Liturgia">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="duplicarLiturgia(${liturgia.id})" class="btn btn-info" title="Duplicar Liturgia">
                    <i class="fas fa-copy"></i>
                </button>
                <button onclick="confirmarExcluirLiturgia(${liturgia.id})" class="btn-delete" title="Excluir Liturgia">
                    <i class="fas fa-trash"></i>
                </button>
            ` : ''}
            <a href="./visualizar-liturgia.html?id=${liturgia.id}" target="_blank" class="btn btn-primary" title="Visualizar no Site">
                <i class="fas fa-eye"></i>
            </a>
        </div>
    `;
    return card;
}

function formatarTipoItemParaDisplay(tipoEnum) {
    const nomes = {
        TITULO_SECAO: "Título de Seção", TEXTO_SIMPLES: "Texto",
        REFERENCIA_BIBLICA: "Referência Bíblica", HINO: "Hino",
        ANUNCIO: "Anúncio", ORACAO_COMUNITARIA: "Oração"
    };
    return nomes[tipoEnum] || tipoEnum;
}

async function abrirModalNovaLiturgia() {
    if (!isPastor()) { mostrarMensagem('Acesso negado.', 'error'); return; }
    editandoLiturgiaId = null;
    itensDaLiturgiaAtual = [];
    await mostrarFormularioLiturgiaSwal();
}

async function abrirModalEditarLiturgia(id) {
    if (!isPastor()) { mostrarMensagem('Acesso negado.', 'error'); return; }
    editandoLiturgiaId = id;
    try {
        Swal.showLoading();
        const liturgia = await getLiturgyById(id);
        Swal.close();
        if (!liturgia) { mostrarMensagem('Liturgia não encontrada.', 'error'); return; }
        itensDaLiturgiaAtual = liturgia.itens ? JSON.parse(JSON.stringify(liturgia.itens)) : [];
        await mostrarFormularioLiturgiaSwal(liturgia);
    } catch (error) {
        Swal.close();
        mostrarMensagem(`Erro ao carregar liturgia para edição: ${error.message}`, 'error');
    }
}

async function mostrarFormularioLiturgiaSwal(dadosIniciais = null, isDuplicating = false) {
    // Se 'dadosIniciais' tiver um 'id', é edição.
    // Se 'dadosIniciais' não tiver 'id' (ou for null), é nova ou duplicação.
    const isEditMode = !!(dadosIniciais && dadosIniciais.id);

    let tituloModal;
    if (isEditMode) {
        tituloModal = 'Editar Liturgia';
    } else if (isDuplicating || dadosIniciais) { // Se estamos duplicando ou temos dados iniciais para uma nova
        tituloModal = 'Revisar Nova Liturgia (Cópia)';
    } else {
        tituloModal = 'Nova Liturgia';
    }

    const btnConfirmarTexto = isEditMode ? 'Salvar Alterações' : 'Criar Liturgia';

    const tituloValor = dadosIniciais ? dadosIniciais.titulo : '';
    const dataValor = dadosIniciais ? dadosIniciais.data : '';
    const descricaoValor = dadosIniciais && dadosIniciais.descricao ? dadosIniciais.descricao : '';
    const versaoSelecionada = dadosIniciais ? dadosIniciais.versaoBibliaPadrao : '';

    const versoesOptionsHtml = versoesBibliaDisponiveis
        .map(v => `<option value="${v.enumNome}" ${versaoSelecionada === v.enumNome ? 'selected' : ''}>${v.nomeCompleto}</option>`)
        .join('');

    // Se não estamos editando e não estamos duplicando (é realmente uma nova liturgia do zero),
    // e 'itensDaLiturgiaAtual' não foi preenchido por 'duplicarLiturgia', garantimos que esteja vazio.
    if (!isEditMode && !isDuplicating && !dadosIniciais) {
        itensDaLiturgiaAtual = [];
    }
    // Se estamos duplicando ou editando, 'itensDaLiturgiaAtual' já foi preparado pelas funções chamadoras.

    const { value: formValues, isConfirmed } = await Swal.fire({
        title: tituloModal,
        html: `
            <div style="text-align: left;">
                <label for="swal-liturgia-titulo" class="swal2-label">Título:</label>
                <input id="swal-liturgia-titulo" class="swal2-input" value="${tituloValor}" required>

                <label for="swal-liturgia-data" class="swal2-label">Data:</label>
                <input id="swal-liturgia-data" type="date" class="swal2-input" value="${dataValor}" required>

                <label for="swal-liturgia-versao" class="swal2-label">Versão Bíblica Padrão:</label>
                <select id="swal-liturgia-versao" class="swal2-select" required>
                    <option value="">Selecione...</option>
                    ${versoesOptionsHtml}
                </select>

                <label for="swal-liturgia-descricao" class="swal2-label">Descrição (opcional):</label>
                <textarea id="swal-liturgia-descricao" class="swal2-textarea">${descricaoValor}</textarea>
                
                <div id="itemsContainerAdmin" style="margin-top: 20px; border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
                    <h4>Itens da Liturgia:</h4>
                    <div id="swal-items-list-admin"></div>
                    <button type="button" id="swal-btn-adicionar-item-admin" class="swal2-confirm swal2-styled" style="font-size:0.9em; padding: 8px 12px; margin-top:10px;">
                        <i class="fas fa-plus"></i> Adicionar Item
                    </button>
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: btnConfirmarTexto,
        cancelButtonText: 'Cancelar',
        width: '70vw',
        customClass: { popup: 'swal-wide' },
        didOpen: () => {
            document.getElementById('swal-btn-adicionar-item-admin').addEventListener('click', () => {
                editandoItemIndex = null;
                abrirModalGerenciarItemLiturgia();
            });
            renderItensLiturgiaParaAdminNoSwal(); // Renderiza 'itensDaLiturgiaAtual'
        },
        preConfirm: () => {
            const titulo = document.getElementById('swal-liturgia-titulo').value;
            const data = document.getElementById('swal-liturgia-data').value;
            const versaoBibliaPadrao = document.getElementById('swal-liturgia-versao').value;

            if (!titulo || !data || !versaoBibliaPadrao) {
                Swal.showValidationMessage('Título, Data e Versão são obrigatórios.');
                return false;
            }
            if (itensDaLiturgiaAtual.length === 0) {
                Swal.showValidationMessage('Adicione pelo menos um item.');
                return false;
            }
            itensDaLiturgiaAtual.forEach((item, index) => item.ordem = index + 1);

            return {
                id: isEditMode ? dadosIniciais.id : null, // Envia ID original APENAS se estiver editando
                titulo,
                data,
                versaoBibliaPadrao,
                descricao: document.getElementById('swal-liturgia-descricao').value,
                itens: itensDaLiturgiaAtual
            };
        }
    });

    if (isConfirmed && formValues) {
        try {
            Swal.showLoading();
            if (isEditMode) { // Se tinha um ID original, é uma atualização
                await updateLiturgy(editandoLiturgiaId, formValues); // editandoLiturgiaId foi setado em abrirModalEditarLiturgia
                mostrarMensagem('Liturgia atualizada!', 'success');
            } else { // Caso contrário (nova ou duplicação), é uma criação
                await createLiturgy(formValues);
                mostrarMensagem('Liturgia salva com sucesso!', 'success');
            }
            await carregarDadosIniciaisParaAdmin();
        } catch (error) {
            mostrarMensagem(`Erro ao salvar: ${error.message}`, 'error');
        } finally {
            Swal.close();
        }
    }
}

async function duplicarLiturgia(idLiturgiaOriginal) {
    if (!isPastor()) {
        mostrarMensagem('Acesso negado.', 'error');
        return;
    }

    try {
        Swal.showLoading();
        const liturgiaOriginal = await getLiturgyById(idLiturgiaOriginal); // Função do seu api.js
        Swal.close();

        if (!liturgiaOriginal) {
            mostrarMensagem('Liturgia original não encontrada para duplicação.', 'error');
            return;
        }

        // Prepara os dados para o formulário como se fosse uma nova liturgia, mas com valores copiados
        const dadosParaFormulario = {
            // NÂO copie o ID da liturgiaOriginal aqui, pois queremos criar uma NOVA.
            // O 'id' será null ou undefined, indicando ao mostrarFormularioLiturgiaSwal que não é modo de edição de uma existente.
            titulo: `Cópia de: ${liturgiaOriginal.titulo}`, // Sugestão
            data: new Date().toISOString().split('T')[0], // Data atual como sugestão
            descricao: liturgiaOriginal.descricao,
            versaoBibliaPadrao: liturgiaOriginal.versaoBibliaPadrao,
            // Importante: itensDaLiturgiaAtual será populado com estes itens
        };

        // Popula o array global 'itensDaLiturgiaAtual' com os itens copiados
        // Cada item copiado NÃO deve ter ID, pois serão novos itens no banco.
        itensDaLiturgiaAtual = liturgiaOriginal.itens.map(item => ({
            // id: null, // Removido, pois o backend atribuirá se forem salvos como parte de uma nova liturgia
            tipo: item.tipo,
            ordem: item.ordem, // A ordem será mantida inicialmente
            conteudoTextual: item.conteudoTextual,
            livroBiblia: item.livroBiblia,
            capituloBiblia: item.capituloBiblia,
            versiculoInicioBiblia: item.versiculoInicioBiblia,
            versiculoFimBiblia: item.versiculoFimBiblia,
            referenciaDisplayFormatada: item.referenciaDisplayFormatada
        }));

        editandoLiturgiaId = null; // Garante que estamos no modo "criar nova"

        // Chama a função do formulário Swal, passando os dados copiados como "liturgiaParaEditar"
        // para que os campos sejam pré-preenchidos. A lógica interna de mostrarFormularioLiturgiaSwal
        // determinará se é uma criação ou edição com base na presença do ID.
        await mostrarFormularioLiturgiaSwal(dadosParaFormulario, true /* isDuplicating */);


    } catch (error) {
        Swal.close();
        mostrarMensagem(`Erro ao tentar duplicar liturgia: ${error.message}`, 'error');
    }
}

function renderItensLiturgiaParaAdminNoSwal() {
    const listDiv = document.getElementById('swal-items-list-admin');
    if (!listDiv) { console.error("Elemento swal-items-list-admin não encontrado!"); return; }
    listDiv.innerHTML = '';
    if (itensDaLiturgiaAtual.length === 0) {
        listDiv.innerHTML = '<p style="font-style:italic; text-align:center;">Nenhum item adicionado.</p>';
        return;
    }
    const ul = document.createElement('ul');
    ul.style.listStyleType = 'none'; ul.style.paddingLeft = '0';
    itensDaLiturgiaAtual.sort((a, b) => a.ordem - b.ordem);
    itensDaLiturgiaAtual.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'editable-item';
        let displayText = `${item.ordem}. <strong>[${formatarTipoItemParaDisplay(item.tipo)}]</strong> `;
        displayText += (item.tipo === 'REFERENCIA_BIBLICA') ? (item.referenciaDisplayFormatada || item.livroBiblia || 'Referência') : (item.conteudoTextual || 'Item s/ conteúdo').substring(0, 40) + '...';
        const editButtonHtml = `<button type="button" class="edit-item-btn" onclick="abrirModalGerenciarItemLiturgia(${index})" title="Editar Item"><i class="fas fa-pen"></i></button>`;
        console.log(`Renderizando item ${index}, onclick: ${editButtonHtml}`); // LOG DO BOTÃO
        li.innerHTML = `
            <span style="flex-grow: 1; margin-right: 10px;">${displayText}</span>
            <div class="item-actions">
                ${editButtonHtml}
                <button type="button" class="delete-item-btn" onclick="removerItemDaLiturgiaAtual(${index})" title="Remover Item"><i class="fas fa-trash"></i></button>
                ${index > 0 ? `<button type="button" onclick="moverItemAtual(${index}, -1)" title="Mover Para Cima"><i class="fas fa-arrow-up"></i></button>` : '<button type="button" style="visibility:hidden;"><i class="fas fa-arrow-up"></i></button>'}
                ${index < itensDaLiturgiaAtual.length - 1 ? `<button type="button" onclick="moverItemAtual(${index}, 1)" title="Mover Para Baixo"><i class="fas fa-arrow-down"></i></button>` : '<button type="button" style="visibility:hidden;"><i class="fas fa-arrow-down"></i></button>'}
            </div>`;
        ul.appendChild(li);
    });
    listDiv.appendChild(ul);
}

//***** DEFINIÇÃO DA FUNÇÃO FALTANTE *****
function controlarVisibilidadeCamposDoItemForm() {
    const tipo = itemTipoSelect.value;
    console.log('Controlando visibilidade para o tipo:', tipo);

    if (!itemConteudoTextualDiv || !itemReferenciaBiblicaDiv || !itemHinoDiv) {
        console.error("Um ou mais divs de conteúdo de item não foram encontrados no DOM!");
        return;
    }

    itemConteudoTextualDiv.style.display = 'none';
    itemReferenciaBiblicaDiv.style.display = 'none';
    itemHinoDiv.style.display = 'none';

    if (['TITULO_SECAO', 'TEXTO_SIMPLES', 'ANUNCIO', 'ORACAO_COMUNITARIA'].includes(tipo)) {
        itemConteudoTextualDiv.style.display = 'block';
    } else if (tipo === 'REFERENCIA_BIBLICA') {
        itemReferenciaBiblicaDiv.style.display = 'block';
    } else if (tipo === 'HINO') {
        itemHinoDiv.style.display = 'block';
    }
}
//***** FIM DA DEFINIÇÃO *****


function abrirModalGerenciarItemLiturgia(index = null) {
    console.log('--- abrirModalGerenciarItemLiturgia INICIADA ---');
    console.log('Índice recebido:', index);
    console.log('Objeto itemModal:', itemModal);

    if (!itemModal) {
        console.error('ERRO: O elemento itemModal NÃO foi encontrado no DOM!');
        mostrarMensagem('Erro interno: Modal de item não encontrado.', 'error');
        return;
    }

    itemForm.reset();
    editandoItemIndex = index;
    itemHiddenIdInput.value = '';
    console.log('Chamando controlarVisibilidadeCamposDoItemForm() pela primeira vez em abrirModalGerenciarItemLiturgia');
    controlarVisibilidadeCamposDoItemForm(); // << CHAMADA AQUI

    if (index !== null && itensDaLiturgiaAtual[index]) {
        const item = itensDaLiturgiaAtual[index];
        console.log('Modo Edição. Dados do item:', JSON.stringify(item));
        itemHiddenIdInput.value = item.id || '';
        itemTipoSelect.value = item.tipo;
        console.log('Tipo do item selecionado no formulário:', itemTipoSelect.value);
        console.log('Chamando controlarVisibilidadeCamposDoItemForm() para o tipo:', item.tipo);
        controlarVisibilidadeCamposDoItemForm(); // << CHAMADA AQUI
        itemConteudoTextualInput.value = item.conteudoTextual || '';
        itemHinoConteudoInput.value = (item.tipo === 'HINO' ? item.conteudoTextual : '') || '';
        if (item.tipo === 'REFERENCIA_BIBLICA') {
            console.log('Preenchendo campos de Referência Bíblica para:', JSON.stringify(item));
            itemLivroBibliaSelect.value = item.livroBiblia || '';
            itemCapituloBibliaInput.value = item.capituloBiblia || '';
            itemVersiculoInicioBibliaInput.value = item.versiculoInicioBiblia || '';
            itemVersiculoFimBibliaInput.value = item.versiculoFimBiblia || '';
            itemReferenciaDisplayInput.value = item.referenciaDisplayFormatada || '';
        }
        console.log('Formulário preenchido para edição.');
    } else {
        console.log('Modo Novo Item (ou índice inválido/nulo).');
    }
    try {
        itemModal.style.display = 'flex';
        console.log('Estilo de display do modal de item DEFINIDO PARA "flex"');
    } catch (e) {
        console.error('ERRO ao tentar mostrar o itemModal:', e);
        mostrarMensagem('Erro ao tentar exibir o formulário do item.', 'error');
    }
    console.log('--- abrirModalGerenciarItemLiturgia FINALIZADA ---');
}

// Adiciona o event listener APÓS a definição de controlarVisibilidadeCamposDoItemForm
if (itemTipoSelect) { // Garante que o elemento existe
    itemTipoSelect.addEventListener('change', controlarVisibilidadeCamposDoItemForm);
} else {
    console.error("Elemento itemTipoSelect não encontrado para adicionar event listener!");
}


function fecharModalItemLiturgia() {
    if (!itemModal) { console.error("Modal de item não encontrado para fechar."); return;}
    itemModal.style.display = 'none';
    editandoItemIndex = null;
}

if (itemForm) { // Garante que o formulário existe antes de adicionar o listener
    itemForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const tipo = itemTipoSelect.value;
        if (!tipo) { mostrarMensagem('Selecione o tipo do item.', 'error'); return; }
        const itemData = {
            id: itemHiddenIdInput.value ? parseInt(itemHiddenIdInput.value, 10) : null,
            tipo: tipo, ordem: 0, conteudoTextual: null, livroBiblia: null,
            capituloBiblia: null, versiculoInicioBiblia: null, versiculoFimBiblia: null,
            referenciaDisplayFormatada: null
        };
        if (['TITULO_SECAO', 'TEXTO_SIMPLES', 'ANUNCIO', 'ORACAO_COMUNITARIA'].includes(tipo)) {
            itemData.conteudoTextual = itemConteudoTextualInput.value.trim();
            if (!itemData.conteudoTextual) { mostrarMensagem('Conteúdo textual é obrigatório.', 'error'); return; }
        } else if (tipo === 'REFERENCIA_BIBLICA') {
            itemData.livroBiblia = itemLivroBibliaSelect.value;
            itemData.capituloBiblia = itemCapituloBibliaInput.value ? parseInt(itemCapituloBibliaInput.value, 10) : null;
            itemData.versiculoInicioBiblia = itemVersiculoInicioBibliaInput.value ? parseInt(itemVersiculoInicioBibliaInput.value, 10) : null;
            itemData.versiculoFimBiblia = itemVersiculoFimBibliaInput.value ? parseInt(itemVersiculoFimBibliaInput.value, 10) : null;
            itemData.referenciaDisplayFormatada = itemReferenciaDisplayInput.value.trim();
            if (!itemData.livroBiblia || !itemData.capituloBiblia || !itemData.versiculoInicioBiblia) { mostrarMensagem('Livro, Capítulo e Versículo Início são obrigatórios.', 'error'); return; }
            if (itemData.versiculoFimBiblia && itemData.versiculoFimBiblia < itemData.versiculoInicioBiblia) { mostrarMensagem('Versículo Fim não pode ser menor que Versículo Início.', 'error'); return; }
            if (!itemData.referenciaDisplayFormatada) {
                const livroInfo = livrosBibliaDisponiveis.find(l => l.enumNome === itemData.livroBiblia);
                let ref = `${livroInfo ? livroInfo.nomeCompleto : itemData.livroBiblia} ${itemData.capituloBiblia}:${itemData.versiculoInicioBiblia}`;
                if (itemData.versiculoFimBiblia && itemData.versiculoFimBiblia > itemData.versiculoInicioBiblia) { ref += `-${itemData.versiculoFimBiblia}`; }
                itemData.referenciaDisplayFormatada = ref;
            }
        } else if (tipo === 'HINO') {
            itemData.conteudoTextual = itemHinoConteudoInput.value.trim();
            if (!itemData.conteudoTextual) { mostrarMensagem('Título/Número do Hino é obrigatório.', 'error'); return; }
        }
        if (editandoItemIndex !== null) {
            itemData.ordem = itensDaLiturgiaAtual[editandoItemIndex].ordem;
            itensDaLiturgiaAtual[editandoItemIndex] = itemData;
        } else {
            itemData.ordem = itensDaLiturgiaAtual.length + 1;
            itensDaLiturgiaAtual.push(itemData);
        }
        renderItensLiturgiaParaAdminNoSwal();
        fecharModalItemLiturgia();
    });
} else {
    console.error("Elemento itemForm não encontrado para adicionar event listener de submit!");
}


function removerItemDaLiturgiaAtual(index) {
    itensDaLiturgiaAtual.splice(index, 1);
    reordenarItensDaLiturgiaAtual();
    renderItensLiturgiaParaAdminNoSwal();
}

function moverItemAtual(index, direcao) {
    const itemMovido = itensDaLiturgiaAtual[index];
    let vizinhoIndex = index + direcao;
    if (vizinhoIndex >= 0 && vizinhoIndex < itensDaLiturgiaAtual.length) {
        const itemVizinho = itensDaLiturgiaAtual[vizinhoIndex];
        [itemMovido.ordem, itemVizinho.ordem] = [itemVizinho.ordem, itemMovido.ordem]; // Troca ordens
        [itensDaLiturgiaAtual[index], itensDaLiturgiaAtual[vizinhoIndex]] = [itemVizinho, itemMovido]; // Troca no array
    }
    renderItensLiturgiaParaAdminNoSwal();
}

function reordenarItensDaLiturgiaAtual() {
    itensDaLiturgiaAtual.sort((a, b) => a.ordem - b.ordem);
    itensDaLiturgiaAtual.forEach((item, idx) => { item.ordem = idx + 1; });
}

async function confirmarExcluirLiturgia(id) {
    if (!isPastor()) { mostrarMensagem('Acesso negado.', 'error'); return; }
    Swal.fire({
        title: 'Tem certeza?', text: "Você não poderá reverter isso!", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir!', cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                Swal.showLoading();
                await deleteLiturgy(id);
                mostrarMensagem('Liturgia excluída!', 'success');
                await carregarDadosIniciaisParaAdmin();
            } catch (error) {
                mostrarMensagem(`Erro ao excluir: ${error.message}`, 'error');
            } finally {
                Swal.close();
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!await verificarAutenticacaoLiturgy()) return;
    const logoutBtnDesktop = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    if (logoutBtnDesktop) logoutBtnDesktop.addEventListener('click', () => AuthService.logout());
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', () => AuthService.logout());
    const searchInput = document.getElementById('searchInputLiturgy');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const liturgiasFiltradas = todasAsLiturgias.filter(lit =>
                lit.titulo.toLowerCase().includes(termo) ||
                new Date(lit.data + "T00:00:00").toLocaleDateString('pt-BR').includes(termo)
            );
            exibirLiturgiasNosCards(liturgiasFiltradas);
        });
    }
    await carregarDadosIniciaisParaAdmin();
});

window.abrirModalNovaLiturgia = abrirModalNovaLiturgia;
window.abrirModalEditarLiturgia = abrirModalEditarLiturgia;
window.confirmarExcluirLiturgia = confirmarExcluirLiturgia;
window.abrirModalGerenciarItemLiturgia = abrirModalGerenciarItemLiturgia;
window.fecharModalItemLiturgia = fecharModalItemLiturgia; // GARANTINDO QUE ESTÁ GLOBAL
window.removerItemDaLiturgiaAtual = removerItemDaLiturgiaAtual;
window.duplicarLiturgia = duplicarLiturgia;
window.moverItemAtual = moverItemAtual;