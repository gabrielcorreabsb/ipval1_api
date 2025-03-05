// Configuração do TinyMCE
function initTinyMCE(selector) {
    return tinymce.init({
        selector: selector,
        height: 400,
        menubar: false,
        language: 'pt_BR',
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
        content_style: `
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                font-size: 16px;
                color: #ffffff;
                background-color: #2b2b2b;
            }
        `,
        skin: 'oxide-dark',
        content_css: 'dark'
    }).then(editors => {
        console.log('Editor inicializado com sucesso');
        return editors[0];
    }).catch(err => {
        console.error('Erro ao inicializar o editor:', err);
        mostrarMensagem('Erro ao inicializar o editor', 'error');
    });
}

// Funções de utilidade
function mostrarMensagem(texto, tipo) {
    Swal.fire({
        text: texto,
        icon: tipo,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: tipo === 'error' ? 5000 : 3000,
        timerProgressBar: true,
        background: 'var(--background)',
        color: 'var(--text)'
    });
}

async function fazerRequisicao(url, options = {}) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.clear();
            window.location.replace('./login.html');
            return null;
        }

        const defaultOptions = {
            method: options.method || 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        console.log('Fazendo requisição para:', url, 'com opções:', finalOptions);

        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Resposta de erro do servidor:', errorBody);

            if (response.status === 401 || response.status === 403) {
                await Swal.fire({
                    title: 'Sessão expirada',
                    text: 'Por favor, faça login novamente.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                localStorage.clear();
                window.location.replace('./login.html');
                return null;
            }
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Funções de verificação
function getUsuarioLogado() {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            console.warn('Nenhum usuário encontrado no localStorage');
            return null;
        }

        const user = JSON.parse(userStr);
        console.log('Usuário recuperado:', user);
        return user;
    } catch (error) {
        console.error('Erro ao recuperar usuário:', error);
        return null;
    }
}

function isPastor() {
    try {
        const user = getUsuarioLogado();
        return user && user.cargo === 'PASTOR';
    } catch (error) {
        console.error('Erro ao verificar cargo:', error);
        return false;
    }
}

function podeGerenciarNoticias() {
    return isPastor();
}

async function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    const user = getUsuarioLogado();

    if (!token || !user) {
        return false;
    }

    return true;
}

// Funções de validação
function validarNoticia(titulo, conteudo) {
    if (!titulo || titulo.trim().length < 5) {
        return {
            valido: false,
            mensagem: 'O título deve ter pelo menos 5 caracteres'
        };
    }

    if (!conteudo || conteudo.trim().length < 10) {
        return {
            valido: false,
            mensagem: 'O conteúdo deve ter pelo menos 10 caracteres'
        };
    }

    return {
        valido: true,
        titulo: titulo.trim(),
        conteudo: conteudo.trim()
    };
}

// Funções principais
async function carregarNoticias() {
    console.log('Iniciando carregamento das notícias');
    try {
        let endpoint;
        const tabAtiva = document.querySelector('.tab-btn.active')?.dataset?.tab || 'todas';

        switch (tabAtiva) {
            case 'aprovadas':
                endpoint = `${CONFIG.API_URL}/noticias/aprovadas`;
                break;
            case 'pendentes':
                endpoint = `${CONFIG.API_URL}/noticias/pendentes`;
                break;
            default:
                endpoint = `${CONFIG.API_URL}/noticias`;
        }

        console.log('Fazendo requisição para:', endpoint);
        const response = await fazerRequisicao(endpoint);

        if (response) {
            console.log('Notícias carregadas:', response);
            filtrarEExibirNoticias(response);
        }
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
        mostrarMensagem('Erro ao carregar notícias', 'error');
    }
}

function filtrarEExibirNoticias(noticiasParam = []) {
    const noticias = Array.isArray(noticiasParam) ? noticiasParam : [];

    const searchTerm = document.getElementById('searchInput')?.value?.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const tabAtiva = document.querySelector('.tab-btn.active')?.dataset?.tab || 'todas';

    let noticiasFiltradas = [...noticias];

    if (searchTerm) {
        noticiasFiltradas = noticiasFiltradas.filter(noticia =>
            noticia.titulo?.toLowerCase().includes(searchTerm) ||
            noticia.conteudo?.toLowerCase().includes(searchTerm)
        );
    }

    if (statusFilter) {
        noticiasFiltradas = noticiasFiltradas.filter(noticia =>
            noticia.aprovada?.toString() === statusFilter
        );
    }

    if (tabAtiva === 'aprovadas') {
        noticiasFiltradas = noticiasFiltradas.filter(noticia => noticia.aprovada);
    } else if (tabAtiva === 'pendentes') {
        noticiasFiltradas = noticiasFiltradas.filter(noticia => !noticia.aprovada);
    }

    exibirNoticias(noticiasFiltradas);
}

