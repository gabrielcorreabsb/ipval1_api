package com.example.api_teste.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "configuracao_site")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracaoSite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nomeSite;

    private String descricao;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "favicon_url")
    private String faviconUrl;

    // Redes Sociais
    private String facebookUrl;
    private String instagramUrl;
    private String youtubeUrl;
    private String whatsapp;

    // Contato
    private String email;
    private String telefone;
    private String endereco;

    // Horários
    private String horarioFuncionamento;
    private String horarioCultos;

    @Column(columnDefinition = "TEXT")
    private String mensagemWhatsapp;

    @Column(columnDefinition = "TEXT")
    private String sobreIgreja;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        dataAtualizacao = LocalDateTime.now();
    }
}
