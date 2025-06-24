package com.example.api_teste.model.enums;

public enum TestamentoBiblico {
    VT("Velho Testamento"),
    NT("Novo Testamento");

    private final String descricao;

    TestamentoBiblico(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}