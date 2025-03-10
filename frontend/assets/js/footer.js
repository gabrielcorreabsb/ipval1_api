// Função para carregar as configurações do footer
async function carregarConfiguracoesFooter() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/configuracoes`);
        if (!response.ok) {
            throw new Error('Erro ao carregar configurações');
        }

        const config = await response.json();
        atualizarFooter(config);
    } catch (error) {
        console.error('Erro ao carregar configurações do footer:', error);
    }
}

// Função para atualizar o conteúdo do footer
function atualizarFooter(config) {
    // Atualizar informações da igreja
    const footerInfo = document.querySelector('.footer-info');
    if (footerInfo) {
        footerInfo.innerHTML = `
            <h3>${config.nomeSite || 'Igreja Presbiteriana do Valparaíso 1'}</h3>
            <p>Nosso endereço:</p>
           <p>${config.endereco || 'Endereço não disponível'}</p>
           <br> 
            <p>Nossa programação:</p>

            <p>${config.horarioCultos || 'Horário não disponível'}</p>
        `;
    }

    // Atualizar links sociais
    const socialLinks = document.querySelector('.social-links');
    if (socialLinks) {
        socialLinks.innerHTML = `
            ${config.facebookUrl ? `<a href="${config.facebookUrl}" target="_blank"><i class="fab fa-facebook"></i></a>` : ''}
            ${config.instagramUrl ? `<a href="${config.instagramUrl}" target="_blank"><i class="fab fa-instagram"></i></a>` : ''}
            ${config.youtubeUrl ? `<a href="${config.youtubeUrl}" target="_blank"><i class="fab fa-youtube"></i></a>` : ''}
        `;
    }

    // Atualizar informações de contato
    const footerContact = document.querySelector('.footer-contact');
    if (footerContact) {
        footerContact.innerHTML = `
            <h3>Contato</h3>
            ${config.telefone ? `<p>Tel: ${config.telefone}</p>` : ''}
            ${config.whatsapp ? `<p>WhatsApp: ${config.whatsapp}</p>` : ''}
            ${config.email ? `<p>Email: ${config.email}</p>` : ''}
        `;
    }
}

// Carregar configurações quando a página carregar
document.addEventListener('DOMContentLoaded', carregarConfiguracoesFooter);
