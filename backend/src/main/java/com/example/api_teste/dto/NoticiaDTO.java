package com.example.api_teste.dto;

import com.example.api_teste.model.Noticia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticiaDTO {
    private Integer id;
    private String titulo;
    private String conteudo;
    private LocalDateTime dataCriacao;
    private boolean aprovada;
    private String autorNome;
    private Integer autorId;

    public NoticiaDTO(Noticia noticia) {
        this.id = noticia.getId();
        this.titulo = noticia.getTitulo();
        this.conteudo = noticia.getConteudo();
        this.dataCriacao = noticia.getDataCriacao();
        this.aprovada = noticia.isAprovada();
        if (noticia.getAutor() != null) {
            this.autorNome = noticia.getAutor().getNome();
            this.autorId = noticia.getAutor().getIdUsuario();
        }
    }

    public static NoticiaDTO fromEntity(Noticia noticia) {
        return new NoticiaDTO(noticia);
    }
}