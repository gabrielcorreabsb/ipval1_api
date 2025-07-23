// assets/js/plano-leitura.js

// Plano de Leitura Anual Sequencial (4 capítulos/dia)
// Cada elemento do array representa um dia do ano (índice 0 = Dia 1)
// Cada dia tem um array de objetos: { book: "abrev_pt", chapter: num }
const PLANO_LEITURA_2025 = [
    // Dia 1 (1 de Jan)
    [{book: "gn", chapter: 1}, {book: "gn", chapter: 2}, {book: "gn", chapter: 3}, {book: "gn", chapter: 4}],
    // Dia 2 (2 de Jan)
    [{book: "gn", chapter: 5}, {book: "gn", chapter: 6}, {book: "gn", chapter: 7}, {book: "gn", chapter: 8}],
    // ... e assim por diante.
    // Gerar este array completo para 365 dias seria muito longo para colocar aqui.
    // VAMOS GERAR DINAMICAMENTE NO CÓDIGO UMA ÚNICA VEZ para simplificar.
];

// Função para gerar o plano de leitura sequencial dinamicamente
function gerarPlanoLeituraSequencial(livros, capitulosPorDia) {
    if (PLANO_LEITURA_2025.length > 0) return PLANO_LEITURA_2025; // Se já foi gerado

    let plano = [];
    let capitulosDoDia = [];
    let livroAtualIndex = 0;
    let capituloAtual = 1;

    for (let dia = 1; dia <= 366; dia++) { // Gerar para 366 dias para cobrir anos bissextos
        capitulosDoDia = [];
        for (let i = 0; i < capitulosPorDia; i++) {
            if (livroAtualIndex < livros.length) {
                const livro = livros[livroAtualIndex];
                capitulosDoDia.push({ book: livro.abbrev.pt, chapter: capituloAtual, bookName: livro.name });

                capituloAtual++;
                if (capituloAtual > livro.chapters) {
                    livroAtualIndex++;
                    capituloAtual = 1;
                }
            } else {
                // Adiciona um placeholder se o plano acabar antes do fim do ano
                capitulosDoDia.push({ book: "Fim", chapter: 0, bookName: "Fim da Leitura" });
            }
        }
        plano.push(capitulosDoDia);
    }
    // Cacheia o plano gerado
    PLANO_LEITURA_2025.push(...plano);
    return PLANO_LEITURA_2025;
}