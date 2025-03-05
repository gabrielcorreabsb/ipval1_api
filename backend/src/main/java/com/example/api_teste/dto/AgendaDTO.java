package com.example.api_teste.dto;


import lombok.Data;
import com.example.api_teste.model.Agenda;

import java.time.LocalDateTime;

@Data
public class AgendaDTO {
    private Long id;
    private String titulo;
    private String descricao;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private String localEvento;
    private Integer usuarioId;
    private String usuarioNome;
    private LocalDateTime dataCriacao;

    public AgendaDTO(Agenda agenda) {
        this.id = (long) agenda.getId();
        this.titulo = agenda.getTitulo();
        this.descricao = agenda.getDescricao();
        this.dataInicio = agenda.getDataInicio();
        this.dataFim = agenda.getDataFim();
        this.localEvento = agenda.getLocalEvento();
        if (agenda.getUsuario() != null) {
            this.usuarioId = agenda.getUsuario().getIdUsuario();
            this.usuarioNome = agenda.getUsuario().getNome();
        }
        this.dataCriacao = agenda.getDataCriacao();
    }
}