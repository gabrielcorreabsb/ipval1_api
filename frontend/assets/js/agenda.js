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

async function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('./login.html');
        return false;
    }
    return true;
}

// Variáveis globais
let calendar;
let eventos = [];

// Inicialização do calendário
document.addEventListener('DOMContentLoaded', async function() {
    if (!await verificarAutenticacao()) return;

    const podeGerenciar = isPastor();
    console.log('Permissões do usuário:', { podeGerenciar });

    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia'
        },
        eventClick: function(info) {
            mostrarDetalhesEvento(info.event);
        },
        events: function(info, successCallback, failureCallback) {
            carregarEventos(info.start, info.end)
                .then(eventos => successCallback(eventos))
                .catch(error => failureCallback(error));
        }
    });

    calendar.render();
    configurarVisaoAlternada();
    configurarFiltros();
    verificarPermissoes();
});

// Funções de API
async function carregarEventos(inicio, fim) {
    try {
        const usuario = getUsuarioLogado();
        if (!usuario) {
            mostrarMensagem('Usuário não encontrado', 'error');
            return [];
        }

        const response = await fazerRequisicao(
            `${CONFIG.API_URL}/agenda?usuarioId=${usuario.idUsuario}`
        );

        if (response) {
            eventos = await response.json();
            console.log('Eventos carregados do servidor:', eventos);

            return eventos.map(evento => ({
                id: evento.id, // Usando id em vez de idEvento
                title: evento.titulo,
                start: new Date(evento.dataInicio),
                end: new Date(evento.dataFim),
                description: evento.descricao,
                location: evento.localEvento,
                extendedProps: {
                    eventoOriginal: evento, // Mantém o evento original completo
                    description: evento.descricao,
                    location: evento.localEvento
                }
            }));
        }
        return [];
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        mostrarMensagem('Erro ao carregar eventos', 'error');
        return [];
    }
}

async function criarEvento(dados) {
    if (!isPastor()) {
        mostrarMensagem('Você não tem permissão para criar eventos', 'error');
        return;
    }

    try {
        const usuario = getUsuarioLogado();
        if (!usuario) {
            mostrarMensagem('Usuário não encontrado', 'error');
            return;
        }

        const eventoData = {
            titulo: dados.titulo,
            descricao: dados.descricao,
            localEvento: dados.localEvento,
            dataInicio: dados.dataInicio,
            dataFim: dados.dataFim
        };

        const url = `${CONFIG.API_URL}/agenda?usuarioId=${usuario.idUsuario}`;

        console.log('Criando evento:', {
            url,
            dados: eventoData,
            usuarioId: usuario.idUsuario
        });

        const response = await fazerRequisicao(url, {
            method: 'POST',
            body: JSON.stringify(eventoData)
        });

        if (response) {
            mostrarMensagem('Evento criado com sucesso!', 'success');
            calendar.refetchEvents();
            await atualizarListaEventos();
        }
    } catch (error) {
        console.error('Erro ao criar evento:', error);
        mostrarMensagem('Erro ao criar evento', 'error');
    }
}

async function atualizarEvento(id, dados) {
    if (!isPastor()) {
        mostrarMensagem('Você não tem permissão para atualizar eventos', 'error');
        return;
    }

    try {
        const usuario = getUsuarioLogado();
        if (!usuario) {
            mostrarMensagem('Usuário não encontrado', 'error');
            return;
        }

        const eventoData = {
            titulo: dados.titulo,
            descricao: dados.descricao,
            localEvento: dados.localEvento,
            dataInicio: dados.dataInicio,
            dataFim: dados.dataFim
        };

        const url = `${CONFIG.API_URL}/agenda/${id}?usuarioId=${usuario.idUsuario}`;

        console.log('Atualizando evento:', {
            url,
            dados: eventoData,
            usuarioId: usuario.idUsuario,
            eventoId: id
        });

        const response = await fazerRequisicao(url, {
            method: 'PUT',
            body: JSON.stringify(eventoData)
        });

        if (response) {
            mostrarMensagem('Evento atualizado com sucesso!', 'success');
            calendar.refetchEvents();
            await atualizarListaEventos();
        }
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        mostrarMensagem('Erro ao atualizar evento', 'error');
    }
}

async function deletarEvento(id) {
    if (!isPastor()) {
        mostrarMensagem('Você não tem permissão para excluir eventos', 'error');
        return;
    }

    try {
        const usuario = getUsuarioLogado();
        if (!usuario) {
            mostrarMensagem('Usuário não encontrado', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Confirmar exclusão',
            text: 'Tem certeza que deseja excluir este evento?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const response = await fazerRequisicao(
                `${CONFIG.API_URL}/agenda/${id}?usuarioId=${usuario.idUsuario}`,
                {
                    method: 'DELETE'
                }
            );

            if (response) {
                mostrarMensagem('Evento excluído com sucesso!', 'success');
                calendar.refetchEvents();
                await atualizarListaEventos();
            }
        }
    } catch (error) {
        console.error('Erro ao deletar evento:', error);
        mostrarMensagem('Erro ao deletar evento', 'error');
    }
}

