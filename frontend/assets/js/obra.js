document.addEventListener('DOMContentLoaded', function() {
    const ctaBanner = document.querySelector('.construction-cta-banner');
    const closeCtaBannerBtn = document.querySelector('.close-cta-banner');
    const mainHeader = document.querySelector('.header');

    function updateHeaderPosition() {
        if (ctaBanner && mainHeader) {
            // Verifica se o banner está efetivamente visível (não apenas display:block mas também não tem a classe .hidden)
            const isBannerVisible = getComputedStyle(ctaBanner).display !== 'none' && !ctaBanner.classList.contains('hidden');

            if (isBannerVisible) {
                const bannerHeight = ctaBanner.offsetHeight;
                mainHeader.style.top = bannerHeight + 'px';
            } else {
                mainHeader.style.top = '0px';
            }
        }
    }

    if (ctaBanner && closeCtaBannerBtn && mainHeader) {
        if (localStorage.getItem('constructionBannerClosed') === 'true') {
            // Se já foi fechado, não mostra e garante que o header está no topo
            ctaBanner.style.display = 'none'; // Garante que não ocupe espaço
            ctaBanner.classList.add('hidden'); // Para consistência se você usar a classe para animar
        } else {
            ctaBanner.style.display = 'block'; // Ou 'flex' se seu conteúdo interno for flex
            // A transição pode cuidar da aparição
            // Força um reflow para a transição de entrada funcionar (se houver)
            // void ctaBanner.offsetWidth; // Comentado pois a entrada não precisa ser animada agora
            // ctaBanner.classList.remove('hidden'); // Se você tivesse uma classe para mostrar
        }

        updateHeaderPosition(); // Ajusta na carga

        closeCtaBannerBtn.addEventListener('click', function() {
            ctaBanner.classList.add('hidden'); // Adiciona classe para animar a saída
            // Espera a animação de saída terminar para realmente esconder com display:none
            // e salvar no localStorage. A duração deve ser a mesma da transition no CSS.
            setTimeout(() => {
                ctaBanner.style.display = 'none';
                updateHeaderPosition(); // Reajusta o header após o banner ser completamente removido
            }, 300); // 300ms = 0.3s da transição CSS
        });

        window.addEventListener('resize', updateHeaderPosition);

    } else {
        console.warn('Banner CTA, botão de fechar ou header principal não encontrado.');
    }
});