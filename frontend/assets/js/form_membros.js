// form_membros.js (Modificado - Adicionando Máscara de Data e Correção do Formato da Data)

let TOKEN_JWT_PADRAO = null; // Inicializa como null fora da função

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

// Nova função para carregar o token do backend
async function carregarTokenPadrao() {
    try {
        const apiUrlDefaultToken = `${CONFIG.API_URL}/public/default-token`;
        const response = await fetch(apiUrlDefaultToken);

        if (!response.ok) {
            throw new Error(`Erro ao buscar token padrão do backend: status ${response.status}`);
        }

        const data = await response.json();
        TOKEN_JWT_PADRAO = data.token;
        return TOKEN_JWT_PADRAO;
    } catch (error) {
        console.error("Erro ao carregar token padrão:", error);
        mostrarMensagem('Erro ao carregar token de autenticação.', 'error');
        return null; // Retorna null em caso de erro
    }
}


async function fazerRequisicao(url, options = {}) {
    try {
        const token = TOKEN_JWT_PADRAO;
        if (!token) {
            console.error("Token JWT padrão não está disponível!");
            mostrarMensagem('Token de autenticação não encontrado.', 'error');
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
                mostrarMensagem('Token inválido ou expirado.', 'error'); // Mensagem genérica para o público
                return null;
            }
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error('Erro na requisição:', error);
        mostrarMensagem('Erro ao comunicar com o servidor.', 'error');
        throw error;
    }
}

// Função para criar novo membro (FORMULÁRIO PÚBLICO)
async function criarMembro(dados) {
    try {
        // Assume que CONFIG.API_URL está globalmente disponível (definido em config.js)
        const response = await fazerRequisicao(`${CONFIG.API_URL}/membros`, {
            method: 'POST',
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            mostrarMensagem('Membro cadastrado/atualizado com sucesso!', 'success');
            document.getElementById('formNovoMembroPublico').reset(); // Limpa o formulário
        } else {
            mostrarMensagem('Erro ao cadastrar membro. Verifique os dados.', 'error');
        }
    } catch (error) {
        console.error('Erro ao cadastrar membro:', error);
        mostrarMensagem('Erro ao cadastrar membro. Tente novamente.', 'error');
    }
}

// Funções de validação (reutilizando as existentes)
function validarTelefone(telefone) {
    const numeroLimpo = telefone.replace(/\D/g, '');
    if (numeroLimpo.length !== 10 && numeroLimpo.length !== 11) {
        return { valido: false, mensagem: 'O telefone deve ter 10 ou 11 dígitos (com DDD).' };
    }
    const ddd = parseInt(numeroLimpo.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
        return { valido: false, mensagem: 'DDD inválido.' };
    }
    if (numeroLimpo.length === 11 && numeroLimpo[2] !== '9') {
        return { valido: false, mensagem: 'Celular deve começar com 9.' };
    }
    return { valido: true, numeroFormatado: formatarTelefone(numeroLimpo) };
}

function validarEndereco(endereco) {
    const enderecoTrim = endereco.trim();
    if (enderecoTrim.length < 10) {
        return { valido: false, mensagem: 'O endereço deve ter no mínimo 10 caracteres.' };
    }
    if (!/\d/.test(enderecoTrim)) {
        return { valido: false, mensagem: 'O endereço deve conter pelo menos um número.' };
    }
    if (/[<>{}[\]&]/.test(enderecoTrim)) {
        return { valido: false, mensagem: 'O endereço contém caracteres inválidos.' };
    }
    return { valido: true, enderecoFormatado: enderecoTrim };
}

// Função para formatar telefone (reutilizando a existente)
function formatarTelefone(telefone) {
    if (!telefone) return '';
    const numero = telefone.replace(/\D/g, '');
    if (numero.length === 11) return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
    if (numero.length === 10) return `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
    if (numero.length === 9) return `${numero.slice(0, 5)}-${numero.slice(5)}`;
    if (numero.length === 8) return `${numero.slice(0, 4)}-${numero.slice(4)}`;
    return telefone;
}


// Inicialização e configuração do formulário
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded iniciado. CONFIG.API_URL antes de carregarTokenPadrao():", CONFIG.API_URL);

    // Carrega o token do backend ao iniciar
    TOKEN_JWT_PADRAO = await carregarTokenPadrao();


    if (!TOKEN_JWT_PADRAO) {
        console.error("Token JWT padrão não carregado do backend, formulário não funcional.");
        mostrarMensagem('Formulário não está funcional devido a um erro de autenticação.', 'error');
        return;
    }


    const formNovoMembroPublico = document.getElementById('formNovoMembroPublico');
    if (formNovoMembroPublico) {
        formNovoMembroPublico.addEventListener('submit', async function(event) {
            event.preventDefault();

            const nome = document.getElementById('nomeMembro').value;
            const telefone = document.getElementById('telefoneMembro').value;
            const endereco = document.getElementById('enderecoMembro').value;
            const dataNascimentoInput = document.getElementById('dataNascimentoMembro').value; // Pega o valor do input como string

            // Validações dos campos (usando as funções de validação)
            if (!nome || !telefone || !endereco || !dataNascimentoInput) { // Usa dataNascimentoInput aqui
                mostrarMensagem('Por favor, preencha todos os campos do formulário.', 'error');
                return;
            }

            const telefoneValidacao = validarTelefone(telefone);
            if (!telefoneValidacao.valido) {
                mostrarMensagem(telefoneValidacao.mensagem, 'error');
                return;
            }

            const enderecoValidacao = validarEndereco(endereco);
            if (!enderecoValidacao.valido) {
                mostrarMensagem(enderecoValidacao.mensagem, 'error');
                return;
            }

            // Converte DD/MM/YYYY para YYYY-MM-DD para o backend
            const partesData = dataNascimentoInput.split('/');
            if (partesData.length !== 3) {
                mostrarMensagem('Formato de data inválido. Use DD/MM/AAAA.', 'error');
                return;
            }
            const dia = partesData[0];
            const mes = partesData[1];
            const ano = partesData[2];
            const dataNascimentoFormatada = `${ano}-${mes}-${dia}`; // Formato YYYY-MM-DD
            const dataNascimento = dataNascimentoFormatada; // Usa a data formatada

            const hoje = new Date();
            const dataNasc = new Date(dataNascimento);
            if (isNaN(dataNasc.getTime())) { // Verifica se dataNascimento é uma data válida após a conversão
                mostrarMensagem('Data de nascimento inválida.', 'error');
                return;
            }
            if (dataNasc > hoje) {
                mostrarMensagem('Data de nascimento não pode ser futura.', 'error');
                return;
            }


            const dadosNovoMembro = {
                nome: nome.trim(),
                telefone: telefoneValidacao.numeroFormatado,
                endereco: enderecoValidacao.enderecoFormatado,
                dataNascimento: dataNascimento // Usa a data formatada YYYY-MM-DD aqui
            };

            await criarMembro(dadosNovoMembro); // Chama a função para criar membro
        });
    } else {
        mostrarMensagem('Erro ao inicializar formulário.', 'error');
    }

    // Aplica a máscara de data ao campo dataNascimentoMembro
    const dataNascimentoInputElem = document.getElementById('dataNascimentoMembro');
    VMasker(dataNascimentoInputElem).maskPattern('99/99/9999');
});