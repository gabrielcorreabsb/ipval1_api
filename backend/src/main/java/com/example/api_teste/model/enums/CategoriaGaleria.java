package com.example.api_teste.model.enums;


public enum CategoriaGaleria {
    IGREJA("Igreja"),
    UPH("UPH - União Presbiteriana de Homens"),
    SAF("SAF - Sociedade Auxiliadora Feminina"),
    UMP_UPA("UMP/UPA - Mocidade e Adolescentes"),
    UCP("UCP - União de Crianças Presbiterianas");

    private final String descricao;

    CategoriaGaleria(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}