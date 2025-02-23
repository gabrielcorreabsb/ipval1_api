const endpoint = 'http://localhost:8080/produtos';
const catalogo = document.getElementById("containerCatalogo");
const aboutSection = document.querySelector('.about');

// Selecione o input de busca e o botão de busca
const searchTerm = document.querySelector('.searchTerm');
const searchButton = document.querySelector('.searchButton');

// Adicione um evento de clique ao botão de busca
searchButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const termoBusca = searchTerm.value.trim();
    buscarProdutos(termoBusca);
});

/**
 * Busca produtos no endpoint
 * @param {string} termoBusca - Termo de busca
 */
async function buscarProdutos(termoBusca = '') {
    try {
        const response = await fetch(endpoint);
        const produtos = await response.json();
        const produtosFiltrados = filtrarProdutos(produtos, termoBusca);
        renderizarProdutos(produtosFiltrados, catalogo);
        document.getElementById('catalogo').style.display = 'block';
        aboutSection.style.display = 'none';
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }
}

/**
 * Filtra produtos com base no termo de busca
 * @param {array} produtos - Lista de produtos
 * @param {string} termoBusca - Termo de busca
 * @returns {array} Lista de produtos filtrados
 */
function filtrarProdutos(produtos, termoBusca) {
    return produtos.filter((produto) => {
        return produto.nome_produto.toLowerCase().includes(termoBusca.toLowerCase());
    });
}

/**
 * Visualiza um produto
 * @param {object} produto - Produto a ser visualizado
 */
function visualizarProduto(produto) {
    console.log('produto:', produto);

    // Salva o produto selecionado no localStorage
    localStorage.setItem('produtoSelecionado', JSON.stringify(produto));

    if (!produto) {
        return;
    }

    const aboutSection = document.querySelector('.about');

    // Preenche a seção about com o conteúdo do produto usando innerHTML
    aboutSection.innerHTML = `
        <div class="row">
            <div class="image">
                <img src="${produto.imagem_produto}" alt="${produto.nome_produto}" />
            </div>
            <div class="content">
                <h3>${produto.nome_produto}</h3>
                <div class="order-summary">
                    <p><strong>Preço:</strong> R$ ${produto.preco_venda}</p>
                    <p><strong>Descrição:</strong> ${produto.descricao_produto || 'Sem descrição disponível'}</p>
                </div>
                <a href="" target="_blank" id="whatsappLink" class="btn fazer-pedido">
                    <i class="fab fa-whatsapp"></i>
                    <strong>Fazer Pedido</strong>
                </a>
                
            </div>
        </div>
        
    `;

    // Exibe a seção about
    aboutSection.style.display = 'block';
    document.getElementById('catalogo').style.display = 'none';

    // Atualiza o link do WhatsApp após inserir o conteúdo via innerHTML
    const whatsappLink = document.getElementById('whatsappLink');

    // Gera a mensagem a ser enviada no WhatsApp
    const mensagem = `Olá, gostaria de fazer um pedido de ${produto.nome_produto} no valor de R$ ${produto.preco_venda} . Poderia me informar sobre a disponibilidade e o tempo de entrega? `;

    // Formata o link do WhatsApp com a mensagem
    const whatsappBaseUrl = 'https://wa.me/556182611486?text=';
    const whatsappUrl = `${whatsappBaseUrl}${encodeURIComponent(mensagem)}`;

    // Atualiza o href do link dentro do botão com o link do WhatsApp
    whatsappLink.href = whatsappUrl;
}

document.addEventListener('DOMContentLoaded', () => {
    const produtoSelecionado = JSON.parse(localStorage.getItem('produtoSelecionado'));
    if (produtoSelecionado) {
        visualizarProduto(produtoSelecionado);
    } else {
        buscarProdutos();
    }

    const voltarButton = document.querySelector('.voltar');
    voltarButton.addEventListener('click', () => {
        localStorage.removeItem('produtoSelecionado');
        const aboutSection = document.querySelector('.about');
        aboutSection.style.display = 'none';
        document.getElementById('catalogo').style.display = 'block';
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const menuContent = document.getElementById('menu-content');
    const backButton = document.getElementById('back-button-mobile');

    // Alterna o menu quando o botão de hamburguer é clicado
    menuToggle.addEventListener('click', function () {
        menuContent.classList.toggle('show'); // Exibe ou esconde o menu
    });

    // Fecha o menu quando o botão de "Sair" é clicado
    backButton.addEventListener('click', function () {
        menuContent.classList.remove('show'); // Fecha o menu
    });
});