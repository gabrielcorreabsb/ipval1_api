// membros.js

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

async function editarMembro(id) {
    if (!podeGerenciarMembros()) {
        mostrarMensagem('Você não tem permissão para editar membros', 'error');
        return;
    }

    try {
        const response = await fazerRequisicao(`${CONFIG.API_URL}/membros/${id}`);
        if (!response) return;

        const membro = await response.json();

        const { value: formValues } = await Swal.fire({
            title: 'Editar Membro',
            html: `
                <input id="nome" class="swal2-input" value="${membro.nome}" placeholder="Nome completo">
                <input id="telefone" class="swal2-input" value="${membro.telefone}" placeholder="Telefone">
                <input id="endereco" class="swal2-input" value="${membro.endereco}" placeholder="Endereço completo">
                <input id="dataNascimento" type="date" class="swal2-input" value="${membro.dataNascimento.split('T')[0]}">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const nome = document.getElementById('nome').value;
                const telefone = document.getElementById('telefone').value;
                const endereco = document.getElementById('endereco').value;
                const dataNascimento = document.getElementById('dataNascimento').value;

                if (!nome || !telefone || !endereco || !dataNascimento) {
                    Swal.showValidationMessage('Por favor, preencha todos os campos');
                    return false;
                }

                return {
                    nome,
                    telefone,
                    endereco,
                    dataNascimento
                };
            }
        });

        if (formValues) {
            await atualizarMembro(id, formValues);
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar dados do membro', 'error');
    }
}

// Funções de utilidade e configuração inicial
function getUsuarioLogado() {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            console.warn('Nenhum usuário encontrado no localStorage');
            return null;
        }

        const user = JSON.parse(userStr);
        console.log('Usuário recuperado:', user);

        if (!user.idUsuario) {
            console.warn('Usuário sem idUsuario:', user);
        }

        return user;
    } catch (error) {
        console.error('Erro ao recuperar usuário:', error);
        return null;
    }
}

function isPastor() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        return user && user.cargo === 'PASTOR';
    } catch (error) {
        console.error('Erro ao verificar cargo:', error);
        return false;
    }
}

function isBoasVindas() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        return user && user.cargo === 'BOASVINDAS';
    } catch (error) {
        console.error('Erro ao verificar cargo:', error);
        return false;
    }
}

function podeGerenciarMembros() {
    return isPastor() || isBoasVindas();
}

async function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('./login.html');
        return false;
    }
    return true;
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    if (!await verificarAutenticacao()) return;

    await carregarMembros();
    configurarPesquisa();
    verificarPermissoes();
});

// Funções de API
async function carregarMembros() {
    try {
        const response = await fazerRequisicao(`${CONFIG.API_URL}/membros`);
        if (response) {
            const membros = await response.json();
            exibirMembros(membros);
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar membros', 'error');
    }
}

// Função para formatar telefone
function formatarTelefone(telefone) {
    if (!telefone) return '';

    // Remove todos os caracteres não numéricos
    const numero = telefone.replace(/\D/g, '');

    // Formata o número dependendo do tamanho
    if (numero.length === 11) {
        // Celular com DDD
        return `(${numero.slice(0,2)}) ${numero.slice(2,7)}-${numero.slice(7)}`;
    } else if (numero.length === 10) {
        // Telefone fixo com DDD
        return `(${numero.slice(0,2)}) ${numero.slice(2,6)}-${numero.slice(6)}`;
    } else if (numero.length === 9) {
        // Celular sem DDD
        return `${numero.slice(0,5)}-${numero.slice(5)}`;
    } else if (numero.length === 8) {
        // Telefone fixo sem DDD
        return `${numero.slice(0,4)}-${numero.slice(4)}`;
    }

    // Se não se encaixar em nenhum formato, retorna o número original
    return telefone;
}

async function abrirModalNovoMembro() {
    const { value: formValues } = await Swal.fire({
        title: 'Novo Membro',
        html: `
            <input id="nome" class="swal2-input" placeholder="Nome completo">
            <input id="telefone" class="swal2-input" placeholder="Telefone">
            <input id="endereco" class="swal2-input" placeholder="Endereço">
            <input id="dataNascimento" type="date" class="swal2-input">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                nome: document.getElementById('nome').value,
                telefone: document.getElementById('telefone').value,
                endereco: document.getElementById('endereco').value,
                dataNascimento: document.getElementById('dataNascimento').value
            }
        }
    });

    if (formValues) {
        // Validar campos obrigatórios
        if (!formValues.nome || !formValues.telefone || !formValues.endereco || !formValues.dataNascimento) {
            mostrarMensagem('Todos os campos são obrigatórios', 'error');
            return;
        }

        await criarMembro(formValues);
    }
}

