document.addEventListener('DOMContentLoaded', function() {
    let calendar;
    let eventos = [];

    // Inicializar calendário
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
        themeSystem: 'standard',
        height: 'auto',
        firstDay: 0, // Domingo como primeiro dia
        dayMaxEvents: true, // Permite "more" link quando há muitos eventos
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

    // Funções principais
    async function carregarEventos(inicio, fim) {
        try {
            // Formatar datas para a API
            const dataInicio = inicio.toISOString().split('T')[0];
            const dataFim = fim.toISOString().split('T')[0];

            // Construir URL com parâmetros de data
            const url = new URL(`${CONFIG.API_URL}/agenda`);
            url.searchParams.append('dataInicio', dataInicio);
            url.searchParams.append('dataFim', dataFim);

            console.log('Fazendo requisição para:', url.toString());

            const response = await fetch(url.toString());

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Resposta da API:', errorText);
                throw new Error(`Erro ao carregar eventos: ${response.status}`);
            }

            eventos = await response.json();
            console.log('Eventos recebidos:', eventos);

            return eventos.map(evento => ({
                id: evento.id,
                title: evento.titulo,
                start: new Date(evento.dataInicio),
                end: new Date(evento.dataFim),
                description: evento.descricao,
                location: evento.localEvento,
                extendedProps: {
                    description: evento.descricao,
                    location: evento.localEvento
                }
            }));
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            mostrarMensagem('Erro ao carregar eventos', 'error');
            return [];
        }
    }

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
        `;

        return card;
    }

    function mostrarDetalhesEvento(event) {
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
            confirmButtonText: 'Fechar'
        });
    }

    function mostrarMensagem(texto, tipo) {
        Swal.fire({
            text: texto,
            icon: tipo,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }
});