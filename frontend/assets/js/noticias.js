let noticias = []; // Variável global para armazenar as notícias

// Função para converter imagem para WebP
async function convertToWebP(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                // Converter para WebP
                canvas.toBlob((blob) => {
                    if (blob) {
                        // Criar novo arquivo com extensão .webp
                        const webpFile = new File([blob], `${file.name.split('.')[0]}.webp`, {
                            type: 'image/webp',
                            lastModified: new Date().getTime()
                        });
                        resolve(webpFile);
                    } else {
                        reject(new Error('Erro ao converter imagem para WebP'));
                    }
                }, 'image/webp', 0.8); // 0.8 é a qualidade da imagem (80%)
            };
            img.onerror = () => reject(new Error('Erro ao carregar imagem'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(file);
    });
}

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
            noticias = response; // Atualiza a variável global
            filtrarEExibirNoticias();
        }
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
        mostrarMensagem('Erro ao carregar notícias', 'error');
    }
}

function filtrarEExibirNoticias() {
    if (!Array.isArray(noticias)) {
        console.warn('Noticias não é um array:', noticias);
        return;
    }

    const searchTerm = document.getElementById('searchInput')?.value?.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const tabAtiva = document.querySelector('.tab-btn.active')?.dataset?.tab || 'todas';

    console.log('Aplicando filtros:', { searchTerm, statusFilter, tabAtiva });

    let noticiasFiltradas = [...noticias];

    // Filtro por texto
    if (searchTerm) {
        noticiasFiltradas = noticiasFiltradas.filter(noticia =>
            noticia.titulo?.toLowerCase().includes(searchTerm) ||
            noticia.conteudo?.toLowerCase().includes(searchTerm)
        );
    }

    // Filtro por status
    if (statusFilter !== '') {
        noticiasFiltradas = noticiasFiltradas.filter(noticia =>
            noticia.aprovada === (statusFilter === 'true')
        );
    }

    // Filtro por tab
    if (tabAtiva === 'aprovadas') {
        noticiasFiltradas = noticiasFiltradas.filter(noticia => noticia.aprovada);
    } else if (tabAtiva === 'pendentes') {
        noticiasFiltradas = noticiasFiltradas.filter(noticia => !noticia.aprovada);
    }

    console.log('Notícias filtradas:', noticiasFiltradas);
    exibirNoticias(noticiasFiltradas);
}

