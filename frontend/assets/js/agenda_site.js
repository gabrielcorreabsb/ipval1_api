// Arquivo: assets/js/eventos.js

/**
 * Gerenciamento de eventos da igreja
 * Inclui funcionalidades para:
 * - Exibição de eventos na página inicial
 * - Calendário completo na página de agenda
 * - Visualização em lista
 * - Filtros de busca
 * - Integração com WhatsApp
 */

document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let calendar;
    let eventos = [];
    let whatsappNumero = '';

    // Inicializar componentes
    inicializarCalendario();
    carregarProximosEventos();
    carregarWhatsappIgreja();

    // Configurar botões e interações
    configurarVisaoAlternada();
    configurarFiltros();
    configurarBotaoWhatsapp();

    /**
     * Inicializa o calendário FullCalendar na página de agenda
     */
    function inicializarCalendario() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

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
            firstDay: 0,
            dayMaxEvents: true,
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            },
            eventDisplay: 'block',
            displayEventTime: true,
            displayEventEnd: true,
            slotMinTime: '06:00:00', // Início do dia às 6h
            slotMaxTime: '23:00:00', // Fim do dia às 23h
            slotDuration: '00:30:00', // Intervalos de 30 minutos
            eventDidMount: function(info) {
                // Adiciona tooltip com informações detalhadas
                const evento = info.event;
                const dataInicio = evento.start.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // Cria um elemento personalizado para o tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'evento-tooltip';
                tooltip.innerHTML = `
                <div class="evento-tooltip-content">
                    <div class="evento-tooltip-header">
                        <i class="fas fa-calendar-alt"></i>
                        <strong>${evento.title}</strong>
                    </div>
                    <div class="evento-tooltip-body">
                        <p><i class="fas fa-clock"></i> ${dataInicio}</p>
                        ${evento.extendedProps.location ?
                    `<p><i class="fas fa-map-marker-alt"></i> ${evento.extendedProps.location}</p>` : ''}
                        ${evento.extendedProps.description ?
                    `<p><i class="fas fa-info-circle"></i> ${evento.extendedProps.description}</p>` : ''}
                    </div>
                </div>
            `;

                // Aplica estilos personalizados ao evento
                info.el.style.backgroundColor = 'var(--color-accent)';
                info.el.style.borderRadius = '4px';
                info.el.style.border = 'none';

                // Adiciona classes para hover effect
                info.el.classList.add('calendar-event');

                // Configura o tooltip usando Tippy.js (se disponível) ou title padrão
                if (window.tippy) {
                    tippy(info.el, {
                        content: tooltip,
                        allowHTML: true,
                        placement: 'top',
                        interactive: true,
                        theme: 'custom'
                    });
                } else {
                    info.el.title = `${evento.title} - ${dataInicio}${evento.extendedProps.location ? ` - ${evento.extendedProps.location}` : ''}`;
                }
            },
            eventClick: function(info) {
                mostrarDetalhesEvento(info.event);
            },
            events: function(info, successCallback, failureCallback) {
                carregarEventos(info.start, info.end)
                    .then(eventos => successCallback(eventos))
                    .catch(error => failureCallback(error));
            },
            // Personalização das visualizações
            views: {
                dayGridMonth: {
                    dayMaxEvents: 3, // Limita o número de eventos visíveis por dia
                    moreLinkText: 'mais', // Texto para o link "mais"
                    moreLinkClick: 'popover' // Abre um popover com todos os eventos
                },
                timeGridWeek: {
                    dayHeaderFormat: { weekday: 'short', day: 'numeric', month: 'numeric' }
                },
                timeGridDay: {
                    dayHeaderFormat: { weekday: 'long', day: 'numeric', month: 'long' }
                }
            }
        });

        calendar.render();
    }

    /**
     * Carrega o número de WhatsApp da igreja das configurações
     */
    async function carregarWhatsappIgreja() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/configuracoes`);
            if (!response.ok) throw new Error('Erro ao carregar configurações');

            const config = await response.json();
            if (config.whatsapp) {
                // Remover formatação e manter apenas números
                whatsappNumero = config.whatsapp.replace(/\D/g, '');

                // Se o número não começar com +55, adicionar
                if (!whatsappNumero.startsWith('55')) {
                    whatsappNumero = '55' + whatsappNumero;
                }

                // Atualizar todos os botões de WhatsApp
                atualizarBotoesWhatsapp();
            }
        } catch (error) {
            console.error('Erro ao carregar WhatsApp da igreja:', error);
        }
    }

    /**
     * Configura o botão de WhatsApp para eventos
     */
    function configurarBotaoWhatsapp() {
        // Adicionar botão de WhatsApp na seção de eventos da página inicial
        const eventosCta = document.querySelector('.eventos-cta');
        if (eventosCta) {
            const whatsappBtn = document.createElement('a');

            eventosCta.appendChild(whatsappBtn);
        }

        // Adicionar botão de WhatsApp na página de agenda
        const agendaHeader = document.querySelector('.agenda-header');
        if (agendaHeader) {
            const whatsappAgendaBtn = document.createElement('a');
            whatsappAgendaBtn.className = 'btn-whatsapp agenda-whatsapp-btn';
            whatsappAgendaBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Falar com secretaria';
            whatsappAgendaBtn.setAttribute('target', '_blank');
            whatsappAgendaBtn.setAttribute('rel', 'noopener noreferrer');
            agendaHeader.appendChild(whatsappAgendaBtn);
        }

        // Atualizar URLs dos botões
        atualizarBotoesWhatsapp();
    }

    /**
     * Atualiza os links de WhatsApp com o número correto
     */
    function atualizarBotoesWhatsapp() {
        if (!whatsappNumero) return;

        // Botão na seção de eventos da página inicial
        const eventoWhatsappBtn = document.querySelector('.evento-whatsapp-btn');
        if (eventoWhatsappBtn) {
            const mensagem = encodeURIComponent('Olá! Gostaria de mais informações sobre os próximos eventos da igreja.');
            eventoWhatsappBtn.href = `https://wa.me/${whatsappNumero}?text=${mensagem}`;
        }

        // Botão na página de agenda
        const agendaWhatsappBtn = document.querySelector('.agenda-whatsapp-btn');
        if (agendaWhatsappBtn) {
            const mensagem = encodeURIComponent('Olá! Gostaria de mais informações sobre a agenda de eventos da igreja.');
            agendaWhatsappBtn.href = `https://wa.me/${whatsappNumero}?text=${mensagem}`;
        }
    }

    /**
     * Carrega e exibe os próximos eventos na página inicial
     */
    async function carregarProximosEventos() {
        try {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0); // Reseta o horário para início do dia

            const dataLimite = new Date();
            dataLimite.setMonth(dataLimite.getMonth() + 3); // 3 meses à frente

            // Construir URL com parâmetros de data
            const url = new URL(`${CONFIG.API_URL}/agenda`);
            url.searchParams.append('dataInicio', hoje.toISOString().split('T')[0]);
            url.searchParams.append('dataFim', dataLimite.toISOString().split('T')[0]);

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`Erro ao carregar eventos: ${response.status}`);

            const eventos = await response.json();

            // Filtra apenas eventos futuros e ordena por data
            const eventosFuturos = eventos
                .filter(evento => {
                    const dataEvento = new Date(evento.dataInicio);
                    return dataEvento >= hoje;
                })
                .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))
                .slice(0, 3); // Limita a 3 eventos

            if (!eventosFuturos || eventosFuturos.length === 0) {
                const eventosTimeline = document.querySelector('.eventos-timeline');
                if (eventosTimeline) {
                    eventosTimeline.innerHTML = `
                    <div class="no-eventos">
                        <i class="fas fa-calendar-times"></i>
                        <p>Não há eventos programados para os próximos meses.</p>
                    </div>
                `;
                }
                return;
            }

            atualizarTimelineEventos(eventosFuturos);
            adicionarBotoesWhatsappEventos(eventosFuturos);

        } catch (error) {
            console.error('Erro ao carregar próximos eventos:', error);
            mostrarEventosDefault();
        }
    }

    /**
     * Adiciona botões de WhatsApp para cada evento individual
     */
    function adicionarBotoesWhatsappEventos(eventos) {
        // Verificar se temos eventos válidos
        if (!eventos || !Array.isArray(eventos) || eventos.length === 0) {
            console.warn('Lista de eventos vazia ou inválida. Botões não serão adicionados.');
            return;
        }

        // Usar o serviço centralizado de WhatsApp
        window.WhatsAppService.onCarregado(function(numero) {
            if (!numero) {
                console.warn('Número de WhatsApp não disponível. Botões não serão adicionados.');
                return;
            }

            // Usar setTimeout para garantir que o DOM esteja pronto
            setTimeout(() => {
                const eventosItems = document.querySelectorAll('.evento-item');

                if (eventosItems.length === 0) {
                    console.warn('Nenhum elemento .evento-item encontrado no DOM.');
                    return;
                }

                // console.log(`Adicionando botões WhatsApp a ${Math.min(eventosItems.length, eventos.length)} eventos`);

                eventosItems.forEach((item, index) => {
                    if (index >= eventos.length) return;

                    const evento = eventos[index];
                    if (!evento || !evento.titulo || !evento.dataInicio) {
                        console.warn(`Evento no índice ${index} está incompleto ou inválido.`);
                        return;
                    }

                    const eventoInfo = item.querySelector('.evento-info');

                    if (eventoInfo) {
                        // Verificar se o botão já existe para evitar duplicação
                        if (eventoInfo.querySelector('.evento-whatsapp-link')) {
                            return;
                        }

                        const whatsappLink = document.createElement('a');
                        whatsappLink.className = 'evento-whatsapp-link';
                        whatsappLink.innerHTML = '<i class="fab fa-whatsapp"></i> Dúvidas? Fale conosco.';
                        whatsappLink.setAttribute('target', '_blank');
                        whatsappLink.setAttribute('rel', 'noopener noreferrer');

                        try {
                            const dataFormatada = new Date(evento.dataInicio).toLocaleDateString();
                            const mensagem = encodeURIComponent(`Olá! Gostaria de mais informações sobre o evento "${evento.titulo}" que acontecerá em ${dataFormatada}.`);
                            whatsappLink.href = `https://wa.me/${numero}?text=${mensagem}`;
                        } catch (error) {
                            console.error(`Erro ao formatar data do evento ${evento.titulo}:`, error);
                            // Fallback para caso a data seja inválida
                            const mensagem = encodeURIComponent(`Olá! Gostaria de mais informações sobre o evento "${evento.titulo}".`);
                            whatsappLink.href = `https://wa.me/${numero}?text=${mensagem}`;
                        }

                        eventoInfo.appendChild(whatsappLink);
                        // console.log(`Botão WhatsApp adicionado ao evento: ${evento.titulo}`);
                    } else {
                        console.warn(`Elemento .evento-info não encontrado para o evento no índice ${index}`);
                    }
                });
            }, 500); // Esperar 500ms para garantir que o DOM esteja pronto
        });
    }
    /**
     * Atualiza a timeline de eventos na página inicial
     */
    function atualizarTimelineEventos(eventos) {
        const eventosTimeline = document.querySelector('.eventos-timeline');
        if (!eventosTimeline) return;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const eventosHTML = eventos.map(evento => {
            const data = new Date(evento.dataInicio);
            const dia = data.getDate();
            const mes = data.toLocaleString('pt-BR', {month: 'short'}).toUpperCase().replace('.', '');
            const hora = data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});

            // Verifica se o evento é hoje
            const isHoje = data.toDateString() === hoje.toDateString();
            const dataClass = isHoje ? 'evento-data hoje' : 'evento-data';

            return `
            <div class="evento-item">
                <div class="${dataClass}">
                    <span class="evento-dia">${dia}</span>
                    <span class="evento-mes">${mes}</span>
                    ${isHoje ? '<span class="evento-badge-hoje">HOJE</span>' : ''}
                </div>
                <div class="evento-conteudo">
                    <h3 class="evento-titulo">${evento.titulo}</h3>
                    <p class="evento-descricao">${evento.descricao || 'Sem descrição disponível'}</p>
                    <div class="evento-info">
                        <span><i class="fas fa-clock"></i> ${hora}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${evento.localEvento || 'Local a definir'}</span>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        eventosTimeline.innerHTML = eventosHTML;

        // Adicionar estilo especial para eventos do dia
        if (document.querySelector('.evento-data.hoje')) {
            const style = document.createElement('style');
            style.textContent = `
            .evento-data.hoje {
                background-color: var(--color-accent);
                position: relative;
            }
            .evento-badge-hoje {
                position: absolute;
                top: -10px;
                right: -10px;
                background: var(--color-accent);
                color: var(--color-white);
                font-size: 0.7rem;
                padding: 2px 6px;
                border-radius: 10px;
                font-weight: bold;
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(11, 102, 54, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(11, 102, 54, 0); }
                100% { box-shadow: 0 0 0 0 rgba(11, 102, 54, 0); }
            }
            .evento-data.hoje {
                animation: pulse 2s infinite;
            }
        `;
            document.head.appendChild(style);
        }
    }

    /**
     * Mostra eventos padrão caso ocorra algum erro
     */
    function mostrarEventosDefault() {
        const eventosTimeline = document.querySelector('.eventos-timeline');
        if (!eventosTimeline) return;

        eventosTimeline.innerHTML = `
            <div class="evento-item">
                <div class="evento-data">
                    <span class="evento-dia">--</span>
                    <span class="evento-mes">---</span>
                </div>
                <div class="evento-conteudo">
                    <h3 class="evento-titulo">Não foi possível carregar os eventos</h3>
                    <p class="evento-descricao">Por favor, consulte nossa agenda completa para ver os próximos eventos.</p>
                    <div class="evento-info">
                        <span><i class="fas fa-exclamation-circle"></i> Tente novamente mais tarde</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Carrega eventos para o calendário
     */
    async function carregarEventos(inicio, fim) {
        try {
            const dataInicio = inicio.toISOString().split('T')[0];
            const dataFim = fim.toISOString().split('T')[0];

            const url = new URL(`${CONFIG.API_URL}/agenda`);
            url.searchParams.append('dataInicio', dataInicio);
            url.searchParams.append('dataFim', dataFim);

            const response = await fetch(url.toString());

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Resposta da API:', errorText);
                throw new Error(`Erro ao carregar eventos: ${response.status}`);
            }

            eventos = await response.json();
            window.eventosAgenda = eventos;

            return eventos.map(evento => {
                const dataInicio = new Date(evento.dataInicio);
                const dataFim = new Date(evento.dataFim);

                // Formatação correta das horas
                const horaInicio = dataInicio.getHours().toString().padStart(2, '0') + ':' +
                    dataInicio.getMinutes().toString().padStart(2, '0');

                // Formatar o título incluindo a hora
                const tituloFormatado = `${evento.titulo}`;

                return {
                    id: evento.id,
                    title: tituloFormatado, // Usar o título formatado com a hora
                    start: dataInicio,
                    end: dataFim,
                    description: evento.descricao,
                    location: evento.localEvento,
                    extendedProps: {
                        description: evento.descricao,
                        location: evento.localEvento,
                        horaInicio: horaInicio,
                        horaOriginal: evento.titulo // Mantém o título original sem a hora
                    }
                };
            });
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            mostrarMensagem('Erro ao carregar eventos', 'error');
            return [];
        }
    }

    /**
     * Configura a alternância entre visualização de calendário e lista
     */
    function configurarVisaoAlternada() {
        const viewBtns = document.querySelectorAll('.view-btn');
        const calendarContainer = document.querySelector('.calendar-container');
        const listContainer = document.querySelector('.events-list-container');

        if (!viewBtns.length || !calendarContainer || !listContainer) return;

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

    /**
     * Configura os filtros de busca e data
     */
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

    /**
     * Atualiza a lista de eventos com base nos filtros
     */
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

        if (eventosFiltrados.length === 0) {
            eventsList.innerHTML = `
                <div class="no-events-message">
                    <i class="fas fa-search"></i>
                    <p>Nenhum evento encontrado com os filtros selecionados.</p>
                    <button class="clear-filters-btn" onclick="document.getElementById('searchInput').value=''; document.getElementById('dateFilter').value=''; atualizarListaEventos();">
                        Limpar filtros
                    </button>
                </div>
            `;
            return;
        }

        eventosFiltrados.forEach(evento => {
            const card = criarCardEvento(evento);
            eventsList.appendChild(card);
        });
    }

    /**
     * Cria um card de evento para a visualização em lista
     */
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
            <div class="event-actions">
                <button class="event-details-btn" onclick="mostrarDetalhesEvento(${JSON.stringify(evento).replace(/"/g, '&quot;')})">
                    <i class="fas fa-info-circle"></i> Detalhes
                </button>
                ${whatsappNumero ? `
                    <a href="https://wa.me/${whatsappNumero}?text=${encodeURIComponent(`Olá! Gostaria de mais informações sobre o evento "${evento.titulo}" que acontecerá em ${new Date(evento.dataInicio).toLocaleDateString()}.`)}" 
                       class="event-whatsapp-btn" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-whatsapp"></i> Perguntar
                    </a>
                ` : ''}
            </div>
        `;

        return card;
    }

    /**
     * Mostra detalhes de um evento em um modal
     */
    function mostrarDetalhesEvento(event) {
        // Se o evento vier do FullCalendar
        if (event.title) {
            Swal.fire({
                title: event.title,
                html: `
                    <div class="event-details-modal">
                        <p><strong>Início:</strong> ${new Date(event.start).toLocaleString()}</p>
                        <p><strong>Término:</strong> ${new Date(event.end).toLocaleString()}</p>
                        ${event.extendedProps.description ? `<p><strong>Descrição:</strong> ${event.extendedProps.description}</p>` : ''}
                        ${event.extendedProps.location ? `<p><strong>Local:</strong> ${event.extendedProps.location}</p>` : ''}
                        ${whatsappNumero ? `
                            <div class="modal-whatsapp-container">
                                <a href="https://wa.me/${whatsappNumero}?text=${encodeURIComponent(`Olá! Gostaria de mais informações sobre o evento "${event.title}" que acontecerá em ${new Date(event.start).toLocaleDateString()}.`)}" 
                                   class="modal-whatsapp-btn" target="_blank" rel="noopener noreferrer">
                                    <i class="fab fa-whatsapp"></i> Perguntar sobre este evento
                                </a>
                            </div>
                        ` : ''}
                    </div>
                `,
                confirmButtonText: 'Fechar',
                confirmButtonColor: '#0b6636'
            });
        }
        // Se o evento vier da lista
        else {
            Swal.fire({
                title: event.titulo,
                html: `
                    <div class="event-details-modal">
                        <p><strong>Início:</strong> ${new Date(event.dataInicio).toLocaleString()}</p>
                        <p><strong>Término:</strong> ${new Date(event.dataFim).toLocaleString()}</p>
                        ${event.descricao ? `<p><strong>Descrição:</strong> ${event.descricao}</p>` : ''}
                        ${event.localEvento ? `<p><strong>Local:</strong> ${event.localEvento}</p>` : ''}
                        ${whatsappNumero ? `
                            <div class="modal-whatsapp-container">
                                <a href="https://wa.me/${whatsappNumero}?text=${encodeURIComponent(`Olá! Gostaria de mais informações sobre o evento "${event.titulo}" que acontecerá em ${new Date(event.dataInicio).toLocaleDateString()}.`)}" 
                                   class="modal-whatsapp-btn" target="_blank" rel="noopener noreferrer">
                                    <i class="fab fa-whatsapp"></i> Perguntar sobre este evento
                                </a>
                            </div>
                        ` : ''}
                    </div>
                `,
                confirmButtonText: 'Fechar',
                confirmButtonColor: '#0b6636'
            });
        }
    }

    /**
     * Exibe mensagens de notificação
     */
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

    // Exportar funções para uso global
    window.eventosJS = {
        mostrarDetalhesEvento,
    };
});

/**
 * Função global para mostrar detalhes de um evento
 * Pode ser chamada de qualquer lugar do código
 */
function mostrarDetalhesEvento(evento) {
    if (window.eventosJS && window.eventosJS.mostrarDetalhesEvento) {
        window.eventosJS.mostrarDetalhesEvento(evento);
    } else {
        console.error('Função mostrarDetalhesEvento não está disponível');
    }
}
