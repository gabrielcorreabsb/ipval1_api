// Configurações globais da aplicação
const CONFIG = {
    //API_URL: 'http://localhost:8080/api',
      API_URL: 'https://ipv1.org.br/api',
    INSTAGRAM: {
        ACCESS_TOKEN: 'IGAAQFNP5w71lBZAFA2a3F3ZAU5Pc21SMkVxMEhyTDVPYmJvWEQwUkZAKMWdMRVBaRmp2c09yaGxZAR1pkTHFlR2M2WUYzeTMxUmdkSFpEUm5maFdyQU11UlZA2ZAHM4bzk5dXNlY0NtcGdWTWxORnBxLVM1cHZAZAakprZA3d1MDBmUTFmVQZDZD'
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