// Função para abrir o modal de novo membro
async function abrirModalNovoMembro() {
    const { value: formValues } = await Swal.fire({
        title: 'Novo Membro',
        html: `
            <input id="nome" class="swal2-input" placeholder="Nome completo">
            <input id="telefone" class="swal2-input" placeholder="Telefone">
            <input id="endereco" class="swal2-input" placeholder="Endereço">
            <input id="dataNascimento" type="date" class="swal2-input">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                nome: document.getElementById('nome').value,
                telefone: document.getElementById('telefone').value,
                endereco: document.getElementById('endereco').value,
                dataNascimento: document.getElementById('dataNascimento').value
            }
        }
    });

    if (formValues) {
        // Validar campos obrigatórios
        if (!formValues.nome || !formValues.telefone || !formValues.endereco || !formValues.dataNascimento) {
            mostrarMensagem('Todos os campos são obrigatórios', 'error');
            return;
        }

        await criarMembro(formValues);
    }
}

// Função para criar novo membro
async function criarMembro(dados) {
    try {
        const response = await fazerRequisicao(`${CONFIG.API_URL}/membros`, {
            method: 'POST',
            body: JSON.stringify(dados)
        });

        if (response) {
            mostrarMensagem('Membro cadastrado com sucesso!', 'success');
            await carregarMembros(); // Recarrega a lista de membros
        }
    } catch (error) {
        mostrarMensagem('Erro ao cadastrar membro', 'error');
    }
}

// Função para editar membro
// Atualizar a função editarMembro para incluir as mesmas validações
async function editarMembro(id) {
    try {
        const response = await fazerRequisicao(`${CONFIG.API_URL}/membros/${id}`);
        if (!response) return;

        const membro = await response.json();
        const dataNascimento = membro.dataNascimento.split('T')[0];

        const { value: formValues } = await Swal.fire({
            title: 'Editar Membro',
            html: `
                <input id="nome" class="swal2-input" value="${membro.nome}" placeholder="Nome completo">
                <input id="telefone" class="swal2-input" value="${membro.telefone}" placeholder="Telefone (com DDD)">
                <input id="endereco" class="swal2-input" value="${membro.endereco}" placeholder="Endereço completo">
                <input id="dataNascimento" type="date" class="swal2-input" value="${dataNascimento}">
                <div id="telefoneError" class="error-message" style="color: red; font-size: 12px;"></div>
                <div id="enderecoError" class="error-message" style="color: red; font-size: 12px;"></div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            didOpen: () => {
                // Adiciona os mesmos listeners de validação
                const telefoneInput = document.getElementById('telefone');
                const enderecoInput = document.getElementById('endereco');
                const telefoneError = document.getElementById('telefoneError');
                const enderecoError = document.getElementById('enderecoError');

                telefoneInput.addEventListener('input', (e) => {
                    const resultado = validarTelefone(e.target.value);
                    if (!resultado.valido) {
                        telefoneError.textContent = resultado.mensagem;
                    } else {
                        telefoneError.textContent = '';
                        e.target.value = resultado.numeroFormatado;
                    }
                });

                enderecoInput.addEventListener('input', (e) => {
                    const resultado = validarEndereco(e.target.value);
                    if (!resultado.valido) {
                        enderecoError.textContent = resultado.mensagem;
                    } else {
                        enderecoError.textContent = '';
                    }
                });
            },
            preConfirm: () => {
                const nome = document.getElementById('nome').value;
                const telefone = document.getElementById('telefone').value;
                const endereco = document.getElementById('endereco').value;
                const dataNascimento = document.getElementById('dataNascimento').value;

                // Mesmas validações do criar
                if (!nome || !telefone || !endereco || !dataNascimento) {
                    Swal.showValidationMessage('Todos os campos são obrigatórios');
                    return false;
                }

                const telefoneValidacao = validarTelefone(telefone);
                if (!telefoneValidacao.valido) {
                    Swal.showValidationMessage(telefoneValidacao.mensagem);
                    return false;
                }

                const enderecoValidacao = validarEndereco(endereco);
                if (!enderecoValidacao.valido) {
                    Swal.showValidationMessage(enderecoValidacao.mensagem);
                    return false;
                }

                // Validar data de nascimento
                const hoje = new Date();
                const dataNasc = new Date(dataNascimento);
                if (dataNasc > hoje) {
                    Swal.showValidationMessage('Data de nascimento não pode ser futura');
                    return false;
                }

                return {
                    nome: nome.trim(),
                    telefone: telefoneValidacao.numeroFormatado,
                    endereco: enderecoValidacao.enderecoFormatado,
                    dataNascimento
                };
            }
        });

        if (formValues) {
            await atualizarMembro(id, formValues);
        }
    } catch (error) {
        mostrarMensagem('Erro ao carregar dados do membro', 'error');
    }
}

