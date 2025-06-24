package com.example.api_teste.model.enums;

public enum LivroBiblia {
    // Velho Testamento
    GENESIS("Gênesis", "gn", 50, TestamentoBiblico.VT, "Pentateuco"),
    EXODO("Êxodo", "ex", 40, TestamentoBiblico.VT, "Pentateuco"),
    LEVITICO("Levítico", "lv", 27, TestamentoBiblico.VT, "Pentateuco"),
    NUMEROS("Números", "nm", 36, TestamentoBiblico.VT, "Pentateuco"),
    DEUTERONOMIO("Deuteronômio", "dt", 34, TestamentoBiblico.VT, "Pentateuco"),
    JOSUE("Josué", "js", 24, TestamentoBiblico.VT, "Históricos"),
    JUIZES("Juízes", "jz", 21, TestamentoBiblico.VT, "Históricos"),
    RUTE("Rute", "rt", 4, TestamentoBiblico.VT, "Históricos"),
    PRIMEIRO_SAMUEL("1º Samuel", "1sm", 31, TestamentoBiblico.VT, "Históricos"),
    SEGUNDO_SAMUEL("2º Samuel", "2sm", 24, TestamentoBiblico.VT, "Históricos"),
    PRIMEIRO_REIS("1º Reis", "1rs", 22, TestamentoBiblico.VT, "Históricos"),
    SEGUNDO_REIS("2º Reis", "2rs", 25, TestamentoBiblico.VT, "Históricos"),
    PRIMEIRO_CRONICAS("1º Crônicas", "1cr", 29, TestamentoBiblico.VT, "Históricos"),
    SEGUNDO_CRONICAS("2º Crônicas", "2cr", 36, TestamentoBiblico.VT, "Históricos"),
    ESDRAS("Esdras", "ed", 10, TestamentoBiblico.VT, "Históricos"),
    NEEMIAS("Neemias", "ne", 13, TestamentoBiblico.VT, "Históricos"),
    ESTER("Ester", "et", 10, TestamentoBiblico.VT, "Históricos"),
    JO_VT("Jó", "job", 42, TestamentoBiblico.VT, "Poéticos"), // Renomeado para evitar conflito com JOAO do NT
    SALMOS("Salmos", "sl", 150, TestamentoBiblico.VT, "Poéticos"),
    PROVERBIOS("Provérbios", "pv", 31, TestamentoBiblico.VT, "Poéticos"),
    ECLESIASTES("Eclesiastes", "ec", 12, TestamentoBiblico.VT, "Poéticos"),
    CANTICOS("Cânticos", "ct", 8, TestamentoBiblico.VT, "Poéticos"),
    ISAIAS("Isaías", "is", 66, TestamentoBiblico.VT, "Profetas maiores"),
    JEREMIAS("Jeremias", "jr", 52, TestamentoBiblico.VT, "Profetas maiores"),
    LAMENTACOES("Lamentações de Jeremias", "lm", 5, TestamentoBiblico.VT, "Profetas maiores"),
    EZEQUIEL("Ezequiel", "ez", 48, TestamentoBiblico.VT, "Profetas maiores"),
    DANIEL("Daniel", "dn", 12, TestamentoBiblico.VT, "Profetas maiores"),
    OSEIAS("Oséias", "os", 14, TestamentoBiblico.VT, "Profetas menores"),
    JOEL("Joel", "jl", 3, TestamentoBiblico.VT, "Profetas menores"),
    AMOS("Amós", "am", 9, TestamentoBiblico.VT, "Profetas menores"),
    OBADIAS("Obadias", "ob", 1, TestamentoBiblico.VT, "Profetas menores"),
    JONAS("Jonas", "jn", 4, TestamentoBiblico.VT, "Profetas menores"),
    MIQUEIAS("Miquéias", "mq", 7, TestamentoBiblico.VT, "Profetas menores"),
    NAUM("Naum", "na", 3, TestamentoBiblico.VT, "Profetas menores"),
    HABACUQUE("Habacuque", "hc", 3, TestamentoBiblico.VT, "Profetas menores"),
    SOFONIAS("Sofonias", "sf", 3, TestamentoBiblico.VT, "Profetas menores"),
    AGEU("Ageu", "ag", 2, TestamentoBiblico.VT, "Profetas menores"),
    ZACARIAS("Zacarias", "zc", 14, TestamentoBiblico.VT, "Profetas menores"),
    MALAQUIAS("Malaquias", "ml", 4, TestamentoBiblico.VT, "Profetas menores"),

