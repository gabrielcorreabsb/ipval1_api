class Menu {
    constructor() {
        this.menuToggle = document.querySelector('.menu-toggle');
        this.menuContainer = document.querySelector('.menu-container');
        this.navLinks = document.querySelectorAll('.nav-menu a');

        this.init();
    }

    init() {
        this.addToggleListener();
        this.addLinksListener();
        this.addOutsideClickListener();
    }

    addToggleListener() {
        this.menuToggle.addEventListener('click', () => {
            this.toggleMenu();
        });
    }

    addLinksListener() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });
    }

    addOutsideClickListener() {
        document.addEventListener('click', (e) => {
            if (this.menuContainer.classList.contains('active') &&
                !this.menuContainer.contains(e.target) &&
                !this.menuToggle.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.menuToggle.classList.toggle('active');
        this.menuContainer.classList.toggle('active');
    }

    closeMenu() {
        this.menuToggle.classList.remove('active');
        this.menuContainer.classList.remove('active');
    }
}

// Inicializar o menu quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new Menu();
});