// Configurações globais da aplicação
const CONFIG = {
    API_URL: 'http://localhost:8080/api',
    //  API_URL: 'https://ipv1.org.br/api',
    INSTAGRAM: {
        ACCESS_TOKEN: 'IGAAQFNP5w71lBZAE5HWHFpU3NhcmV2UmgwZAy1KcTRYSkh0aXZAzdVpkWkptQk5IS1RHcHc3VlBMekJtNUh4dkFRVEdQekpFWEpkbk84VU8xRzJnSXRXWVRaM2FDWEhwdEcyMl9teEhhelVKbzZAmQzRXbTZAwcV94WWM3Ymp2U2piYwZDZD'
    },
    DEBUG: false // Controle de logs
};

// Desabilitar todos os logs em produção
if (!CONFIG.DEBUG) {
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.debug = () => {};
}

// Ano no rodapé
document.getElementById("anoRodape").textContent = new Date().getFullYear();