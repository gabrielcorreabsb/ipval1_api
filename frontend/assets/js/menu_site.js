/**
 * menu_site.js
 *
 * Funcionalidades:
 * - Menu Hamburguer e Navegação Mobile
 * - Menu Dropdown "Igreja" (Mobile)
 * - Destaque do item de menu âncora ativo ao rolar (se houver)
 */
document.addEventListener('DOMContentLoaded', function() {
    // --- Menu Hamburguer e Mobile ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');

    if (mobileMenuBtn && navList) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            navList.classList.toggle('active');
        });

        // Fechar menu mobile ao clicar em links (EXCETO no item 'Igreja' com dropdown)
        const navLinks = document.querySelectorAll('.nav-list a');
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                if (!link.parentElement.classList.contains('menu-item-has-children')) {
                    navList.classList.remove('active');
                    mobileMenuBtn.classList.remove('active'); // Garante que o botão hamburguer também seja desativado
                } else {
                    event.preventDefault(); // Impede que o link "Igreja" siga o href (se houver)
                }
            });
        });
    } else {
    }


    // --- Menu Dropdown "Igreja" e "Recursos" (Mobile) ---
    const menuItemsWithChildren = document.querySelectorAll('.menu-item-has-children > a'); // Use querySelectorAll
    menuItemsWithChildren.forEach(menuItem => { // Itere sobre cada item de menu com dropdown
        const subMenu = menuItem.nextElementSibling; // Seleciona o subMenu *relativo a este menuItem*

        if (subMenu) {
            menuItem.addEventListener('click', function(event) {
                if (window.innerWidth <= 768) {
                    event.preventDefault();
                    subMenu.classList.toggle('active');

                    // Rotaciona o ícone apenas no dropdown clicado
                    const dropdownIcon = this.querySelector('.dropdown-icon');
                    if (dropdownIcon) {
                        dropdownIcon.classList.toggle('rotated');
                    }

                    // Fecha outros dropdowns abertos (opcional, se quiser apenas um dropdown aberto por vez)
                    menuItemsWithChildren.forEach(otherMenuItem => {
                        if (otherMenuItem !== menuItem) { // Evita fechar o dropdown atual
                            const otherSubMenu = otherMenuItem.nextElementSibling;
                            if (otherSubMenu && otherSubMenu.classList.contains('active')) {
                                otherSubMenu.classList.remove('active');
                                const otherDropdownIcon = otherMenuItem.querySelector('.dropdown-icon');
                                if (otherDropdownIcon) {
                                    otherDropdownIcon.classList.remove('rotated');
                                }
                            }
                        }
                    });
                }
            });
        }
    });

});