// Funções de UI
function configurarVisaoAlternada() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const calendarContainer = document.querySelector('.calendar-container');
    const listContainer = document.querySelector('.events-list-container');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const view = btn.dataset.view;
            if (view === 'calendar') {
                calendarContainer.style.display = 'block';
                listContainer.style.display = 'none';
                calendar.render();
            } else {
                calendarContainer.style.display = 'none';
                listContainer.style.display = 'block';
                atualizarListaEventos();
            }
        });
    });
}

function configurarFiltros() {
    const searchInput = document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');

    if (searchInput) {
        searchInput.addEventListener('input', atualizarListaEventos);
    }
    if (dateFilter) {
        dateFilter.addEventListener('change', atualizarListaEventos);
    }
}

async function atualizarListaEventos() {
    const searchInput = document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');
    const eventsList = document.getElementById('eventsList');

    if (!searchInput || !dateFilter || !eventsList) return;

    const searchTerm = searchInput.value.toLowerCase();
    const selectedDate = dateFilter.value;

    const eventosFiltrados = eventos.filter(evento => {
        const matchTitulo = evento.titulo.toLowerCase().includes(searchTerm);
        const matchData = !selectedDate || evento.dataInicio.includes(selectedDate);
        return matchTitulo && matchData;
    });

    eventsList.innerHTML = '';
    eventosFiltrados.forEach(evento => {
        const card = criarCardEvento(evento);
        eventsList.appendChild(card);
    });
}

function criarCardEvento(evento) {
    const card = document.createElement('div');
    card.className = 'event-card';
    const podeGerenciar = isPastor();

    const dataInicio = new Date(evento.dataInicio).toLocaleString();
    const dataFim = new Date(evento.dataFim).toLocaleString();

    card.innerHTML = `
        <div class="event-header">
            <h3 class="event-title">${evento.titulo}</h3>
            <span class="event-date">
                <i class="fas fa-clock"></i> ${dataInicio} - ${dataFim}
            </span>
        </div>
        <div class="event-details">
            <p>${evento.descricao || ''}</p>
            ${evento.localEvento ? `
                <div class="event-location">
                    <i class="fas fa-map-marker-alt"></i> ${evento.localEvento}
                </div>
            ` : ''}
        </div>
        ${podeGerenciar ? `
            <div class="user-actions">
                <button onclick="editarEvento(${evento.id})" class="action-btn edit">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button onclick="deletarEvento(${evento.id})" class="action-btn delete">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        ` : ''}
    `;

    return card;
}

async function abrirModalNovoEvento() {
    if (!isPastor()) {
        mostrarMensagem('Você não tem permissão para criar eventos', 'error');
        return;
    }

    const { value: formValues } = await Swal.fire({
        title: 'Novo Evento',
        html: `
            <input id="swal-titulo" class="swal2-input" placeholder="Título">
            <textarea id="swal-descricao" class="swal2-textarea" placeholder="Descrição"></textarea>
            <input id="swal-local" class="swal2-input" placeholder="Local">
            <input id="swal-inicio" class="swal2-input" type="datetime-local">
            <input id="swal-fim" class="swal2-input" type="datetime-local">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const titulo = document.getElementById('swal-titulo').value;
            const descricao = document.getElementById('swal-descricao').value;
            const localEvento = document.getElementById('swal-local').value;
            const dataInicio = document.getElementById('swal-inicio').value;
            const dataFim = document.getElementById('swal-fim').value;

            if (!titulo || !dataInicio || !dataFim) {
                Swal.showValidationMessage('Título e datas são obrigatórios');
                return false;
            }

            if (new Date(dataFim) < new Date(dataInicio)) {
                Swal.showValidationMessage('Data de término deve ser posterior à data de início');
                return false;
            }

            return { titulo, descricao, localEvento, dataInicio, dataFim };
        }
    });

    if (formValues) {
        await criarEvento(formValues);
    }
}

async function editarEvento(id) {
    if (!isPastor()) {
        mostrarMensagem('Você não tem permissão para editar eventos', 'error');
        return;
    }

    try {
        console.log('Eventos disponíveis:', eventos);
        console.log('Tentando editar evento com ID:', id);

        // Encontra o evento na lista de eventos
        const evento = eventos.find(e => Number(e.id) === Number(id));
        if (!evento) {
            console.error('Evento não encontrado. ID procurado:', id);
            console.log('IDs disponíveis:', eventos.map(e => e.id));
            mostrarMensagem('Evento não encontrado', 'error');
            return;
        }

        // Formata as datas para o formato aceito pelo input datetime-local
        const dataInicio = new Date(evento.dataInicio).toISOString().slice(0, 16);
        const dataFim = new Date(evento.dataFim).toISOString().slice(0, 16);

        console.log('Editando evento:', evento);

        const { value: formValues } = await Swal.fire({
            title: 'Editar Evento',
            html: `
                <div class="swal2-input-group">
                    <label for="swal-titulo">Título:</label>
                    <input id="swal-titulo" class="swal2-input" placeholder="Título" value="${evento.titulo || ''}">
                </div>
                <div class="swal2-input-group">
                    <label for="swal-descricao">Descrição:</label>
                    <textarea id="swal-descricao" class="swal2-textarea" placeholder="Descrição">${evento.descricao || ''}</textarea>
                </div>
                <div class="swal2-input-group">
                    <label for="swal-local">Local:</label>
                    <input id="swal-local" class="swal2-input" placeholder="Local" value="${evento.localEvento || ''}">
                </div>
                <div class="swal2-input-group">
                    <label for="swal-inicio">Data de Início:</label>
                    <input id="swal-inicio" class="swal2-input" type="datetime-local" value="${dataInicio}">
                </div>
                <div class="swal2-input-group">
                    <label for="swal-fim">Data de Término:</label>
                    <input id="swal-fim" class="swal2-input" type="datetime-local" value="${dataFim}">
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const titulo = document.getElementById('swal-titulo').value;
                const descricao = document.getElementById('swal-descricao').value;
                const localEvento = document.getElementById('swal-local').value;
                const dataInicio = document.getElementById('swal-inicio').value;
                const dataFim = document.getElementById('swal-fim').value;

                if (!titulo || !dataInicio || !dataFim) {
                    Swal.showValidationMessage('Título e datas são obrigatórios');
                    return false;
                }

                if (new Date(dataFim) < new Date(dataInicio)) {
                    Swal.showValidationMessage('Data de término deve ser posterior à data de início');
                    return false;
                }

                return { titulo, descricao, localEvento, dataInicio, dataFim };
            }
        });

        if (formValues) {
            console.log('Valores do formulário:', formValues);
            await atualizarEvento(id, formValues);
        }
    } catch (error) {
        console.error('Erro ao abrir modal de edição:', error);
        mostrarMensagem('Erro ao editar evento', 'error');
    }
}

