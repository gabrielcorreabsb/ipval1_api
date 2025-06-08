// ./assets/js/folder-construcao.js

document.addEventListener('DOMContentLoaded', function() {
    console.log("Folder Construção JS Ativado");

    // Animação ao rolar (Intersection Observer)
    const animatedElements = document.querySelectorAll(
        '.fc-hero-content, .fc-section-header, .fc-video-wrapper, .fc-verse-section .container, .fc-impact-item, .fc-donation-card, .fc-final-cta-section .container, .fc-progress-impact-section .fc-progress-bar-container, .fc-donation-grid, .fc-impact-points'
    );

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                // observer.unobserve(entry.target); // Descomente para animar apenas uma vez
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

function copiarTextoInput(inputId, buttonElement) {
    const inputElement = document.getElementById(inputId);
    const feedbackElement = document.getElementById(`feedback-${inputId}`);
    const originalButtonIconHTML = buttonElement.innerHTML;

    if (!inputElement) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Campo não encontrado para cópia.' });
        return;
    }
    const valor = inputElement.value;

    navigator.clipboard.writeText(valor).then(() => {
        if (feedbackElement) feedbackElement.textContent = 'Copiado!';
        buttonElement.innerHTML = '<i class="fas fa-check"></i>';
        buttonElement.classList.add('copied');
        inputElement.style.borderColor = 'var(--color-primary)';
        inputElement.style.boxShadow = '0 0 0 2px rgba(11, 102, 54, 0.2)';

        setTimeout(() => {
            if (feedbackElement) feedbackElement.textContent = '';
            buttonElement.innerHTML = originalButtonIconHTML;
            buttonElement.classList.remove('copied');
            inputElement.style.borderColor = '';
            inputElement.style.boxShadow = '';
        }, 2000);

    }).catch(err => {
        if (feedbackElement) feedbackElement.textContent = 'Erro ao copiar!';
        Swal.fire({ icon: 'error', title: 'Oops...', text: 'Não foi possível copiar. Tente manualmente.' });
        setTimeout(() => { if (feedbackElement) feedbackElement.textContent = ''; }, 2000);
    });
}

function copiarTextoConteudo(elementId, buttonElement) {
    const element = document.getElementById(elementId);
    const originalButtonIconHTML = buttonElement.innerHTML;
    let feedbackSpan = buttonElement.parentNode.querySelector('.fc-copied-feedback-item');

    if (!element) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Conteúdo não encontrado.' });
        return;
    }
    const valor = (element.textContent || element.innerText).trim();

    navigator.clipboard.writeText(valor).then(() => {
        if (!feedbackSpan) {
            feedbackSpan = document.createElement('span');
            feedbackSpan.className = 'fc-copied-feedback-item';
            // Insere o feedback após o botão de cópia
            buttonElement.parentNode.insertBefore(feedbackSpan, buttonElement.nextSibling);
        }
        feedbackSpan.textContent = 'Copiado!';
        feedbackSpan.style.display = 'inline';
        feedbackSpan.style.color = 'var(--color-primary)';
        feedbackSpan.style.marginLeft = '5px';
        feedbackSpan.style.fontWeight = 'bold';


        buttonElement.innerHTML = '<i class="fas fa-check"></i>';
        buttonElement.classList.add('copied');

        setTimeout(() => {
            feedbackSpan.textContent = '';
            feedbackSpan.style.display = 'none';
            buttonElement.innerHTML = originalButtonIconHTML;
            buttonElement.classList.remove('copied');
        }, 2000);

    }).catch(err => {
        if (feedbackSpan) {
            feedbackSpan.textContent = 'Erro!';
            feedbackSpan.style.color = 'red';
            feedbackSpan.style.display = 'inline';
        }
        Swal.fire({ icon: 'error', title: 'Oops...', text: 'Não foi possível copiar.'});
        setTimeout(() => { if (feedbackSpan) {
            feedbackSpan.textContent = '';
            feedbackSpan.style.display = 'none';
        } }, 2000);
    });
}