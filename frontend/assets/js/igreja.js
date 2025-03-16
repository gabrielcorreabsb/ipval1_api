// ../assets/js/igreja.js
// Funções de utilidade
async function fazerRequisicao(url, options = {}) {
    try {
        // Se for uma requisição GET, não precisa de token
        if (!options.method || options.method === 'GET') {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            return response;
        }

        // Para outros métodos (POST, PUT, DELETE)
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }

        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const mergedOptions = {
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };

        const response = await fetch(url, mergedOptions);

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.replace('./login.html');
            return null;
        }

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

async function carregarSobreNos() {
    try {
        const response = await fazerRequisicao(`${CONFIG.API_URL}/configuracoes`);
        const config = await response.json();

        const sobreIgrejaElement = document.getElementById('sobreIgrejaContent');
        if (sobreIgrejaElement && config.sobreIgreja) {
            // Dividir o texto em parágrafos e criar elementos HTML
            const paragrafos = config.sobreIgreja.split('\n').filter(p => p.trim());
            sobreIgrejaElement.innerHTML = paragrafos
                .map(paragrafo => `<p>${paragrafo}</p>`)
                .join('');
        }
    } catch (error) {
        console.error('Erro ao carregar informações sobre a igreja:', error);
        mostrarMensagem('Erro ao carregar informações sobre a igreja', 'error');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    carregarSobreNos();
});