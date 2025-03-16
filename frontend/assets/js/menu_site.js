/**
 * Menu Hamburguer e Navegação Mobile
 * Este arquivo contém as funcionalidades relacionadas ao menu mobile
 * e navegação responsiva do site.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Menu mobile - Botão hamburguer
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            navList.classList.toggle('active');
        });
    }

    // Fechar menu ao clicar em um link
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
        });
    });

    // Menu de navegação âncora - destacar item ativo ao rolar
    const sections = document.querySelectorAll('section[id]');
    const anchorLinks = document.querySelectorAll('.anchor-links a');

    if (sections.length > 0 && anchorLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;

                if (pageYOffset >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });

            anchorLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').substring(1) === current) {
                    link.classList.add('active');
                }
            });
        });
    }
});