function exibirNoticias(noticias) {
    const grid = document.getElementById('newsGrid');
    if (!grid) {
        console.error('Element newsGrid not found');
        return;
    }

    grid.innerHTML = '';

    if (noticias.length === 0) {
        grid.innerHTML = `
            <div class="no-news">
                <i class="fas fa-newspaper"></i>
                <p>Nenhuma notícia encontrada</p>
            </div>
        `;
        return;
    }

    noticias.forEach(noticia => {
        const card = criarCardNoticia(noticia);
        grid.appendChild(card);
    });
}

function criarCardNoticia(noticia) {
    const card = document.createElement('div');
    card.className = 'news-card';

    const dataFormatada = new Date(noticia.dataCriacao).toLocaleDateString('pt-BR');
    const usuario = getUsuarioLogado();

    card.innerHTML = `
        <div class="news-header">
            <h3 class="news-title">${noticia.titulo}</h3>
            <div class="news-meta">
                <span class="news-date">
                    <i class="far fa-calendar-alt"></i> ${dataFormatada}
                </span>
                <span class="news-status ${noticia.aprovada ? 'approved' : 'pending'}">
                    ${noticia.aprovada ? 'Aprovada' : 'Pendente'}
                </span>
            </div>
        </div>
        <div class="news-content">
            ${noticia.conteudo}
        </div>
        <div class="news-footer">
            <span class="news-author">
                <i class="far fa-user"></i> ${noticia.autorNome || 'Autor desconhecido'}
            </span>
            <div class="news-actions">
                ${isPastor() && !noticia.aprovada ? `
                    <button onclick="aprovarNoticia(${noticia.id})" class="btn-approve">
                        <i class="fas fa-check"></i> Aprovar
                    </button>
                ` : ''}
                ${(isPastor() || noticia.autorId === usuario?.idUsuario) ? `
                    <button onclick="editarNoticia(${noticia.id})" class="btn-edit">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button onclick="deletarNoticia(${noticia.id})" class="btn-delete">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    return card;
}
// Função para criar notícia
async function criarNoticia(dados) {
    try {
        const usuario = getUsuarioLogado();
        if (!usuario || !usuario.idUsuario) {
            throw new Error('Usuário não encontrado');
        }

        // Criar FormData
        const formData = new FormData();
        formData.append('titulo', dados.titulo);
        formData.append('conteudo', dados.conteudo);
        formData.append('usuarioId', usuario.idUsuario.toString());

        if (dados.imagem) {
            formData.append('imagem', dados.imagem);
        }

        const response = await fetch(`${CONFIG.API_URL}/noticias`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
                // Não incluir Content-Type, deixe o navegador definir automaticamente
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Erro do servidor:', errorData);
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const result = await response.json();
        mostrarMensagem('Notícia criada com sucesso!', 'success');
        await carregarNoticias();
        return result;

    } catch (error) {
        console.error('Erro ao criar notícia:', error);
        mostrarMensagem('Erro ao criar notícia', 'error');
        throw error;
    }
}

// Função para abrir o modal de nova notícia
async function abrirModalNovaNoticia() {
    try {
        const usuario = getUsuarioLogado();
        if (!usuario) {
            mostrarMensagem('Usuário não encontrado', 'error');
            return;
        }

        const { value: formValues } = await Swal.fire({
            title: 'Nova Notícia',
            html: `
                <div class="modal-content">
                    <input id="titulo" class="swal2-input" placeholder="Título da notícia">
                    <input type="file" id="imagem" accept="image/*" class="swal2-file">
                    <div class="editor-container">
                        <textarea id="conteudo"></textarea>
                    </div>
                </div>
            `,
            didOpen: async () => {
                await initTinyMCE('#conteudo');
            },
            preConfirm: async () => {
                const titulo = document.getElementById('titulo').value;
                const editor = tinymce.get('conteudo');

                if (!editor) {
                    Swal.showValidationMessage('Editor não inicializado corretamente');
                    return false;
                }

                const conteudo = editor.getContent();
                const imagemInput = document.getElementById('imagem');
                const imagem = imagemInput.files[0];

                const validacao = validarNoticia(titulo, conteudo);
                if (!validacao.valido) {
                    Swal.showValidationMessage(validacao.mensagem);
                    return false;
                }

                return {
                    titulo: validacao.titulo,
                    conteudo: validacao.conteudo,
                    imagem
                };
            },
            willClose: () => {
                tinymce.remove('#conteudo');
            },
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            width: '80%',
            customClass: {
                container: 'swal-wide',
                popup: 'swal-tall'
            }
        });

        if (formValues) {
            await criarNoticia(formValues);
        }
    } catch (error) {
        console.error('Erro ao abrir modal:', error);
        mostrarMensagem('Erro ao abrir modal de nova notícia', 'error');
    }
}

async function editarNoticia(id) {
    try {
        const response = await fazerRequisicao(`${CONFIG.API_URL}/noticias/${id}`);
        const noticia = response;

        const { value: formValues } = await Swal.fire({
            title: 'Editar Notícia',
            html: `
                <div class="modal-content">
                    <input id="titulo" class="swal2-input" value="${noticia.titulo}">
                    <div id="tituloError" class="error-message"></div>
                    <div class="editor-container">
                        <textarea id="conteudo">${noticia.conteudo}</textarea>
                    </div>
                </div>
            `,
            didOpen: async () => {
                await initTinyMCE('#conteudo');
            },
            preConfirm: () => {
                const titulo = document.getElementById('titulo').value;
                const conteudo = tinymce.get('conteudo').getContent();

                const validacao = validarNoticia(titulo, conteudo);
                if (!validacao.valido) {
                    Swal.showValidationMessage(validacao.mensagem);
                    return false;
                }

                return {
                    titulo: validacao.titulo,
                    conteudo: validacao.conteudo
                };
            },
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            width: '80%',
            customClass: {
                container: 'swal-wide',
                popup: 'swal-tall'
            }
        });

        if (formValues) {
            await atualizarNoticia(id, formValues);
        }
    } catch (error) {
        console.error('Erro ao carregar notícia para edição:', error);
        mostrarMensagem('Erro ao carregar notícia', 'error');
    }
}

async function atualizarNoticia(id, dados) {
    try {
        await fazerRequisicao(`${CONFIG.API_URL}/noticias/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        });

        mostrarMensagem('Notícia atualizada com sucesso!', 'success');
        await carregarNoticias();
    } catch (error) {
        console.error('Erro ao atualizar notícia:', error);
        mostrarMensagem('Erro ao atualizar notícia', 'error');
    }
}

async function aprovarNoticia(id) {
    try {
        await fazerRequisicao(`${CONFIG.API_URL}/noticias/${id}/aprovar`, {
            method: 'PUT'
        });

        mostrarMensagem('Notícia aprovada com sucesso!', 'success');
        await carregarNoticias();
    } catch (error) {
        console.error('Erro ao aprovar notícia:', error);
        mostrarMensagem('Erro ao aprovar notícia', 'error');
    }
}

async function deletarNoticia(id) {
    const result = await Swal.fire({
        title: 'Confirmar exclusão',
        text: 'Tem certeza que deseja excluir esta notícia?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        background: 'var(--background)',
        color: 'var(--text)'
    });

    if (result.isConfirmed) {
        try {
            await fazerRequisicao(`${CONFIG.API_URL}/noticias/${id}`, {
                method: 'DELETE'
            });

            mostrarMensagem('Notícia excluída com sucesso!', 'success');
            await carregarNoticias();
        } catch (error) {
            console.error('Erro ao deletar notícia:', error);
            mostrarMensagem('Erro ao deletar notícia', 'error');
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!await verificarAutenticacao()) {
            window.location.replace('./login.html');
            return;
        }

        await carregarNoticias();

        // Configurar listeners para filtros
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => filtrarEExibirNoticias(noticias));
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => filtrarEExibirNoticias(noticias));
        }

        // Configurar listeners para tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                filtrarEExibirNoticias(noticias);
            });
        });
    } catch (error) {
        console.error('Erro na inicialização:', error);
        mostrarMensagem('Erro ao inicializar a página', 'error');
    }
});