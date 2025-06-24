package com.example.api_teste.model.enums;

public enum VersaoBibliaUtilizada {
    ARA("ra", "Almeida Revista e Atualizada"),
    NVI("nvi", "Nova Versão Internacional");

    private final String siglaApi;
    private final String nomeCompleto;

    VersaoBibliaUtilizada(String siglaApi, String nomeCompleto) {
        this.siglaApi = siglaApi;
        this.nomeCompleto = nomeCompleto;
    }

    public String getSiglaApi() {
        return siglaApi;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    // Para conversão de string (opcional, mas útil para DTOs se não usar o nome do Enum diretamente)
    public static VersaoBibliaUtilizada fromSiglaApi(String sigla) {
        for (VersaoBibliaUtilizada v : values()) {
            if (v.siglaApi.equalsIgnoreCase(sigla)) {
                return v;
            }
        }

        throw new IllegalArgumentException("Sigla da API inválida para VersaoBibliaUtilizada: " + sigla);
    }
}