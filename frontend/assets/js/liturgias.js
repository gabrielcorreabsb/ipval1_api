// assets/js/liturgias.js

// Variáveis globais para armazenar dados carregados
let todasAsLiturgias = [];
let versoesBibliaDisponiveis = [];
let livrosBibliaDisponiveis = [];

// Estado para o formulário de itens
let editandoItemIndex = null; // Se estiver editando um item existente, guarda seu índice
let itensDaLiturgiaAtual = []; // Array para guardar os itens da liturgia sendo criada/editada

// Elementos do DOM (modal de item)
const itemModal = document.getElementById('liturgyItemModal');
const itemForm = document.getElementById('liturgyItemForm');
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


// --- Funções de Utilidade e Configuração (reutilize ou adapte de membros.js) ---
function mostrarMensagem(texto, tipo) {
    Swal.fire({
        text: texto,
        icon: tipo,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: tipo === 'error' ? 5000 : 3000,
        timerProgressBar: true
    });
}

// Adapte getUsuarioLogado, isPastor, verificarAutenticacao de membros.js se necessário.
// Supondo que AuthService e CONFIG já estão definidos e carregados globalmente.
async function verificarAutenticacaoLiturgy() {
    if (!AuthService.isAuthenticated()) {
        window.location.replace('../login.html'); // Ajuste o caminho para login
        return false;
    }
    return true;
}

function isPastor() { // Ou qualquer role que possa gerenciar liturgias
    const user = AuthService.getUser();
    return user && user.cargo === 'PASTOR'; // Ajuste conforme seu objeto user e roles
}

// --- Funções Específicas para Liturgias ---

async function carregarDadosIniciais() {
    try {
        // Em paralelo para mais performance
        const [versoes, livros, liturgias] = await Promise.all([
            getBibleVersionsLocal(), // Do seu api.js (chamando seu backend)
            getBibleBooksLocal(),    // Do seu api.js (chamando seu backend)
            getLiturgias()           // Do seu api.js (chamando seu backend)
        ]);

        versoesBibliaDisponiveis = versoes || [];
        livrosBibliaDisponiveis = livros || [];
        todasAsLiturgias = liturgias || [];

        popularSelectLivros();
        exibirLiturgias(todasAsLiturgias);

    } catch (error) {
        console.error("Erro ao carregar dados iniciais para liturgias:", error);
        mostrarMensagem('Falha ao carregar dados iniciais. Tente recarregar a página.', 'error');
    }
}

function popularSelectLivros() {
    itemLivroBibliaSelect.innerHTML = '<option value="">Selecione o Livro</option>';
    if (livrosBibliaDisponiveis && livrosBibliaDisponiveis.length > 0) {
        livrosBibliaDisponiveis.forEach(livro => {
            const option = document.createElement('option');
            option.value = livro.enumNome; // Ex: "GENESIS"
            option.textContent = livro.nomeCompleto; // Ex: "Gênesis"
            itemLivroBibliaSelect.appendChild(option);
        });
    }
}

function exibirLiturgias(liturgias) {
    const grid = document.getElementById('liturgiesGrid');
    grid.innerHTML = ''; // Limpa o grid

    if (!liturgias || liturgias.length === 0) {
        grid.innerHTML = '<p>Nenhuma liturgia encontrada.</p>';
        return;
    }

    liturgias.forEach(liturgia => {
        const card = criarCardLiturgia(liturgia);
        grid.appendChild(card);
    });
}