    // Novo Testamento
    MATEUS("Mateus", "mt", 28, TestamentoBiblico.NT, "Evangelhos"),
    MARCOS("Marcos", "mc", 16, TestamentoBiblico.NT, "Evangelhos"),
    LUCAS("Lucas", "lc", 24, TestamentoBiblico.NT, "Evangelhos"),
    JOAO("João", "jo", 21, TestamentoBiblico.NT, "Evangelhos"),
    ATOS("Atos", "at", 28, TestamentoBiblico.NT, "Histórico"),
    ROMANOS("Romanos", "rm", 16, TestamentoBiblico.NT, "Cartas"),
    PRIMEIRA_CORINTIOS("1ª Coríntios", "1co", 16, TestamentoBiblico.NT, "Cartas"),
    SEGUNDA_CORINTIOS("2ª Coríntios", "2co", 13, TestamentoBiblico.NT, "Cartas"),
    GALATAS("Gálatas", "gl", 6, TestamentoBiblico.NT, "Cartas"),
    EFESIOS("Efésios", "ef", 6, TestamentoBiblico.NT, "Cartas"),
    FILIPENSES("Filipenses", "fp", 4, TestamentoBiblico.NT, "Cartas"),
    COLOSSENSES("Colossenses", "cl", 4, TestamentoBiblico.NT, "Cartas"),
    PRIMEIRA_TESSALONICENSES("1ª Tessalonicenses", "1ts", 5, TestamentoBiblico.NT, "Cartas"),
    SEGUNDA_TESSALONICENSES("2ª Tessalonicenses", "2ts", 3, TestamentoBiblico.NT, "Cartas"),
    PRIMEIRA_TIMOTEO("1ª Timóteo", "1tm", 6, TestamentoBiblico.NT, "Cartas"),
    SEGUNDA_TIMOTEO("2ª Timóteo", "2tm", 4, TestamentoBiblico.NT, "Cartas"),
    TITO("Tito", "tt", 3, TestamentoBiblico.NT, "Cartas"),
    FILEMOM("Filemom", "fm", 1, TestamentoBiblico.NT, "Cartas"),
    HEBREUS("Hebreus", "hb", 13, TestamentoBiblico.NT, "Cartas"),
    TIAGO("Tiago", "tg", 5, TestamentoBiblico.NT, "Cartas"),
    PRIMEIRA_PEDRO("1ª Pedro", "1pe", 5, TestamentoBiblico.NT, "Cartas"),
    SEGUNDA_PEDRO("2ª Pedro", "2pe", 3, TestamentoBiblico.NT, "Cartas"),
    PRIMEIRA_JOAO("1ª João", "1jo", 5, TestamentoBiblico.NT, "Cartas"),
    SEGUNDA_JOAO("2ª João", "2jo", 1, TestamentoBiblico.NT, "Cartas"),
    TERCEIRA_JOAO("3ª João", "3jo", 1, TestamentoBiblico.NT, "Cartas"),
    JUDAS("Judas", "jd", 1, TestamentoBiblico.NT, "Cartas"),
    APOCALIPSE("Apocalipse", "ap", 22, TestamentoBiblico.NT, "Revelações");

    private final String nomeCompleto;
    private final String abrevPtApi;
    private final int totalCapitulos;
    private final TestamentoBiblico testamento;
    private final String grupo;

    LivroBiblia(String nomeCompleto, String abrevPtApi, int totalCapitulos, TestamentoBiblico testamento, String grupo) {
        this.nomeCompleto = nomeCompleto;
        this.abrevPtApi = abrevPtApi;
        this.totalCapitulos = totalCapitulos;
        this.testamento = testamento;
        this.grupo = grupo;
    }

    public String getNomeCompleto() { return nomeCompleto; }
    public String getAbrevPtApi() { return abrevPtApi; }
    public int getTotalCapitulos() { return totalCapitulos; }
    public TestamentoBiblico getTestamento() { return testamento; }
    public String getGrupo() { return grupo; }

    public static LivroBiblia fromAbrevPtApi(String abrevPtApi) {
        for (LivroBiblia livro : values()) {
            if (livro.abrevPtApi.equalsIgnoreCase(abrevPtApi)) {
                return livro;
            }
        }
        throw new IllegalArgumentException("Nenhum livro da Bíblia encontrado para a abreviação da API: " + abrevPtApi);
    }
}