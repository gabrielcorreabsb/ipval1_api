// Função principal para gerar a ata
async function gerarAta() {
    try {
        // Primeiro, buscar as configurações da igreja
        let dadosIgreja;
        try {
            const response = await fetch('/api/configuracoes');
            dadosIgreja = await response.json();
            if (!dadosIgreja || !dadosIgreja.nomeSite) {
                throw new Error('Dados da igreja não encontrados');
            }
        } catch (error) {
            console.error('Erro ao buscar dados da igreja:', error);
            dadosIgreja = {
                nomeSite: 'Valparaíso 1',
                endereco: 'Rua Principal, 123'
            };
        }

        // Recuperar dados do formulário
        const dados = {
            numeroAta: document.getElementById('numeroAta').value,
            dataReuniao: new Date(document.getElementById('dataReuniao').value),
            objetivo: document.getElementById('objetivo').value,
            localReuniao: document.getElementById('localReuniao').value,
            endereco: document.getElementById('enderecoLocalReuniao').value,
            presidente: document.getElementById('presidente').value,
            vicePresidente: document.getElementById('vicePresidente').value,
            primeiroSecretario: document.getElementById('primeiroSecretario').value,
            segundoSecretario: document.getElementById('segundoSecretario').value,
            tesoureiro: document.getElementById('tesoureiro').value,
            conselheiro: document.getElementById('conselheiro').value,
            outrosMembros: document.getElementById('outrosMembros').value,
            textoDevocional: document.getElementById('textoDevocional').value,
            responsavelExposicao: document.getElementById('responsavelExposicao').value,
            responsavelOracao: document.getElementById('responsavelOracao').value,
            pautaDiscussao: document.getElementById('pautaDiscussao').value,
            horarioTermino: document.getElementById('horarioTermino').value
        };

        // Validar dados
        validarDados(dados);

        // Formatar data e hora
        const horarioInicio = dados.dataReuniao.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        const dataFormatada = dados.dataReuniao.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Contar número de presentes
        const numeroPresentes = dados.outrosMembros.split('\n').length + 6;

        // Criar o conteúdo da ata
        const conteudoAta = `Ata de número ${dados.numeroAta} da UPH ou SAF da Igreja Presbiteriana ${dadosIgreja.nomeSite}, às ${horarioInicio}h do dia ${dataFormatada}, esta reunião tem como objetivo, ${dados.objetivo}, no ${dados.localReuniao}, cito à ${dados.endereco}, nesta. A Reunião foi presidida pelo ${dados.presidente}. Além do mesmo, estavam presentes os seguintes membros da Diretoria: o Vice-presidente, ${dados.vicePresidente}; o 1º Secretário ${dados.primeiroSecretario}; o 2º Secretário ${dados.segundoSecretario}; o Tesoureiro, ${dados.tesoureiro} e o Conselheiro ${dados.conselheiro}. Contamos também com a presença dos seguintes unionistas: ${dados.outrosMembros}.

Após constatação do quorum, com ${numeroPresentes} membros presentes, inicia-se a reunião com Exercício Devocional constando de Leitura Bíblica ${dados.textoDevocional}, e exposição da mesma, por parte do ${dados.responsavelExposicao} . Após a explanação, ouve-se uma oração com o ${dados.responsavelOracao}. Logo a seguir entra em Pauta:

${dados.pautaDiscussao}

Não havendo mais nada para ser tratado, encerrou-se a presente às ${dados.horarioTermino}h, com uma Oração feita pelo ${dados.responsavelOracao}, com recitação e cântico do nosso Moto. E eu, ${dados.primeiroSecretario}, 1º Secretário desta Sociedade, a tudo presente, lavrei, dato e assino a presente ata.

Valparaíso de Goiás-GO, ${dataFormatada}.


_______________________________
${dados.primeiroSecretario}
1º Secretário


_______________________________
${dados.presidente}
Presidente


Notas:
[1] - Ata de número ${dados.numeroAta}, início às ${horarioInicio}h;
[2] - ${dados.objetivo};
[3] - Presentes: Diretoria e ${numeroPresentes - 6} unionistas;
[4] - Quorum: ${numeroPresentes} membros;
[5] - Exercício Devocional: ${dados.textoDevocional};
[6] - Encerramento às ${dados.horarioTermino}h.`;

        // Criar e fazer download do arquivo
        const blob = new Blob([conteudoAta], {type: 'text/plain'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ata_${dados.numeroAta}_${new Date(dados.dataReuniao).toISOString().split('T')[0]}.txt`;

        // Fazer o download
        document.body.appendChild(a);
        a.click();

        // Limpar o link
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Após confirmação de sucesso, então limpar os dados
        await Swal.fire({
            title: 'Sucesso!',
            text: 'Ata gerada com sucesso!',
            icon: 'success',
            confirmButtonText: 'OK'
        });

        // Somente após a confirmação do usuário, limpar os dados
        document.querySelectorAll('input, textarea').forEach(elemento => {
            elemento.value = '';
        });

        // Limpar localStorage
        localStorage.removeItem('dadosAta');
        localStorage.removeItem('pautaTemp');

    } catch (error) {
        console.error('Erro ao gerar ata:', error);
        Swal.fire({
            title: 'Erro!',
            text: `Erro ao gerar ata: ${error.message}`,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Função para validar dados antes de gerar a ata
function validarDados(dados) {
    const camposObrigatorios = [
        'numeroAta',
        'dataReuniao',
        'objetivo',
        'localReuniao',
        'endereco',
        'presidente',
        'vicePresidente',
        'primeiroSecretario',
        'segundoSecretario',
        'tesoureiro',
        'conselheiro',
        'textoDevocional',
        'responsavelExposicao',
        'responsavelOracao',
        'horarioTermino'
    ];

    const camposFaltantes = camposObrigatorios.filter(campo => !dados[campo]);

    if (camposFaltantes.length > 0) {
        throw new Error(`Os seguintes campos são obrigatórios: ${camposFaltantes.join(', ')}`);
    }

    if (!dados.outrosMembros.trim()) {
        throw new Error('É necessário incluir ao menos um membro além da diretoria');
    }
}

// Função para formatar texto da pauta
function formatarPauta(texto) {
    return texto
        .split('\n')
        .map(linha => linha.trim())
        .filter(linha => linha)
        .join('\n\n');
}

// Função para formatar hora
function formatarHora(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length >= 4) {
        const horas = valor.substr(0, 2);
        const minutos = valor.substr(2, 2);
        if (parseInt(horas) < 24 && parseInt(minutos) < 60) {
            input.value = `${horas}:${minutos}`;
        } else {
            input.value = '';
        }
    }
}

// Função para validar campo
function validarCampo(campo) {
    if (campo.required && !campo.value.trim()) {
        campo.classList.add('invalido');
        return false;
    }
    campo.classList.remove('invalido');
    return true;
}

// Função para carregar dados salvos
async function carregarDadosSalvos() {
    try {
        const dadosSalvos = localStorage.getItem('dadosAta');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            Object.keys(dados).forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) {
                    elemento.value = dados[id];
                }
            });
        }
    } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
    }
}

// Função para salvar dados temporariamente
function salvarDadosTemporarios() {
    const dados = {};
    document.querySelectorAll('input, textarea').forEach(elemento => {
        if (elemento.id) {
            dados[elemento.id] = elemento.value;
        }
    });
    localStorage.setItem('dadosAta', JSON.stringify(dados));
}

// Adicionar event listeners quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados salvos
    carregarDadosSalvos();

    // Adicionar validação em tempo real
    document.querySelectorAll('input, textarea').forEach(campo => {
        campo.addEventListener('input', () => {
            validarCampo(campo);
            salvarDadosTemporarios();
        });

        campo.addEventListener('blur', () => {
            validarCampo(campo);
        });
    });

    // Adicionar máscara de hora
    document.getElementById('horarioTermino').addEventListener('input', function () {
        formatarHora(this);
    });

    // Adicionar auto-save para a pauta
    const pautaTextarea = document.getElementById('pautaDiscussao');
    if (pautaTextarea) {
        pautaTextarea.addEventListener('input', () => {
            localStorage.setItem('pautaTemp', pautaTextarea.value);
        });

        // Carregar pauta salva
        const pautaSalva = localStorage.getItem('pautaTemp');
        if (pautaSalva) {
            pautaTextarea.value = pautaSalva;
        }
    }

    // Adicionar handler para o botão de gerar ata
    const btnGerarAta = document.querySelector('button[onclick="gerarAta()"]');
    if (btnGerarAta) {
        btnGerarAta.addEventListener('click', gerarAta);
    }
});

// Exportar função para o escopo global
window.gerarAta = gerarAta;