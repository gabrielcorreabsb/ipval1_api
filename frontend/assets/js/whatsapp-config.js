// Criar um arquivo whatsapp-service.js
const WhatsAppService = {
    numero: null,
    callbacks: [],

    async carregar() {
        // Se já temos o número, retornar imediatamente
        if (this.numero) {
            return this.numero;
        }

        // Verificar no localStorage primeiro (para carregamento rápido)
        const numeroSalvo = localStorage.getItem('whatsappNumero');
        if (numeroSalvo) {
            this.numero = numeroSalvo;
            this.notificarCallbacks();
            return this.numero;
        }

        // Carregar da API
        try {
            const response = await fetch(`${CONFIG.API_URL}/configuracoes`);
            if (!response.ok) throw new Error('Erro ao carregar configurações');

            const config = await response.json();
            if (config.whatsapp) {
                // Processar o número
                this.numero = config.whatsapp.replace(/\D/g, '');
                if (!this.numero.startsWith('55')) {
                    this.numero = '55' + this.numero;
                }

                // Salvar no localStorage
                localStorage.setItem('whatsappNumero', this.numero);

                // Notificar callbacks
                this.notificarCallbacks();

                return this.numero;
            }
        } catch (error) {
            console.error('Erro ao carregar WhatsApp:', error);
            return null;
        }
    },

    onCarregado(callback) {
        if (this.numero) {
            // Se já temos o número, executar o callback imediatamente
            callback(this.numero);
        } else {
            // Caso contrário, adicionar à lista de callbacks
            this.callbacks.push(callback);
        }
    },

    notificarCallbacks() {
        this.callbacks.forEach(callback => callback(this.numero));
        this.callbacks = []; // Limpar após notificar
    }
};

// Iniciar o carregamento imediatamente
WhatsAppService.carregar();

// Exportar para uso global
window.WhatsAppService = WhatsAppService;