function criarCardLiturgia(liturgia) {
    const card = document.createElement('div');
    card.className = 'liturgy-card';
    card.dataset.id = liturgia.id;

    const dataFormatada = new Date(liturgia.data + "T00:00:00").toLocaleDateString('pt-BR', {timeZone: 'UTC'});
    const versaoNome = versoesBibliaDisponiveis.find(v => v.enumNome === liturgia.versaoBibliaPadrao)?.nomeCompleto || liturgia.versaoBibliaPadrao;

    let itemsHtml = '<p><em>Nenhum item cadastrado.</em></p>';
    if (liturgia.itens && liturgia.itens.length > 0) {
        itemsHtml = '<ul class="liturgy-items-list">';
        liturgia.itens.slice(0, 5).forEach(item => { // Mostra os 5 primeiros itens como preview
            let itemDisplay = `${item.ordem}. <span class="item-type-badge">[${formatarTipoItem(item.tipo)}]</span> `;
            if (item.tipo === 'REFERENCIA_BIBLICA') {
                itemDisplay += item.referenciaDisplayFormatada || 'Referência não especificada';
            } else {
                itemDisplay += (item.conteudoTextual || 'Conteúdo não especificado').substring(0, 50) + '...';
            }
            itemsHtml += `<li>${itemDisplay}</li>`;
        });
        if (liturgia.itens.length > 5) {
            itemsHtml += `<li>... e mais ${liturgia.itens.length - 5} item(ns).</li>`;
        }
        itemsHtml += '</ul>';
    }


    card.innerHTML = `
        <div class="liturgy-info">
            <h3>${liturgia.titulo}</h3>
            <p><i class="fas fa-calendar-alt"></i> Data: ${dataFormatada}</p>
            <p><i class="fas fa-book-open"></i> Versão Bíblia: ${versaoNome}</p>
            <p><i class="fas fa-info-circle"></i> Descrição: ${liturgia.descricao || 'N/A'}</p>
        </div>
        <h4>Itens da Liturgia (Prévia):</h4>
        ${itemsHtml}
        <div class="liturgy-actions">
            ${isPastor() ? `
                <button onclick="editarLiturgia(${liturgia.id})" class="btn-edit" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>,
                <button onclick="excluirLiturgia(${liturgia.id})" class="btn-delete" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            ` : ''}
            <button onclick="visualizarLiturgiaCompleta(${liturgia.id})" class="btn btn-primary" title="Visualizar Completa">
                <i class="fas fa-eye"></i> Visualizar
            </button>
        </div>
    `;
    return card;
}

function formatarTipoItem(tipoEnum) {
    const nomes = {
        TITULO_SECAO: "Título",
        TEXTO_SIMPLES: "Texto",
        REFERENCIA_BIBLICA: "Bíblia",
        HINO: "Hino",
        ANUNCIO: "Anúncio",
        ORACAO_COMUNITARIA: "Oração"
    };
    return nomes[tipoEnum] || tipoEnum;
}

