// Funções de utilidade
function getUsuarioLogado() {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            console.warn('Nenhum usuário encontrado no localStorage');
            return null;
        }

        const user = JSON.parse(userStr);
        console.log('Usuário recuperado:', user);

        // Verifica se tem idUsuario
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

// Função para mostrar mensagens
function mostrarMensagem(mensagem, tipo) {
    Swal.fire({
        text: mensagem,
        icon: tipo,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });
}

// Função para fazer requisições autenticadas
async function fazerRequisicao(url, options = {}) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }

        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        // Mesclar headers se existirem nas options
        const mergedOptions = {
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };

        const response = await fetch(url, mergedOptions);

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.replace('./login.html');
            return null;
        }

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Função para preencher o formulário
function preencherFormulario(config) {
    if (!config) return;

    const campos = [
        'nomeSite', 'descricao', 'facebookUrl', 'instagramUrl', 'youtubeUrl',
        'whatsapp', 'email', 'telefone', 'endereco', 'horarioFuncionamento',
        'horarioCultos', 'sobreIgreja', 'mensagemWhatsapp'
    ];

    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) {
            elemento.value = config[campo] || '';
        }
    });
}

// Função para validar campos
function validarCampos() {
    const camposObrigatorios = ['nomeSite', 'descricao'];
    let valido = true;

    camposObrigatorios.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (!elemento.value.trim()) {
            elemento.style.borderColor = 'var(--error)';
            valido = false;
        } else {
            elemento.style.borderColor = 'var(--border)';
        }
    });

    return valido;
}

// Função para máscara de telefone
function mascaraTelefone(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);

    if (valor.length > 10) {
        valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (valor.length > 6) {
        valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    }

    input.value = valor;
}

// Variáveis globais
let configuracaoAtual = null;

// Quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Página carregada, verificando autenticação...');

    const token = localStorage.getItem('token');
    const user = getUsuarioLogado();

    if (!token || !user) {
        console.log('Usuário não autenticado');
        window.location.replace('./login.html');
        return;
    }

    if (!isPastor()) {
        console.log('Usuário não é pastor');
        mostrarMensagem('Acesso não autorizado', 'error');
        window.location.replace('./index.html');
        return;
    }

    console.log('Iniciando carregamento das configurações...');
    await carregarConfiguracoes();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Botão salvar
    document.getElementById('salvarBtn').addEventListener('click', salvarConfiguracoes);

    // Máscara para WhatsApp e telefone
    const whatsappInput = document.getElementById('whatsapp');
    const telefoneInput = document.getElementById('telefone');

    whatsappInput.addEventListener('input', (e) => mascaraTelefone(e.target));
    telefoneInput.addEventListener('input', (e) => mascaraTelefone(e.target));
}

async function carregarConfiguracoes() {
    try {
        const response = await fazerRequisicao(`${CONFIG.API_URL}/configuracoes`);
        const config = await response.json();
        configuracaoAtual = config;

        // Preencher os campos
        document.getElementById('nomeSite').value = config.nomeSite || '';
        document.getElementById('descricao').value = config.descricao || '';
        document.getElementById('facebookUrl').value = config.facebookUrl || '';
        document.getElementById('instagramUrl').value = config.instagramUrl || '';
        document.getElementById('youtubeUrl').value = config.youtubeUrl || '';
        document.getElementById('whatsapp').value = config.whatsapp || '';
        document.getElementById('email').value = config.email || '';
        document.getElementById('telefone').value = config.telefone || '';
        document.getElementById('endereco').value = config.endereco || '';
        document.getElementById('horarioFuncionamento').value = config.horarioFuncionamento || '';
        document.getElementById('horarioCultos').value = config.horarioCultos || '';
        document.getElementById('sobreIgreja').value = config.sobreIgreja || '';
        document.getElementById('mensagemWhatsapp').value = config.mensagemWhatsapp || '';

    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        mostrarMensagem('Erro ao carregar configurações', 'error');
    }
}

async function salvarConfiguracoes() {
    try {
        console.log('Iniciando salvamento das configurações...');

        if (!isPastor()) {
            console.error('Usuário não tem permissão de PASTOR');
            mostrarMensagem('Você não tem permissão para salvar configurações', 'error');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token não encontrado');
            mostrarMensagem('Sessão expirada, faça login novamente', 'error');
            window.location.replace('./login.html');
            return;
        }

        if (!validarCampos()) {
            console.log('Validação falhou');
            mostrarMensagem('Preencha todos os campos obrigatórios', 'warning');
            return;
        }

        const dados = {
            id: configuracaoAtual?.id,
            nomeSite: document.getElementById('nomeSite').value.trim(),
            descricao: document.getElementById('descricao').value.trim(),
            facebookUrl: document.getElementById('facebookUrl').value.trim(),
            instagramUrl: document.getElementById('instagramUrl').value.trim(),
            youtubeUrl: document.getElementById('youtubeUrl').value.trim(),
            whatsapp: document.getElementById('whatsapp').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            endereco: document.getElementById('endereco').value.trim(),
            horarioFuncionamento: document.getElementById('horarioFuncionamento').value.trim(),
            horarioCultos: document.getElementById('horarioCultos').value.trim(),
            sobreIgreja: document.getElementById('sobreIgreja').value.trim(),
            mensagemWhatsapp: document.getElementById('mensagemWhatsapp').value.trim(),
            logoUrl: configuracaoAtual?.logoUrl,
            faviconUrl: configuracaoAtual?.faviconUrl
        };

        console.log('Dados preparados:', dados);

        const response = await fazerRequisicao(`${CONFIG.API_URL}/configuracoes`, {
            method: 'POST',
            body: JSON.stringify(dados)
        });

        const configuracaoAtualizada = await response.json();
        console.log('Configuração atualizada com sucesso:', configuracaoAtualizada);

        configuracaoAtual = configuracaoAtualizada;
        mostrarMensagem('Configurações salvas com sucesso!', 'success');
        await carregarConfiguracoes();

    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        mostrarMensagem('Erro ao salvar configurações: ' + error.message, 'error');
    }
}

// Configurar botão de logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await AuthService.logout();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            mostrarMensagem('Erro ao fazer logout', 'error');
        }
    });
}
