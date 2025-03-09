async function carregarNoticia() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        window.location.href = 'index.html#noticias';
        return;
    }

    try {
        const response = await fetch(`${CONFIG.API_URL}/noticias/${id}`);
        if (!response.ok) throw new Error('Notícia não encontrada');

        const noticia = await response.json();
        document.title = `${noticia.titulo} - Igreja Presbiteriana do Valparaíso 1`;

        // Atualiza a imagem
        const imagemContainer = document.querySelector('.noticia-imagem');
        imagemContainer.innerHTML = `
            <img src="${noticia.imagemUrl || 'https://placehold.co/1200x600'}" 
                 alt="${noticia.titulo}">
        `;

        // Atualiza as informações
        const infoContainer = document.querySelector('.noticia-info');
        infoContainer.innerHTML = `
            <h1>${noticia.titulo}</h1>
            <div class="noticia-metadata">
                <span class="data">
                    <i class="far fa-calendar"></i>
                    ${new Date(noticia.dataCriacao).toLocaleDateString('pt-BR')}
                </span>
                <span class="autor">
                    <i class="far fa-user"></i>
                    ${noticia.autorNome || 'Igreja Presbiteriana'}
                </span>
            </div>
            <div class="noticia-texto">
                ${noticia.conteudo}
            </div>
        `;

    } catch (error) {
        console.error('Erro ao carregar notícia:', error);
        document.querySelector('.noticia-content').innerHTML = `
            <div class="noticia-erro">
                <i class="fas fa-exclamation-circle"></i>
                <h2>Notícia não encontrada</h2>
                <p>Desculpe, não foi possível encontrar a notícia solicitada.</p>
                <a href="index.html#noticias" class="btn-primary">Voltar para Notícias</a>
            </div>
        `;
    }
}

async function compartilharNoticia() {
    const url = window.location.href;
    const title = document.title;

    try {
        if (navigator.share) {
            await navigator.share({
                title,
                url
            });
        } else {
            await navigator.clipboard.writeText(url);
            Swal.fire({
                text: 'Link copiado para a área de transferência!',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    } catch (error) {
        console.error('Erro ao compartilhar:', error);
    }
}

// Gerenciamento de imagem e zoom
document.addEventListener('DOMContentLoaded', function() {
    carregarNoticia();

    const noticiaImagem = document.querySelector('.noticia-imagem');
    if (!noticiaImagem) return;

    const img = noticiaImagem.querySelector('img');
    if (!img) return;

    // Adiciona classe de loading enquanto a imagem carrega
    noticiaImagem.classList.add('loading');

    img.onload = function() {
        noticiaImagem.classList.remove('loading');

        // Ajusta o container baseado nas dimensões da imagem
        const container = noticiaImagem.parentElement;
        const imageRatio = this.naturalWidth / this.naturalHeight;

        // Ajusta o container para acomodar a imagem adequadamente
        if (imageRatio > 2 || imageRatio < 0.5) {
            container.style.height = 'auto';
            container.style.paddingTop = '0';
            this.style.height = 'auto';
            this.style.maxHeight = '600px';
            noticiaImagem.classList.add('contain');
        }

        // Adiciona funcionalidade de zoom se a imagem for maior que o container
        if (this.naturalWidth > container.offsetWidth) {
            noticiaImagem.classList.add('zoomable');
        }
    };

    // Implementa o zoom com botão de fechar
    noticiaImagem.addEventListener('click', function() {
        if (this.classList.contains('zoomable')) {
            this.classList.toggle('zoomed');

            if (this.classList.contains('zoomed')) {
                document.body.style.overflow = 'hidden';

                // Adiciona botão de fechar
                if (!document.querySelector('.zoom-close-btn')) {
                    const closeBtn = document.createElement('button');
                    closeBtn.innerHTML = '×';
                    closeBtn.className = 'zoom-close-btn';
                    document.body.appendChild(closeBtn);

                    closeBtn.onclick = () => {
                        this.classList.remove('zoomed');
                        document.body.style.overflow = '';
                        closeBtn.remove();
                    };
                }
            } else {
                document.body.style.overflow = '';
                const closeBtn = document.querySelector('.zoom-close-btn');
                if (closeBtn) closeBtn.remove();
            }
        }
    });

    // Fecha o zoom com Esc
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && noticiaImagem.classList.contains('zoomed')) {
            noticiaImagem.classList.remove('zoomed');
            document.body.style.overflow = '';
            const closeBtn = document.querySelector('.zoom-close-btn');
            if (closeBtn) closeBtn.remove();
        }
    });
});