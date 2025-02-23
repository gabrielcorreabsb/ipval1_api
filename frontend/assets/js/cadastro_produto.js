// Configuração do Firebase (substitua com as suas credenciais)
const firebaseConfig = {
    apiKey: "AIzaSyAOrmB_-q1waM7z7uSlIoEv21ZkoVWtoFo",
    authDomain: "meloconfeitaria-c38eb.firebaseapp.com",
    projectId: "meloconfeitaria-c38eb",
    storageBucket: "meloconfeitaria-c38eb.appspot.com",
    messagingSenderId: "1024159650194",
    appId: "1:1024159650194:web:2360939a7c4415ef37714b",
    measurementId: "G-9WYFPY9J9R"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Referência ao Firebase Storage
const storage = firebase.storage();
const storageRef = storage.ref();

// Variáveis para o formulário de produto
const produtos = document.getElementById("produto-form");
const Inome = document.getElementById("nome_produto");
const Ipreco = document.getElementById("preco_venda");
// const IcategoriaProduto = document.getElementById("categoria"); // Comentado - Categoria
const Idescricao = document.getElementById("descricao_produto");

// Variáveis para o formulário de categoria (comentadas)
// const categoriaForm = document.getElementById("categoria-form"); // Comentado - Categoria
// const Icategoria = document.getElementById("nome_categoria"); // Comentado - Categoria

// Função para cadastrar produto com upload da imagem para o Firebase Storage
function cadastroProduto() {
    const preco = parseFloat(Ipreco.value);
    if (isNaN(preco) || preco < 0) {
        alert("Por favor, insira um preço válido.");
        return;
    }

    const produtoData = {
        nome_produto: Inome.value,
        preco_venda: preco.toFixed(2), // Garante 2 casas decimais
        // id_categoria: parseInt(IcategoriaProduto.value), // Converte o valor para um número inteiro - Comentado - Categoria
        descricao_produto: Idescricao.value
    };

    // Obtém o arquivo de imagem (assumindo que há um input type="file" com id="imagem_produto")
    const imagemInput = document.getElementById("imagem_produto");
    const arquivoImagem = imagemInput.files[0];

    if (!arquivoImagem) {
        alert("Por favor, selecione uma imagem.");
        return;
    }

    // Nome único para a imagem (exemplo: nome do produto + timestamp)
    const nomeImagem = `${produtoData.nome_produto}_${Date.now()}_${arquivoImagem.name}`;

    // Referência para o arquivo no Firebase Storage
    const uploadTask = storageRef.child(`produtos/${nomeImagem}`).put(arquivoImagem);

    // Listener para acompanhar o progresso do upload
    uploadTask.on('state_changed', 
        function(snapshot) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Progresso do upload: ' + progress + '%');
        }, 
        function(error) {
            console.error("Erro no upload:", error);
            alert("Erro ao fazer upload da imagem.");
        }, 
        function() {
            // Upload finalizado com sucesso
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                console.log('URL da imagem:', downloadURL);

                // Adiciona a URL da imagem ao objeto produto
                produtoData.imagem_produto = downloadURL;

                // Agora envia o produto com a URL da imagem para o servidor
                const formData = new FormData();
                formData.append('produto', JSON.stringify(produtoData));

                // Aqui anexamos o arquivo de imagem com o nome 'file', que o backend espera.
                formData.append('file', arquivoImagem); // Certifique-se de que o arquivo está sendo enviado com o nome correto

                fetch("http://localhost:8080/produtos", {
                    method: 'POST',
                    body: formData
                })
                .then(function (res) {
                    if (!res.ok) {
                        return res.text().then(text => { throw new Error(text) });
                    }
                    return res.json();
                })
                .then(function (data) {
                    console.log(data);
                    alert("Produto cadastrado com sucesso!");
                    limparProduto();
                })
                .catch(function (error) {
                    console.error("Erro:", error);
                    alert(error.message);
                });
            });
        }
    );
}

/* Função para carregar categorias (Comentada)
function carregarCategorias() {
    fetch("http://localhost:8080/categorias")
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar categorias');
            }
            return response.json();
        })
        .then(categorias => {
            const selectCategoria = document.getElementById("excluir_categoria");
            const selectCategoriaProduto = document.getElementById("categoria");
            selectCategoria.innerHTML = '';
            selectCategoriaProduto.innerHTML = ''; // Limpa o select de categorias de produtos
            categorias.forEach(categoria => {
                // Cria opções para o select de excluir categorias
                const optionExcluir = document.createElement("option");
                optionExcluir.value = categoria.id_categoria;
                optionExcluir.textContent = categoria.nome_categoria;
                selectCategoria.appendChild(optionExcluir);

                // Cria opções para o select de categorias de produtos
                const optionProduto = document.createElement("option");
                optionProduto.value = categoria.id_categoria;
                optionProduto.textContent = categoria.nome_categoria;
                selectCategoriaProduto.appendChild(optionProduto);
            });
        })
        .catch(error => {
            console.error("Erro:", error);
            alert(error.message);
        });
}
*/

// Função para limpar formulário de produto
function limparProduto() {
    produtos.reset();
}

/* Função para cadastrar categoria (Comentada)
function cadastroCategoria() {
    fetch("http://localhost:8080/categorias", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            nome_categoria: Icategoria.value,
        })
    })
    .then(function (res) {
        console.log(res);
        if (res.ok) {
            alert("Categoria cadastrada com sucesso!");
            window.location.reload();
        } else {
            alert("Erro ao cadastrar categoria.");
        }
    })
    .catch(function (error) {
        console.log(error);
        alert("Erro ao cadastrar categoria.");
    });
}
*/

/* Função para excluir categoria (Comentada)
function excluirCategoria() {
    const select = document.getElementById("excluir_categoria");
    const id_categoria = select.options[select.selectedIndex].value;
    
    console.log('id_categoria:', id_categoria);
    
    if (id_categoria === "") {
        alert("Por favor, selecione uma categoria para excluir.");
        return;
    }

    fetch(`http://localhost:8080/categorias/${id_categoria}`, {
        method: 'DELETE'
    })
    .then(function (res) {
        if (res.ok) {
            alert("Categoria excluída com sucesso!");
            window.location.reload();
        } else {
            alert("Erro ao excluir categoria.");
        }
    })
    .catch(function (error) {
        console.log(error);
        alert("Erro ao excluir categoria.");
    });
}
*/

/* Função para limpar formulário de categoria (Comentada)
function limparCategoria() {
    Icategoria.value = "";
}
*/

// Eventos
// document.addEventListener("DOMContentLoaded", carregarCategorias); // Comentado - Categoria
// const excluirCategoriaForm = document.getElementById("excluir-categoria-form"); // Comentado - Categoria

// excluirCategoriaForm.addEventListener('submit', function (event) { // Comentado - Categoria
//     event.preventDefault();
//     excluirCategoria();
// });

produtos.addEventListener('submit', function (event) {
    event.preventDefault();
    cadastroProduto();
});

// categoriaForm.addEventListener('submit', function (event) { // Comentado - Categoria
//     event.preventDefault();
//     cadastroCategoria();
//     limparCategoria();
// });

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

const backbutton = document.getElementById('back-button');
if (backbutton) {
    backbutton.addEventListener('click', logout);
}

document.addEventListener('DOMContentLoaded', () => {
    verificarSessao();
});

