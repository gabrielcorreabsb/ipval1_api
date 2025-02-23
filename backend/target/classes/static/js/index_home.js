const endpoint = 'http://localhost:8080/produtos';
const catalogo = document.getElementById("containerCatalogo");
const catalogo2 = document.getElementById("containerCatalogo2");

// Selecione o input de busca e o botão de busca
const searchTerm = document.querySelector('.searchTerm');
const searchButton = document.querySelector('.searchButton');

// Adicione um evento de clique ao botão de busca
searchButton.addEventListener('click', async (e) => {
    e.preventDefault(); // Impede o comportamento padrão do botão

    // Obtenha o termo de busca do input
    const termoBusca = searchTerm.value.trim();

    // Busque os produtos e renderize-os no catálogo
    buscarProdutos(termoBusca);
});

async function buscarProdutos(termoBusca = '') {
    try {
        const response = await fetch(endpoint);
        const produtos = await response.json();
        const produtosFiltrados = filtrarProdutos(produtos, termoBusca);
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

function criarElementoProduto(produto) {
    const elemento = document.createElement('div');
    elemento.classList.add('box');
    elemento.innerHTML = `
    <img class="img" src="${produto.imagem_produto}" alt="${produto.nome_produto}" /> 
    <h3>${produto.nome_produto}</h3>
    <div class="price">R$ ${produto.preco_venda}</div>
    <button id="candy2" type="submit" class="btn">
     <a href="https://wa.me/556182611486?text=Olá,%20gostaria%20de%20fazer%20um%20pedido%20de%20${produto.nome_produto}%20no%20valor%20de%20R$%20${produto.preco_venda}%20%F0%9F%8D%B0%F0%9F%8E%82.%20Poderia%20me%20informar%20sobre%20a%20disponibilidade%20e%20o%20tempo%20de%20entrega?%20%F0%9F%95%92">
  <i class="fab fa-whatsapp"></i> Fazer Pedido
</a>
    </button>
    <button id="candy3" type="submit" class="btn visualizar-produto">
     Visualizar produto
    </button>
  `;

    elemento.querySelector('.visualizar-produto').addEventListener('click', () => {
        visualizarProduto(produto);
    });

    return elemento;
}

function renderizarProdutos(produtos, container) {
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
}



document.addEventListener('DOMContentLoaded', () => {
    buscarProdutos();
});

function visualizarProduto(produto) {
    // Armazene os dados do produto no localStorage
    localStorage.setItem('produtoSelecionado', JSON.stringify(produto));
    
    // Redirecione para a página do produto
    window.location.href = '/projeto_web/produto_view.html';
}

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