async function abrirModalNovaLiturgia() {
    if (!isPastor()) {
        mostrarMensagem('Você não tem permissão para criar liturgias.', 'error');
        return;
    }
    itensDaLiturgiaAtual = []; // Limpa itens para uma nova liturgia
    editandoLiturgiaId = null; // Garante que não está editando

    const versoesOptionsHtml = versoesBibliaDisponiveis
        .map(v => `<option value="${v.enumNome}">${v.nomeCompleto}</option>`)
        .join('');

    const { value: formValues, isConfirmed } = await Swal.fire({
        title: 'Nova Liturgia',
        html: `
            <input id="swal-liturgia-titulo" class="swal2-input" placeholder="Título da Liturgia" required>
            <input id="swal-liturgia-data" type="date" class="swal2-input" required>
            <select id="swal-liturgia-versao" class="swal2-select" required>
                <option value="">Selecione a Versão da Bíblia</option>
                ${versoesOptionsHtml}
            </select>
            <textarea id="swal-liturgia-descricao" class="swal2-textarea" placeholder="Descrição (opcional)"></textarea>
            
            <div id="itemsContainer" style="margin-top: 20px; text-align: left; border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
                <h3>Itens da Liturgia:</h3>
                <div id="swal-items-list"><i>Nenhum item adicionado.</i></div>
                <button type="button" id="swal-btn-adicionar-item" class="swal2-confirm swal2-styled" style="margin-top:10px;">Adicionar Item</button>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Salvar Liturgia',
        cancelButtonText: 'Cancelar',
        width: '800px', // Modal maior
        didOpen: () => {
            // Adicionar evento ao botão "Adicionar Item" DENTRO do modal do Swal
            document.getElementById('swal-btn-adicionar-item').addEventListener('click', () => {
                abrirModalItemLiturgia(); // Abre o modal menor para o item
            });
            renderItensLiturgiaNoSwal(); // Renderiza itens já existentes (se houver)
        },
        preConfirm: () => {
            const titulo = document.getElementById('swal-liturgia-titulo').value;
            const data = document.getElementById('swal-liturgia-data').value;
            const versaoBibliaPadrao = document.getElementById('swal-liturgia-versao').value;

            if (!titulo || !data || !versaoBibliaPadrao) {
                Swal.showValidationMessage('Título, Data e Versão da Bíblia são obrigatórios.');
                return false;
            }
            if (itensDaLiturgiaAtual.length === 0) {
                Swal.showValidationMessage('Adicione pelo menos um item à liturgia.');
                return false;
            }
            return {
                titulo,
                data,
                versaoBibliaPadrao,
                descricao: document.getElementById('swal-liturgia-descricao').value,
                itens: itensDaLiturgiaAtual // Array de objetos ItemLiturgiaDTO
            };
        }
    });

    if (isConfirmed && formValues) {
        try {
            await createLiturgy(formValues); // Função da sua api.js
            mostrarMensagem('Liturgia criada com sucesso!', 'success');
            await carregarDadosIniciais(); // Recarrega tudo
        } catch (error) {
            mostrarMensagem(`Erro ao criar liturgia: ${error.message}`, 'error');
        }
    }
}

let editandoLiturgiaId = null; // Para saber qual liturgia está sendo editada

async function editarLiturgia(id) {
    if (!isPastor()) {
        mostrarMensagem('Você não tem permissão para editar liturgias.', 'error');
        return;
    }
    editandoLiturgiaId = id;

    try {
        const liturgia = await getLiturgyById(id); // Função da api.js
        if (!liturgia) {
            mostrarMensagem('Liturgia não encontrada.', 'error');
            return;
        }
        itensDaLiturgiaAtual = [...liturgia.itens]; // Copia os itens para edição

        const versoesOptionsHtml = versoesBibliaDisponiveis
            .map(v => `<option value="${v.enumNome}" ${liturgia.versaoBibliaPadrao === v.enumNome ? 'selected' : ''}>${v.nomeCompleto}</option>`)
            .join('');

        const { value: formValues, isConfirmed } = await Swal.fire({
            title: 'Editar Liturgia',
            html: `
                <input id="swal-liturgia-titulo" class="swal2-input" placeholder="Título da Liturgia" value="${liturgia.titulo}" required>
                <input id="swal-liturgia-data" type="date" class="swal2-input" value="${liturgia.data}" required>
                <select id="swal-liturgia-versao" class="swal2-select" required>
                    <option value="">Selecione a Versão da Bíblia</option>
                    ${versoesOptionsHtml}
                </select>
                <textarea id="swal-liturgia-descricao" class="swal2-textarea" placeholder="Descrição (opcional)">${liturgia.descricao || ''}</textarea>
                
                <div id="itemsContainer" style="margin-top: 20px; text-align: left; border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
                    <h3>Itens da Liturgia:</h3>
                    <div id="swal-items-list"></div>
                    <button type="button" id="swal-btn-adicionar-item" class="swal2-confirm swal2-styled" style="margin-top:10px;">Adicionar Item</button>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Salvar Alterações',
            cancelButtonText: 'Cancelar',
            width: '800px',
            didOpen: () => {
                document.getElementById('swal-btn-adicionar-item').addEventListener('click', () => {
                    editandoItemIndex = null; // Novo item
                    abrirModalItemLiturgia();
                });
                renderItensLiturgiaNoSwal();
            },
            preConfirm: () => {
                const titulo = document.getElementById('swal-liturgia-titulo').value;
                const data = document.getElementById('swal-liturgia-data').value;
                const versaoBibliaPadrao = document.getElementById('swal-liturgia-versao').value;

                if (!titulo || !data || !versaoBibliaPadrao) {
                    Swal.showValidationMessage('Título, Data e Versão da Bíblia são obrigatórios.');
                    return false;
                }
                if (itensDaLiturgiaAtual.length === 0) {
                    Swal.showValidationMessage('Adicione pelo menos um item à liturgia.');
                    return false;
                }
                return {
                    id: liturgia.id, // Importante para atualização
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
                await updateLiturgy(id, formValues); // Função da api.js
                mostrarMensagem('Liturgia atualizada com sucesso!', 'success');
                await carregarDadosIniciais();
            } catch (error) {
                mostrarMensagem(`Erro ao atualizar liturgia: ${error.message}`, 'error');
            }
        }
    } catch (error) {
        mostrarMensagem(`Erro ao carregar dados da liturgia: ${error.message}`, 'error');
    }
}


async function excluirLiturgia(id) {
    if (!isPastor()) {
        mostrarMensagem('Você não tem permissão para excluir liturgias.', 'error');
        return;
    }

    const result = await Swal.fire({
        title: 'Confirmar exclusão',
        text: `Deseja realmente excluir a liturgia ID ${id}? Esta ação não pode ser desfeita.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
        try {
            await deleteLiturgy(id); // Função da api.js
            mostrarMensagem('Liturgia excluída com sucesso!', 'success');
            await carregarDadosIniciais(); // Recarrega
        } catch (error) {
            mostrarMensagem(`Erro ao excluir liturgia: ${error.message}`, 'error');
        }
    }
}

function visualizarLiturgiaCompleta(id) {
    // Implementar a visualização completa
    // Pode ser uma nova página ou um modal grande mostrando todos os itens
    // Onde o frontend faria as chamadas para a API da Bíblia Digital
    const liturgia = todasAsLiturgias.find(l => l.id === id);
    if (!liturgia) {
        mostrarMensagem('Liturgia não encontrada para visualização.', 'error');
        return;
    }
    // Por enquanto, apenas um log. Idealmente, abriria uma nova view/modal.
    console.log("Visualizar Liturgia Completa:", liturgia);
    alert(`Visualizar Liturgia: ${liturgia.titulo}\n(Implementação pendente para mostrar itens com texto bíblico)`);
    // Aqui você pode redirecionar para uma página de visualização pública
    // passando o ID, ou abrir um modal grande e carregar os itens,
    // e para cada item de REFERENCIA_BIBLICA, chamar fetchVerseFromBibleDigital.
}


// --- Funções para Gerenciar Itens da Liturgia (dentro do modal principal) ---

function renderItensLiturgiaNoSwal() {
    const listDiv = document.getElementById('swal-items-list');
    if (!listDiv) return;

    listDiv.innerHTML = ''; // Limpa a lista

    if (itensDaLiturgiaAtual.length === 0) {
        listDiv.innerHTML = '<i>Nenhum item adicionado.</i>';
        return;
    }

    const ul = document.createElement('ul');
    ul.style.listStyleType = 'none';
    ul.style.paddingLeft = '0';

    itensDaLiturgiaAtual.sort((a, b) => a.ordem - b.ordem); // Garante a ordem

    itensDaLiturgiaAtual.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'editable-item'; // Estilizar esta classe em liturgias.css

        let displayText = `${item.ordem}. [${formatarTipoItem(item.tipo)}] `;
        if (item.tipo === 'REFERENCIA_BIBLICA') {
            displayText += item.referenciaDisplayFormatada || item.livroBiblia || 'Referência';
        } else {
            displayText += (item.conteudoTextual || 'Conteúdo do item').substring(0, 30) + '...';
        }

        li.innerHTML = `
            <span>${displayText}</span>
            <div class="item-actions">
                <button type="button" class="edit-item-btn" onclick="abrirModalItemLiturgia(${index})">Editar</button>
                <button type="button" class="delete-item-btn" onclick="removerItemDaLiturgia(${index})">Remover</button>
                ${index > 0 ? `<button type="button" onclick="moverItem(${index}, -1)">▲</button>` : ''} <!-- Cima -->
                ${index < itensDaLiturgiaAtual.length - 1 ? `<button type="button" onclick="moverItem(${index}, 1)">▼</button>` : ''} <!-- Baixo -->
            </div>
        `;
        ul.appendChild(li);
    });
    listDiv.appendChild(ul);
}

function abrirModalItemLiturgia(index = null) {
    itemForm.reset(); // Limpa o formulário
    editandoItemIndex = index;
    controlarVisibilidadeCamposItem(); // Esconde todos os campos específicos inicialmente

    if (index !== null && itensDaLiturgiaAtual[index]) {
        // Editando item existente
        const item = itensDaLiturgiaAtual[index];
        document.getElementById('itemLiturgiaId').value = item.id || ''; // Se tiver ID (vindo do backend)
        itemTipoSelect.value = item.tipo;
        controlarVisibilidadeCamposItem(); // Mostra campos corretos para o tipo

        itemConteudoTextualInput.value = item.conteudoTextual || '';
        itemHinoConteudoInput.value = item.conteudoTextual || ''; // Assumindo que HINO usa conteudoTextual

        if (item.tipo === 'REFERENCIA_BIBLICA') {
            itemLivroBibliaSelect.value = item.livroBiblia || '';
            itemCapituloBibliaInput.value = item.capituloBiblia || '';
            itemVersiculoInicioBibliaInput.value = item.versiculoInicioBiblia || '';
            itemVersiculoFimBibliaInput.value = item.versiculoFimBiblia || '';
            itemReferenciaDisplayInput.value = item.referenciaDisplayFormatada || '';
        }
    } else {
        // Novo item
        document.getElementById('itemLiturgiaId').value = '';
        itemTipoSelect.value = ""; // Força seleção
        controlarVisibilidadeCamposItem();
    }
    itemModal.style.display = 'flex';
}

function fecharModalItemLiturgia() {
    itemModal.style.display = 'none';
    editandoItemIndex = null;
}

itemTipoSelect.addEventListener('change', controlarVisibilidadeCamposItem);

function controlarVisibilidadeCamposItem() {
    const tipo = itemTipoSelect.value;
    itemConteudoTextualDiv.style.display = 'none';
    itemReferenciaBiblicaDiv.style.display = 'none';
    itemHinoDiv.style.display = 'none';

    if (tipo === 'TITULO_SECAO' || tipo === 'TEXTO_SIMPLES' || tipo === 'ANUNCIO' || tipo === 'ORACAO_COMUNITARIA') {
        itemConteudoTextualDiv.style.display = 'block';
    } else if (tipo === 'REFERENCIA_BIBLICA') {
        itemReferenciaBiblicaDiv.style.display = 'block';
    } else if (tipo === 'HINO') {
        itemHinoDiv.style.display = 'block'; // Usando um campo separado para Hino
    }
}

itemForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const tipo = itemTipoSelect.value;
    if (!tipo) {
        mostrarMensagem('Selecione o tipo do item.', 'error');
        return;
    }

    const itemData = {
        id: document.getElementById('itemLiturgiaId').value || null, // null se novo
        tipo: tipo,
        // ordem será definida/atualizada depois
        conteudoTextual: null,
        livroBiblia: null,
        capituloBiblia: null,
        versiculoInicioBiblia: null,
        versiculoFimBiblia: null,
        referenciaDisplayFormatada: null
    };

    if (tipo === 'TITULO_SECAO' || tipo === 'TEXTO_SIMPLES' || tipo === 'ANUNCIO' || tipo === 'ORACAO_COMUNITARIA') {
        itemData.conteudoTextual = itemConteudoTextualInput.value;
        if (!itemData.conteudoTextual.trim()) {
            mostrarMensagem('O conteúdo textual é obrigatório para este tipo de item.', 'error');
            return;
        }
    } else if (tipo === 'REFERENCIA_BIBLICA') {
        itemData.livroBiblia = itemLivroBibliaSelect.value;
        itemData.capituloBiblia = parseInt(itemCapituloBibliaInput.value, 10) || null;
        itemData.versiculoInicioBiblia = parseInt(itemVersiculoInicioBibliaInput.value, 10) || null;
        itemData.versiculoFimBiblia = parseInt(itemVersiculoFimBibliaInput.value, 10) || null;
        itemData.referenciaDisplayFormatada = itemReferenciaDisplayInput.value.trim();

        if (!itemData.livroBiblia || !itemData.capituloBiblia || !itemData.versiculoInicioBiblia) {
            mostrarMensagem('Livro, Capítulo e Versículo Início são obrigatórios para Referência Bíblica.', 'error');
            return;
        }
        if (!itemData.referenciaDisplayFormatada) { // Tenta gerar se não preenchido
            const livroSelecionado = livrosBibliaDisponiveis.find(l => l.enumNome === itemData.livroBiblia);
            let ref = `${livroSelecionado ? livroSelecionado.nomeCompleto : itemData.livroBiblia} ${itemData.capituloBiblia}:${itemData.versiculoInicioBiblia}`;
            if (itemData.versiculoFimBiblia && itemData.versiculoFimBiblia > itemData.versiculoInicioBiblia) {
                ref += `-${itemData.versiculoFimBiblia}`;
            }
            itemData.referenciaDisplayFormatada = ref;
        }

    } else if (tipo === 'HINO') {
        itemData.conteudoTextual = itemHinoConteudoInput.value; // Hino usa conteudoTextual
        if (!itemData.conteudoTextual.trim()) {
            mostrarMensagem('O título/número do hino é obrigatório.', 'error');
            return;
        }
    }

    if (editandoItemIndex !== null) {
        // Editando item existente
        itemData.ordem = itensDaLiturgiaAtual[editandoItemIndex].ordem; // Mantém a ordem
        itensDaLiturgiaAtual[editandoItemIndex] = itemData;
    } else {
        // Novo item
        itemData.ordem = itensDaLiturgiaAtual.length + 1;
        itensDaLiturgiaAtual.push(itemData);
    }

    reordenarItensAutomaticamente();
    renderItensLiturgiaNoSwal();
    fecharModalItemLiturgia();
});

function removerItemDaLiturgia(index) {
    itensDaLiturgiaAtual.splice(index, 1);
    reordenarItensAutomaticamente();
    renderItensLiturgiaNoSwal();
}

function moverItem(index, direcao) { // direcao: -1 para cima, 1 para baixo
    if (direcao === -1 && index > 0) { // Mover para cima
        [itensDaLiturgiaAtual[index], itensDaLiturgiaAtual[index - 1]] = [itensDaLiturgiaAtual[index - 1], itensDaLiturgiaAtual[index]];
    } else if (direcao === 1 && index < itensDaLiturgiaAtual.length - 1) { // Mover para baixo
        [itensDaLiturgiaAtual[index], itensDaLiturgiaAtual[index + 1]] = [itensDaLiturgiaAtual[index + 1], itensDaLiturgiaAtual[index]];
    }
    reordenarItensAutomaticamente();
    renderItensLiturgiaNoSwal();
}

function reordenarItensAutomaticamente() {
    itensDaLiturgiaAtual.forEach((item, idx) => {
        item.ordem = idx + 1;
    });
}


// --- Inicialização ---
document.addEventListener('DOMContentLoaded', async () => {
    if (!await verificarAutenticacaoLiturgy()) return;

    // Configurar logout (reutilize do seu menu.js ou auth.js)
    const logoutBtnDesktop = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');
    if (logoutBtnDesktop) logoutBtnDesktop.addEventListener('click', () => AuthService.logout());
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', () => AuthService.logout());

    // Configurar pesquisa
    const searchInput = document.getElementById('searchInputLiturgy');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const liturgiasFiltradas = todasAsLiturgias.filter(lit =>
                lit.titulo.toLowerCase().includes(termo) ||
                new Date(lit.data + "T00:00:00").toLocaleDateString('pt-BR').includes(termo)
            );
            exibirLiturgias(liturgiasFiltradas);
        });
    }

    await carregarDadosIniciais();
});

// Tornar funções acessíveis globalmente se chamadas por onclick no HTML
window.abrirModalNovaLiturgia = abrirModalNovaLiturgia;
window.editarLiturgia = editarLiturgia;
window.excluirLiturgia = excluirLiturgia;
window.visualizarLiturgiaCompleta = visualizarLiturgiaCompleta;
window.abrirModalItemLiturgia = abrirModalItemLiturgia;
window.fecharModalItemLiturgia = fecharModalItemLiturgia;
window.removerItemDaLiturgia = removerItemDaLiturgia;
window.moverItem = moverItem;