async function atualizarEvento(id, dados) {
    if (!isPastor()) {
        mostrarMensagem('Você não tem permissão para atualizar eventos', 'error');
        return;
    }

    try {
        const usuario = getUsuarioLogado();
        if (!usuario) {
            mostrarMensagem('Usuário não encontrado', 'error');
            return;
        }

        const eventoData = {
            titulo: dados.titulo,
            descricao: dados.descricao,
            localEvento: dados.localEvento,
            dataInicio: dados.dataInicio,
            dataFim: dados.dataFim
        };

        const url = `${CONFIG.API_URL}/agenda/${id}?usuarioId=${usuario.idUsuario}`;

        console.log('Atualizando evento:', {
            url,
            dados: eventoData,
            usuarioId: usuario.idUsuario
        });

        const response = await fazerRequisicao(url, {
            method: 'PUT',
            body: JSON.stringify(eventoData)
        });

        if (response) {
            mostrarMensagem('Evento atualizado com sucesso!', 'success');
            calendar.refetchEvents();
            await atualizarListaEventos();
        }
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        mostrarMensagem('Erro ao atualizar evento', 'error');
    }
}

function mostrarDetalhesEvento(event) {
    console.log('Evento clicado:', event); // Debug
    const podeGerenciar = isPastor();

    Swal.fire({
        title: event.title,
        html: `
            <div class="event-details-modal">
                <p><strong>Início:</strong> ${new Date(event.start).toLocaleString()}</p>
                <p><strong>Término:</strong> ${new Date(event.end).toLocaleString()}</p>
                ${event.extendedProps.description ? `<p><strong>Descrição:</strong> ${event.extendedProps.description}</p>` : ''}
                ${event.extendedProps.location ? `<p><strong>Local:</strong> ${event.extendedProps.location}</p>` : ''}
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: podeGerenciar ? 'Editar' : 'Fechar',
        cancelButtonText: 'Fechar',
        showDenyButton: podeGerenciar,
        denyButtonText: podeGerenciar ? 'Excluir' : undefined
    }).then((result) => {
        if (result.isConfirmed && podeGerenciar) {
            console.log('Iniciando edição do evento:', event.id); // Debug
            editarEvento(event.id);
        } else if (result.isDenied && podeGerenciar) {
            deletarEvento(event.id);
        }
    });
}

function verificarPermissoes() {
    const podeGerenciar = isPastor();
    console.log('Permissão para gerenciar eventos:', podeGerenciar);

    // Controle do botão Novo Evento
    const btnNovoEvento = document.querySelector('.btn-primary');
    if (btnNovoEvento) {
        btnNovoEvento.style.display = podeGerenciar ? 'flex' : 'none';
    }

    // Controle dos botões de edição e exclusão
    const elementosEdicao = document.querySelectorAll('.edit-actions, .action-btn.edit, .action-btn.delete');
    elementosEdicao.forEach(elemento => {
        elemento.style.display = podeGerenciar ? 'flex' : 'none';
    });
}

// Exportar funções necessárias
window.abrirModalNovoEvento = abrirModalNovoEvento;
window.editarEvento = editarEvento;
window.deletarEvento = deletarEvento;
