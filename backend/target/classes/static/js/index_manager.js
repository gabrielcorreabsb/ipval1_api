const endpoint = 'http://localhost:8080/produtos';
const catalogo = document.getElementById("containerCatalogo");


// Selecione o input de busca e o botão de busca
const searchTerm = document.querySelector('.searchTerm');
const searchButton = document.querySelector('.searchButton');
const cadastrarButtonMobile = document.querySelector('#menu-content .cadastrar-button');
cadastrarButtonMobile.addEventListener('click', function () {
    window.location.href = '/projeto_web/cadastro_produto.html';
});

// Adicione um evento de clique ao botão de busca
searchButton.addEventListener('click', async (e) => {
    e.preventDefault(); // Impede o comportamento padrão do botão
    const termoBusca = searchTerm.value.trim();
    buscarProdutos(termoBusca);
});


document.getElementById('menu-toggle').addEventListener('click', function() {
    const menuContent = document.getElementById('menu-content');
    if (menuContent.style.display === 'block') {
        menuContent.style.display = 'none';
    } else {
        menuContent.style.display = 'block';
    }
});

async function buscarProdutos(termoBusca = '') {
    try {
        console.log('Buscando produtos...');
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const produtos = await response.json();
        console.log('Produtos recebidos:', produtos);
        const produtosFiltrados = filtrarProdutos(produtos, termoBusca);
        console.log('Produtos filtrados:', produtosFiltrados);
        renderizarProdutos(produtosFiltrados, catalogo);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }
}

function filtrarProdutos(produtos, termoBusca) {
    return produtos.filter((produto) => {
        return produto.nome_produto.toLowerCase().includes(termoBusca.toLowerCase());
    });
}

function criarElementoProduto(produto) { // função para exibir o produto
    const elemento = document.createElement('div');
    elemento.classList.add('box');
    elemento.innerHTML = `
    <img class="img" src="${produto.imagem_produto}" alt="${produto.nome_produto}" />
    <h3 class="produto-nome" contenteditable="false">${produto.nome_produto}</h3>
    <div class="price" contenteditable="false">R$ ${produto.preco_venda}</div>
    <div class="descricao" contenteditable="false">DESCRIÇÃO: ${produto.descricao_produto}</div>
    <br>
    <button class="btn-editar" data-id="${produto.id_produto}">Editar</button>
    <button class="btn-salvar" data-id="${produto.id_produto}" style="display:none;">Salvar</button>
    <button class="btn-excluir" data-id="${produto.id_produto}">Excluir</button>
  `;
    return elemento;
}

function renderizarProdutos(produtos, container) { // função de renderização do produto no container
    console.log('Renderizando produtos...');
    if (!container) {
        console.error('Container não encontrado!');
        return;
    }
    container.innerHTML = '';
    if (produtos.length === 0) {
        container.innerHTML = ' <center><h3>Nenhum produto encontrado</h3></center>';
        return;
    }
    produtos.forEach((produto) => {
        const elemento = criarElementoProduto(produto);
        container.appendChild(elemento);
    });

    container.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', (e) => iniciarEdicao(e.target));
    });

    container.querySelectorAll('.btn-salvar').forEach(btn => {
        btn.addEventListener('click', (e) => salvarEdicao(e.target));
    });

    container.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', (e) => excluirProduto(e.target.dataset.id));
    });
}

function iniciarEdicao(btn) {
    const produtoBox = btn.closest('.box');
    const nome = produtoBox.querySelector('.produto-nome');
    const preco = produtoBox.querySelector('.price');
    const descricao = produtoBox.querySelector('.descricao');

    // Adiciona labels
    nome.innerHTML = `<label for="nome-edit-${produtoBox.dataset.id}">Nome:</label><input type="text" value="${nome.textContent}" id="nome-edit-${produtoBox.dataset.id}" class="edit-input nome-edit">`;
    preco.innerHTML = `<label for="preco-edit-${produtoBox.dataset.id}">Preço:</label><input type="number" value="${preco.textContent.replace('R$ ', '')}" step="0.01" min="0" id="preco-edit-${produtoBox.dataset.id}" class="edit-input preco-edit">`;
    descricao.innerHTML = `<label for="descricao-edit-${produtoBox.dataset.id}">Descrição:</label><input type="text" value="${descricao.textContent.replace('DESCRIÇÃO: ', '')}" id="descricao-edit-${produtoBox.dataset.id}" class="edit-input descricao-edit">`;


    btn.style.display = 'none';
    produtoBox.querySelector('.btn-salvar').style.display = 'inline-block';
}


