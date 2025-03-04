// Variável global para armazenar os projetos
let projetos = [];

// Verificar autenticação e configurar eventos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    if (!AuthService.isAuthenticated()) {
        window.location.replace('./login.html');
        return;
    }
    document.addEventListener('DOMContentLoaded', function () {
        // Carrega os projetos imediatamente
        carregarProjetos();

        // Tenta carregar as informações do usuário se estiver logado
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                document.getElementById('userName').textContent = user.nome;
            }
        } catch (error) {
            console.log('Usuário não está logado');
            document.getElementById('userName').textContent = 'Visitante';
        }
    });

// Configurar botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await AuthService.logout();
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                mostrarMensagem('Erro ao fazer logout', 'error');
            }
        });
// Carregar nome do usuário
        const user = AuthService.getUser();
        if (user) {
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = user.nome;
            }
        }
}
});


