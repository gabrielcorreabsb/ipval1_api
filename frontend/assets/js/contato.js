document.addEventListener('DOMContentLoaded', function() {
    carregarConfiguracoesContato();
    configurarFormulario();
    // Inicialize o EmailJS com seu User ID
    emailjs.init("7qA5h6eFVrG7dkTq5");
});

async function carregarConfiguracoesContato() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/configuracoes`);
        if (!response.ok) {
            throw new Error('Erro ao carregar configurações');
        }

        const config = await response.json();
        atualizarInformacoesContato(config);
    } catch (error) {
        console.error('Erro ao carregar configurações de contato:', error);
    }
}

function atualizarInformacoesContato(config) {
    // Atualizar informações do pastor
    const pastorInfo = document.querySelector('.pastor-info');
    if (pastorInfo && config.pastor) {
        pastorInfo.innerHTML = `
            <p><strong>${config.pastor.nome || 'Pastor Lucas Gomes de Souza'}</strong></p>
            <div class="contact-item">
                <i class="fab fa-whatsapp"></i>
                <a href="https://wa.me/55${config.pastor.telefone?.replace(/\D/g, '')}" target="_blank">
                    ${config.pastor.telefone || '(61) 98100-6238'}
                </a>
            </div>
        `;
    }

    // Atualizar endereço
    const addressInfo = document.querySelector('.address-info');
    if (addressInfo) {
        addressInfo.innerHTML = `
            <p><strong>${config.nomeSite || 'Igreja Presbiteriana do Valparaíso 1'}</strong></p>
            <p>${config.endereco || 'Endereço não disponível'}</p>
            <p>${config.cidade || 'Valparaíso de Goiás'} - ${config.estado || 'GO'}</p>
        `;
    }

    // Atualizar horários
    const scheduleContent = document.querySelector('.schedule .card-content');
    if (scheduleContent && config.horarioCultos) {
        const horarios = config.horarioCultos.split('\n').map(horario => {
            const [titulo, hora] = horario.split(':');
            return `
                <div class="schedule-item">
                    <h3>${titulo}</h3>
                </div>
            `;
        }).join('');

        scheduleContent.innerHTML = horarios;
    }
}

function configurarFormulario() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Mostrar loading
            Swal.fire({
                title: 'Enviando...',
                text: 'Por favor, aguarde.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Preparar os dados do template
            const templateParams = {
                to_email: 'ip.valparaiso1@gmail.com',
                from_name: document.getElementById('name').value,
                from_email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                reply_to: document.getElementById('email').value
            };

            // Enviar o email usando EmailJS
            emailjs.send(
                'service_tbi237k',
                'template_1yaym8v',
                templateParams
            )
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    Swal.fire({
                        title: 'Mensagem Enviada!',
                        text: 'Agradecemos seu contato. Retornaremos em breve.',
                        icon: 'success',
                        confirmButtonColor: '#4A8B4A'
                    });
                    contactForm.reset();
                })
                .catch(function(error) {
                    console.error('FAILED...', error);
                    Swal.fire({
                        title: 'Erro no envio',
                        html: `
                        <p>Não foi possível enviar sua mensagem.</p>
                        <p>Por favor, tente uma das alternativas:</p>
                        <p>1. Envie diretamente para: ip.valparaiso1@gmail.com</p>
                        <p>2. Entre em contato pelo WhatsApp: (61) 98100-6238</p>
                    `,
                        icon: 'error',
                        confirmButtonColor: '#4A8B4A'
                    });
                });
        });
    }




}