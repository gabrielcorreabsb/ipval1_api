package com.example.api_teste.dto;

import lombok.Data;
import java.time.LocalDateTime;
import lombok.Builder;


@Data
@Builder
public class ConfiguracaoSiteDTO {
    private Integer id;
    private String nomeSite;
    private String descricao;
    private String logoUrl;
    private String faviconUrl;
    private String facebookUrl;
    private String instagramUrl;
    private String youtubeUrl;
    private String whatsapp;
    private String email;
    private String telefone;
    private String endereco;
    private String horarioFuncionamento;
    private String horarioCultos;
    private String sobreIgreja;
    private LocalDateTime dataAtualizacao;
    private String mensagemWhatsapp;
}