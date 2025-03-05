package com.example.api_teste.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "noticias")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Noticia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "O título é obrigatório")
    private String titulo;

    @NotBlank(message = "O conteúdo é obrigatório")
    @Column(columnDefinition = "TEXT")
    private String conteudo;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    private boolean aprovada;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario autor;

    @Column(columnDefinition = "TEXT")
    private String imagemUrl;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
    }
}