async function atualizarMembro(id, dados) {
    if (!podeGerenciarMembros()) {
        mostrarMensagem('Você não tem permissão para atualizar membros', 'error');
        return;
    }

    try {
        const response = await fazerRequisicao(`${CONFIG.API_URL}/membros/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        });

        if (response) {
            mostrarMensagem('Membro atualizado com sucesso!', 'success');
            await carregarMembros();
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao atualizar membro', 'error');
    }
}

async function excluirMembro(id) {
    if (!isPastor()) {
        mostrarMensagem('Você não tem permissão para excluir membros', 'error');
        return;
    }

    const result = await Swal.fire({
        title: 'Confirmar exclusão',
        text: 'Deseja realmente excluir este membro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
        try {
            const response = await fazerRequisicao(`${CONFIG.API_URL}/membros/${id}`, {
                method: 'DELETE'
            });

            if (response) {
                mostrarMensagem('Membro excluído com sucesso!', 'success');
                await carregarMembros();
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarMensagem('Erro ao excluir membro', 'error');
        }
    }
}

// Funções de UI
function exibirMembros(membros) {
    const grid = document.getElementById('membersGrid');
    grid.innerHTML = '';

    membros.forEach(membro => {
        const card = criarCardMembro(membro);
        grid.appendChild(card);
    });
}

function criarCardMembro(membro) {
    console.log('=== Início da criação do card ===');
    console.log('Membro completo:', membro);
    console.log('Data de nascimento original:', membro.dataNascimento);

    const card = document.createElement('div');
    card.className = 'member-card';

    let dataFormatada;
    try {
        // Corrigindo o problema do fuso horário
        const [ano, mes, dia] = membro.dataNascimento.split('-');
        dataFormatada = `${dia}/${mes}/${ano}`;

        console.log('Data formatada final:', dataFormatada);
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        dataFormatada = 'Data inválida';
    }

    // Calcular idade
    const idade = calcularIdade(membro.dataNascimento);
    console.log('Idade calculada:', idade);

    card.innerHTML = `
        <div class="member-info">
            <h3>${membro.nome}</h3>
            <p>
                <i class="fas fa-phone"></i>
                <span>${formatarTelefone(membro.telefone)}</span>
            </p>
            <p>
                <i class="fas fa-map-marker-alt"></i>
                <span>${membro.endereco}</span>
            </p>
            <p>
                <i class="fas fa-birthday-cake"></i>
                <span>${dataFormatada} (${idade} anos)</span>
            </p>
        </div>
        <div class="member-actions">
            ${podeGerenciarMembros() ? `
                <button onclick="editarMembro(${membro.id})" class="btn-edit" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
            ` : ''}
            ${isPastor() ? `
                <button onclick="excluirMembro(${membro.id})" class="btn-delete" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            ` : ''}
        </div>
    `;

    return card;
}

function calcularIdade(dataNascimento) {
    try {
        const [ano, mes, dia] = dataNascimento.split('-');
        const nascimento = new Date(ano, mes - 1, dia); // mes - 1 porque em JS os meses começam do 0
        const hoje = new Date();

        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mesAtual = hoje.getMonth();
        const mesNascimento = nascimento.getMonth();

        // Ajusta a idade se ainda não chegou o mês do aniversário
        if (mesAtual < mesNascimento ||
            (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }

        return idade;
    } catch (error) {
        console.error('Erro ao calcular idade:', error);
        return 0;
    }
}

// Atualizar a função que carrega os membros para incluir log
async function carregarMembros() {
    console.log('Iniciando carregamento dos membros');
    try {
        const response = await fazerRequisicao(`${CONFIG.API_URL}/membros`);
        if (response) {
            const membros = await response.json();
            console.log('Membros carregados:', membros);
            exibirMembros(membros);
        }
    } catch (error) {
        console.error('Erro ao carregar membros:', error);
        mostrarMensagem('Erro ao carregar membros', 'error');
    }
}

// Função para abrir o modal de novo membro com validações
async function abrirModalNovoMembro() {
    const { value: formValues } = await Swal.fire({
        title: 'Novo Membro',
        html: `
            <input id="nome" class="swal2-input" placeholder="Nome completo">
            <input id="telefone" class="swal2-input" placeholder="Telefone (com DDD)">
            <input id="endereco" class="swal2-input" placeholder="Endereço completo">
            <input id="dataNascimento" type="date" class="swal2-input">
            <div id="telefoneError" class="error-message" style="color: red; font-size: 12px;"></div>
            <div id="enderecoError" class="error-message" style="color: red; font-size: 12px;"></div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            // Adiciona listeners para validação em tempo real
            const telefoneInput = document.getElementById('telefone');
            const enderecoInput = document.getElementById('endereco');
            const telefoneError = document.getElementById('telefoneError');
            const enderecoError = document.getElementById('enderecoError');

            telefoneInput.addEventListener('input', (e) => {
                const resultado = validarTelefone(e.target.value);
                if (!resultado.valido) {
                    telefoneError.textContent = resultado.mensagem;
                } else {
                    telefoneError.textContent = '';
                    e.target.value = resultado.numeroFormatado;
                }
            });

            enderecoInput.addEventListener('input', (e) => {
                const resultado = validarEndereco(e.target.value);
                if (!resultado.valido) {
                    enderecoError.textContent = resultado.mensagem;
                } else {
                    enderecoError.textContent = '';
                }
            });
        },
        preConfirm: () => {
            const nome = document.getElementById('nome').value;
            const telefone = document.getElementById('telefone').value;
            const endereco = document.getElementById('endereco').value;
            const dataNascimento = document.getElementById('dataNascimento').value;

            // Validações
            if (!nome || !telefone || !endereco || !dataNascimento) {
                Swal.showValidationMessage('Todos os campos são obrigatórios');
                return false;
            }

            const telefoneValidacao = validarTelefone(telefone);
            if (!telefoneValidacao.valido) {
                Swal.showValidationMessage(telefoneValidacao.mensagem);
                return false;
            }

            const enderecoValidacao = validarEndereco(endereco);
            if (!enderecoValidacao.valido) {
                Swal.showValidationMessage(enderecoValidacao.mensagem);
                return false;
            }

            // Validar data de nascimento
            const hoje = new Date();
            const dataNasc = new Date(dataNascimento);
            if (dataNasc > hoje) {
                Swal.showValidationMessage('Data de nascimento não pode ser futura');
                return false;
            }

            return {
                nome: nome.trim(),
                telefone: telefoneValidacao.numeroFormatado,
                endereco: enderecoValidacao.enderecoFormatado,
                dataNascimento
            };
        }
    });

    if (formValues) {
        await criarMembro(formValues);
    }
}
// Funções de validação
function validarTelefone(telefone) {
    // Remove todos os caracteres não numéricos
    const numeroLimpo = telefone.replace(/\D/g, '');

    // Verifica se o número tem 10 (fixo) ou 11 (celular) dígitos
    if (numeroLimpo.length !== 10 && numeroLimpo.length !== 11) {
        return {
            valido: false,
            mensagem: 'O telefone deve ter 10 (fixo) ou 11 (celular) dígitos, incluindo DDD'
        };
    }

    // Verifica se o DDD é válido (entre 11 e 99)
    const ddd = parseInt(numeroLimpo.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
        return {
            valido: false,
            mensagem: 'DDD inválido'
        };
    }

    // Se for celular (11 dígitos), verifica se começa com 9
    if (numeroLimpo.length === 11 && numeroLimpo[2] !== '9') {
        return {
            valido: false,
            mensagem: 'Número de celular deve começar com 9'
        };
    }

    return {
        valido: true,
        numeroFormatado: formatarTelefone(numeroLimpo)
    };
}