//Adicione o atributo data-id ao .box
function criarElementoProduto(produto) { // função para exibir o produto
    const elemento = document.createElement('div');
    elemento.classList.add('box');
    elemento.dataset.id = produto.id_produto; // Define o atributo data-id
    elemento.innerHTML = `
    <img class="img" src="${produto.imagem_produto}" alt="${produto.nome_produto}" />
    <h3 class="produto-nome" contenteditable="false">${produto.nome_produto}</h3>
    <div class="price" contenteditable="false">R$ ${produto.preco_venda}</div>
    <div class="descricao" contenteditable="false">DESCRIÇÃO: ${produto.descricao_produto}</div>
    <br>
    <button class="btn-editar" data-id="${produto.id_produto}">Editar</button>
    <button class="btn-salvar" data-id="${produto.id_produto}" style="display:none;">Salvar</button>
    <button class="btn-excluir" data-id="${produto.id_produto}">Excluir</button>
  `;
    return elemento;
}

async function salvarEdicao(btn) {
    const produtoBox = btn.closest('.box');
    const id = btn.dataset.id;
    const nomeInput = produtoBox.querySelector('.nome-edit');
    const precoInput = produtoBox.querySelector('.preco-edit');
    const descricaoInput = produtoBox.querySelector('.descricao-edit');

    try {
        const response = await fetch(`${endpoint}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id_produto: id,
                nome_produto: nomeInput.value.trim(),
                preco_venda: parseFloat(precoInput.value.trim()),
                descricao_produto: descricaoInput.value.trim()
            }),
        });
        if (response.ok) {
            const produtoAtualizado = await response.json();
            atualizarProdutoNaView(produtoBox, produtoAtualizado);
        } else {
            console.error('Erro ao editar produto');
            buscarProdutos();
        }
    } catch (error) {
        console.error('Erro ao editar produto:', error);
        buscarProdutos();
    }
}

function criarCampoEdicao(tipo, valor, atributos = {}) {
    let campo;
    if (tipo === 'select') {
        campo = document.createElement('select');
        // Aqui você precisaria adicionar as opções do select
    } else {
        campo = document.createElement('input');
        campo.type = tipo;
    }
    campo.value = valor;
    for (let [key, value] of Object.entries(atributos)) {
        campo.setAttribute(key, value);
    }
    return campo;
}

function atualizarProdutoNaView(produtoBox, produto) {
    const nome = produtoBox.querySelector('.produto-nome');
    const preco = produtoBox.querySelector('.price');
    const descricao = produtoBox.querySelector('.descricao');

    nome.innerHTML = produto.nome_produto;
    preco.innerHTML = `R$ ${produto.preco_venda.toFixed(2)}`;
    descricao.innerHTML = `DESCRIÇÃO: ${produto.descricao_produto}`;

    produtoBox.querySelector('.btn-editar').style.display = 'inline-block';
    produtoBox.querySelector('.btn-salvar').style.display = 'none';
}

async function excluirProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        try {
            const response = await fetch(`${endpoint}/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const produtoBox = document.querySelector(`.btn-excluir[data-id="${id}"]`).closest('.box');
                produtoBox.remove();
            } else {
                console.error('Erro ao excluir produto');
            }
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    verificarSessao();
    buscarProdutos();
    const cadastrarButton = document.getElementById('cadastrar-button');
    
    if (cadastrarButton) {
        cadastrarButton.addEventListener('click', function() {
            window.location.href = '/projeto_web/cadastro_produto.html'; // Ajuste o caminho conforme necessário
        });
    }
});


// Função para verificar se o usuário está autenticado
function verificarSessao() {
    const userSession = sessionStorage.getItem('userSession');
    
    if (!userSession) {
        // Se não houver sessão, redireciona para a página de login
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '/projeto_web/login.html';  // Ajuste o caminho para a sua página de login
    } else {
        console.log('Usuário autenticado:', JSON.parse(userSession));
    }
}

function logout() {
    // Limpa a sessão do usuário
    sessionStorage.removeItem('userSession');

    // Redireciona para a página de login
    window.location.href = '/projeto_web/login.html';  // Ajuste o caminho para a sua página de login
}
const backButtonMobile = document.querySelector('#menu-content .back-button');
const backButton = document.getElementById('back-button');
if (backButton) {
    backButtonMobile.addEventListener('click', logout);
    backButton.addEventListener('click', logout);
}