function criarCardNoticia(noticia) {
    const card = document.createElement('div');
    card.className = `news-card ${noticia.aprovada ? 'approved' : 'pending'}`;

    const dataFormatada = new Date(noticia.dataCriacao).toLocaleDateString('pt-BR');
    const dataModificada = noticia.dataModificacao ?
        new Date(noticia.dataModificacao).toLocaleDateString('pt-BR') : null;
    const usuario = getUsuarioLogado();

    card.innerHTML = `
        <div class="news-image-container">
            ${noticia.imagemUrl ? `
                <img src="${noticia.imagemUrl}" alt="${noticia.titulo}" class="news-thumbnail">
            ` : `
                <div class="news-no-image">
                    <i class="far fa-newspaper"></i>
                </div>
            `}
            <div class="news-status-badge ${noticia.aprovada ? 'approved' : 'pending'}">
                <i class="fas ${noticia.aprovada ? 'fa-check-circle' : 'fa-clock'}"></i>
                ${noticia.aprovada ? 'Aprovada' : 'Pendente'}
            </div>
        </div>
        <div class="news-content-wrapper">
            <div class="news-header">
                <h3 class="news-title">${noticia.titulo}</h3>
                <div class="news-meta">
                    <span class="news-date" title="Data de criação">
                        <i class="far fa-calendar-alt"></i> ${dataFormatada}
                    </span>
                    ${dataModificada ? `
                        <span class="news-modified" title="Última modificação">
                            <i class="fas fa-edit"></i> ${dataModificada}
                        </span>
                    ` : ''}
                    <span class="news-author" title="Autor">
                        <i class="far fa-user"></i> ${noticia.autorNome || 'Autor desconhecido'}
                    </span>
                </div>
            </div>
            <div class="news-content">
                ${noticia.conteudo}
            </div>
            <div class="news-footer">
                <div class="news-actions">
                    ${isPastor() && !noticia.aprovada ? `
                        <button onclick="aprovarNoticia(${noticia.id})" class="btn-approve" title="Aprovar notícia">
                            <i class="fas fa-check"></i>
                            <span>Aprovar</span>
                        </button>
                    ` : ''}
                    ${(isPastor() || noticia.autorId === usuario?.idUsuario) ? `
                        <button onclick="editarNoticia(${noticia.id})" class="btn-edit" title="Editar notícia">
                            <i class="fas fa-edit"></i>
                            <span>Editar</span>
                        </button>
                        <button onclick="deletarNoticia(${noticia.id})" class="btn-delete" title="Excluir notícia">
                            <i class="fas fa-trash"></i>
                            <span>Excluir</span>
                        </button>
                    ` : ''}
                </div>
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

        const formData = new FormData();
        formData.append('titulo', dados.titulo);
        formData.append('conteudo', dados.conteudo);
        formData.append('usuarioId', usuario.idUsuario.toString());

        // Converter imagem para WebP se existir
        if (dados.imagem) {
            try {
                const webpImage = await convertToWebP(dados.imagem);
                formData.append('imagem', webpImage);
            } catch (error) {
                console.error('Erro ao converter imagem:', error);
                mostrarMensagem('Erro ao processar imagem', 'error');
                // Se houver erro na conversão, usa a imagem original
                formData.append('imagem', dados.imagem);
            }
        }

        const response = await fetch(`${CONFIG.API_URL}/noticias`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
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

// Função editarNoticia também precisa ser atualizada
async function editarNoticia(id) {
    try {
        const response = await fazerRequisicao(`${CONFIG.API_URL}/noticias/${id}`);
        const noticia = response;

        const { value: formValues } = await Swal.fire({
            title: 'Editar Notícia',
            html: `
                <div class="modal-content">
                    <input id="titulo" class="swal2-input" value="${noticia.titulo}">
                    <input type="file" id="imagem" accept="image/*" class="swal2-file">
                    ${noticia.imagemUrl ? `
                        <div class="current-image">
                            <img src="${noticia.imagemUrl}" alt="Imagem atual" style="max-width: 200px;">
                            <p>Imagem atual</p>
                        </div>
                    ` : ''}
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
                const editor = tinymce.get('conteudo');
                const imagemInput = document.getElementById('imagem');

                if (!editor) {
                    Swal.showValidationMessage('Editor não inicializado corretamente');
                    return false;
                }

                const conteudo = editor.getContent();
                const validacao = validarNoticia(titulo, conteudo);
                if (!validacao.valido) {
                    Swal.showValidationMessage(validacao.mensagem);
                    return false;
                }

                const dados = {
                    titulo: validacao.titulo,
                    conteudo: validacao.conteudo
                };

                if (imagemInput.files.length > 0) {
                    dados.imagem = imagemInput.files[0];
                }

                return dados;
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
            await atualizarNoticia(id, formValues);
        }
    } catch (error) {
        console.error('Erro ao carregar notícia para edição:', error);
        mostrarMensagem('Erro ao carregar notícia', 'error');
    }
}

async function atualizarNoticia(id, dados) {
    try {
        console.log('Dados recebidos para atualização:', dados); // Log para debug

        // Criar FormData com os dados atualizados
        const formData = new FormData();
        formData.append('titulo', dados.titulo);
        formData.append('conteudo', dados.conteudo);

        if (dados.imagem) {
            formData.append('imagem', dados.imagem);
        }

        // Log para verificar o conteúdo do FormData
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        const response = await fetch(`${CONFIG.API_URL}/noticias/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
                // Não incluir Content-Type para FormData
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Erro do servidor:', errorData);
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const result = await response.json();
        mostrarMensagem('Notícia atualizada com sucesso!', 'success');
        await carregarNoticias();
        return result;

    } catch (error) {
        console.error('Erro ao atualizar notícia:', error);
        mostrarMensagem('Erro ao atualizar notícia', 'error');
        throw error;
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
function exibirNoticias(noticiasFiltradas) {
    const grid = document.getElementById('newsGrid');
    if (!grid) {
        console.error('Element newsGrid not found');
        return;
    }

    grid.innerHTML = '';

    if (!noticiasFiltradas || noticiasFiltradas.length === 0) {
        grid.innerHTML = `
            <div class="no-news">
                <i class="fas fa-newspaper"></i>
                <p>Nenhuma notícia encontrada</p>
            </div>
        `;
        return;
    }

    noticiasFiltradas.forEach(noticia => {
        const card = criarCardNoticia(noticia);
        grid.appendChild(card);
    });
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

        // Carregar notícias iniciais
        await carregarNoticias();

        // Configurar listener para busca
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                console.log('Busca alterada:', searchInput.value);
                filtrarEExibirNoticias();
            });
        }

        // Configurar listener para filtro de status
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                console.log('Status alterado:', statusFilter.value);
                filtrarEExibirNoticias();
            });
        }

        // Configurar listeners para tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                // Remover classe active de todos os botões
                document.querySelectorAll('.tab-btn').forEach(b =>
                    b.classList.remove('active')
                );

                // Adicionar classe active ao botão clicado
                e.target.classList.add('active');

                // Recarregar notícias quando mudar a tab
                await carregarNoticias();
            });
        });

    } catch (error) {
        console.error('Erro na inicialização:', error);
        mostrarMensagem('Erro ao inicializar a página', 'error');
    }
});