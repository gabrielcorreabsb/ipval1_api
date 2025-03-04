// Variáveis globais
let usuarios = [];

// Funções utilitárias
function mostrarMensagem(texto, tipo) {
    Swal.fire({
        text: texto,
        icon: tipo,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: tipo === 'error' ? 5000 : 3000, // Mais tempo para mensagens de erro
        timerProgressBar: true
    });
}

function validarSenha(senha) {
    const regexSenha = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#$%^&+=!])(.{6,})$/;
    return regexSenha.test(senha);
}

function isPastor() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.cargo === 'PASTOR';
}

// Funções de filtro
function configurarFiltros() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filtrarUsuarios);
    }

    const cargoFilter = document.getElementById('cargoFilter');
    if (cargoFilter) {
        cargoFilter.addEventListener('change', filtrarUsuarios);
    }
}

function filtrarUsuarios() {
    const searchInput = document.getElementById('searchInput');
    const cargoFilter = document.getElementById('cargoFilter');

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const cargoSelecionado = cargoFilter ? cargoFilter.value : '';

    const usuariosFiltrados = usuarios.filter(usuario => {
        const matchNome = usuario.nome.toLowerCase().includes(searchTerm);
        const matchCargo = !cargoSelecionado || usuario.cargo === cargoSelecionado;
        return matchNome && matchCargo;
    });

    exibirUsuarios(usuariosFiltrados);
}

// Funções de exibição
function exibirUsuarios(usuariosParaExibir) {
    const grid = document.getElementById('usersGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const isPastorUser = isPastor();

    usuariosParaExibir.forEach(usuario => {
        const card = document.createElement('div');
        card.className = 'user-card';

        const cargoFormatado = formatarCargo(usuario.cargo);

        card.innerHTML = `
    <div class="user-header">
        <div class="user-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="user-info">
            <h3 class="user-name">${usuario.nome}</h3>
            <span class="user-cargo">${cargoFormatado}</span>
        </div>
    </div>
    <div class="user-details">
        <p><i class="fas fa-user-tag"></i> ${usuario.login}</p>
    </div>
    ${isPastorUser ? `
        <div class="user-actions">
            <button onclick="editarUsuario('${usuario.idUsuario}')" class="action-btn edit">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button onclick="deletarUsuario('${usuario.idUsuario}')" class="action-btn delete">
                <i class="fas fa-trash"></i> Excluir
            </button>
        </div>
    ` : ''}
`;

        grid.appendChild(card);
    });
}

function formatarCargo(cargo) {
    const formatacao = {
        'PASTOR': 'Pastor',
        'BOASVINDAS': 'Boas-vindas',
        'SAF': 'SAF',
        'UPH': 'UPH',
        'OUTROS': 'Outros'
    };
    return formatacao[cargo] || cargo;
}

// Funções de API
async function fazerRequisicao(url, options = {}) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.clear();
            window.location.replace('./login.html');
            return null;
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

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

        return response;
    } catch (error) {
        console.error('Erro na requisição:', error);
        if (error.message.includes('401') || error.message.includes('403')) {
            localStorage.clear();
            window.location.replace('./login.html');
            return null;
        }
        throw error;
    }
}

async function verificarAutenticacao() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }

        // Tenta fazer uma requisição para verificar se o token é válido
        const response = await fetch(`${CONFIG.API_URL}/usuarios/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Token inválido');
        }

        return true;
    } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        localStorage.clear();
        window.location.replace('./login.html');
        return false;
    }
}

// Funções de CRUD
async function carregarUsuarios() {
    try {
        const response = await fazerRequisicao(`${CONFIG.API_URL}/usuarios`);
        if (response) {
            usuarios = await response.json();
            console.log('Estrutura dos usuários:', usuarios); // Adicione este log
            exibirUsuarios(usuarios);
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        mostrarMensagem('Erro ao carregar usuários', 'error');
    }
}

async function criarUsuario(dados) {
    try {
        // Verifica se todos os campos necessários estão presentes
        if (!dados.nome || !dados.login || !dados.senha || !dados.cargo) {
            throw new Error('Todos os campos são obrigatórios');
        }

        // Envia os dados diretamente para a API
        const response = await fazerRequisicao(`${CONFIG.API_URL}/usuarios`, {
            method: 'POST',
            body: JSON.stringify({
                nome: dados.nome,
                login: dados.login,
                senha: dados.senha,
                cargo: dados.cargo
            })
        });

        if (response) {
            mostrarMensagem('Usuário criado com sucesso!', 'success');
            await carregarUsuarios();
        }
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        mostrarMensagem('Erro ao criar usuário. Verifique os dados.', 'error');
    }
}

async function atualizarUsuario(idUsuario, dados) {
    try {
        if (!idUsuario) {
            throw new Error('ID do usuário não fornecido');
        }

        const response = await fazerRequisicao(`${CONFIG.API_URL}/usuarios/${idUsuario}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        });

        if (response) {
            mostrarMensagem('Usuário atualizado com sucesso!', 'success');

            // Verifica se o usuário atualizou seu próprio perfil
            const usuarioAtual = JSON.parse(localStorage.getItem('user'));
            if (usuarioAtual && usuarioAtual.idUsuario === Number(idUsuario)) {
                // Solicita que o usuário faça login novamente
                await Swal.fire({
                    title: 'Atualização realizada',
                    text: 'Por favor, faça login novamente para aplicar as alterações.',
                    icon: 'info',
                    confirmButtonText: 'OK'
                });

                // Limpa o localStorage e redireciona para a página de login
                localStorage.clear();
                window.location.replace('./login.html');
                return;
            }

            // Se não for o próprio usuário, apenas recarrega a lista
            await carregarUsuarios();
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        mostrarMensagem('Erro ao atualizar usuário', 'error');
        throw error;
    }
}