function validarEndereco(endereco) {
    // Remove espaços extras no início e fim
    const enderecoTrim = endereco.trim();

    // Verifica o comprimento mínimo
    if (enderecoTrim.length < 10) {
        return {
            valido: false,
            mensagem: 'O endereço deve ter no mínimo 10 caracteres'
        };
    }

    // Verifica se contém números
    if (!/\d/.test(enderecoTrim)) {
        return {
            valido: false,
            mensagem: 'O endereço deve conter pelo menos um número'
        };
    }

    // Verifica caracteres especiais inválidos
    if (/[<>{}[\]&]/.test(enderecoTrim)) {
        return {
            valido: false,
            mensagem: 'O endereço contém caracteres inválidos'
        };
    }

    return {
        valido: true,
        enderecoFormatado: enderecoTrim
    };
}

function verificarPermissoes() {
    const podeGerenciar = podeGerenciarMembros();
    console.log('Permissões do usuário:', { podeGerenciar, isPastor: isPastor() });

    const btnNovoMembro = document.querySelector('.btn-primary');
    if (btnNovoMembro) {
        btnNovoMembro.style.display = podeGerenciar ? 'flex' : 'none';
    }
}

function configurarPesquisa() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let timeoutId;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const termo = e.target.value.toLowerCase();
                const cards = document.querySelectorAll('.member-card');

                cards.forEach(card => {
                    const texto = card.textContent.toLowerCase();
                    card.style.display = texto.includes(termo) ? '' : 'none';
                });
            }, 300);
        });
    }
}

// Exportar funções necessárias
window.abrirModalNovoMembro = abrirModalNovoMembro;
window.editarMembro = editarMembro;
window.excluirMembro = excluirMembro;