async function deletarUsuario(idUsuario) {
    try {
        if (!idUsuario) {
            throw new Error('ID do usuário não fornecido');
        }

        const result = await Swal.fire({
            title: 'Confirmar exclusão',
            text: 'Tem certeza que deseja excluir este usuário?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const response = await fazerRequisicao(`${CONFIG.API_URL}/usuarios/${idUsuario}`, {
                method: 'DELETE'
            });

            if (response) {
                mostrarMensagem('Usuário excluído com sucesso!', 'success');
                await carregarUsuarios();
            }
        }
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        mostrarMensagem('Erro ao deletar usuário', 'error');
    }
}

// Funções de Modal
async function editarUsuario(idUsuario) {
    try {
        console.log('ID recebido:', idUsuario);

        if (!idUsuario) {
            mostrarMensagem('ID do usuário não encontrado', 'error');
            return;
        }

        const usuario = usuarios.find(u => String(u.idUsuario) === String(idUsuario));
        console.log('Usuário encontrado:', usuario);

        if (!usuario) {
            mostrarMensagem('Usuário não encontrado', 'error');
            return;
        }

        const { value: formValues } = await Swal.fire({
            title: 'Editar Usuário',
            html: `
                <input id="swal-nome" class="swal2-input" placeholder="Nome" value="${usuario.nome || ''}">
                <input id="swal-login" class="swal2-input" placeholder="Login" value="${usuario.login || ''}">
                <input id="swal-senha" class="swal2-input" type="password" placeholder="Senha (obrigatória)">
                <select id="swal-cargo" class="swal2-select">
                    <option value="PASTOR" ${usuario.cargo === 'PASTOR' ? 'selected' : ''}>Pastor</option>
                    <option value="BOASVINDAS" ${usuario.cargo === 'BOASVINDAS' ? 'selected' : ''}>Boas-vindas</option>
                    <option value="SAF" ${usuario.cargo === 'SAF' ? 'selected' : ''}>SAF</option>
                    <option value="UPH" ${usuario.cargo === 'UPH' ? 'selected' : ''}>UPH</option>
                    <option value="OUTROS" ${usuario.cargo === 'OUTROS' ? 'selected' : ''}>Outros</option>
                </select>
                <div class="swal2-text" style="margin-top: 10px; color: #666;">
                    A senha deve conter:<br>
                    - Mínimo de 6 caracteres<br>
                    - Pelo menos uma letra<br>
                    - Pelo menos um número<br>
                    - Pelo menos um caractere especial (@#$%^&+=!)
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const nome = document.getElementById('swal-nome').value;
                const login = document.getElementById('swal-login').value;
                const senha = document.getElementById('swal-senha').value;
                const cargo = document.getElementById('swal-cargo').value;

                if (!nome || !login || !senha || !cargo) {
                    Swal.showValidationMessage('Por favor, preencha todos os campos');
                    return false;
                }

                if (!validarSenha(senha)) {
                    Swal.showValidationMessage('A senha não atende aos requisitos mínimos');
                    return false;
                }

                return {
                    idUsuario: Number(idUsuario),
                    nome,
                    login,
                    senha,
                    cargo,
                    dataCriacao: usuario.dataCriacao
                };
            }
        });

        if (formValues) {
            await atualizarUsuario(idUsuario, formValues);
        }
    } catch (error) {
        console.error('Erro ao editar usuário:', error);
        mostrarMensagem('Erro ao editar usuário', 'error');
    }
}

async function abrirModalNovoUsuario() {
    try {
        const { value: formValues } = await Swal.fire({
            title: 'Novo Usuário',
            html: `
                <input id="swal-nome" class="swal2-input" placeholder="Nome">
                <input id="swal-login" class="swal2-input" placeholder="Login">
                <input id="swal-senha" class="swal2-input" type="password" placeholder="Senha">
                <select id="swal-cargo" class="swal2-select">
                    <option value="">Selecione um cargo</option>
                    <option value="PASTOR">Pastor</option>
                    <option value="BOASVINDAS">Boas-vindas</option>
                    <option value="SAF">SAF</option>
                    <option value="UPH">UPH</option>
                    <option value="OUTROS">Outros</option>
                </select>
                <div class="swal2-text" style="margin-top: 10px; color: #666;">
                    A senha deve conter:<br>
                    - Mínimo de 6 caracteres<br>
                    - Pelo menos uma letra<br>
                    - Pelo menos um número<br>
                    - Pelo menos um caractere especial (@#$%^&+=!)
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const nome = document.getElementById('swal-nome').value;
                const login = document.getElementById('swal-login').value;
                const senha = document.getElementById('swal-senha').value;
                const cargo = document.getElementById('swal-cargo').value;

                if (!nome || !login || !senha || !cargo) {
                    Swal.showValidationMessage('Por favor, preencha todos os campos');
                    return false;
                }

                if (!validarSenha(senha)) {
                    Swal.showValidationMessage('A senha não atende aos requisitos mínimos');
                    return false;
                }

                return { nome, login, senha, cargo };
            }
        });

        if (formValues) {
            await criarUsuario(formValues);
        }
    } catch (error) {
        console.error('Erro ao abrir modal:', error);
        mostrarMensagem('Erro ao criar usuário', 'error');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('./login.html');
        return;
    }

    // Configurar visibilidade do botão novo usuário
    const btnNovoUsuario = document.querySelector('.btn-primary');
    if (btnNovoUsuario) {
        btnNovoUsuario.style.display = isPastor() ? 'flex' : 'none';
    }

    carregarUsuarios();
    configurarFiltros();
});