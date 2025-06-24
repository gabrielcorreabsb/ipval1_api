package com.example.api_teste.model; // Certifique-se que o pacote está correto

import com.example.api_teste.model.enums.TipoItemLiturgia;
import com.example.api_teste.model.enums.LivroBiblia;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString; // Adicionado para @ToString.Exclude

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "itens_liturgia")
public class ItemLiturgia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ToString.Exclude // Recomendado para evitar problemas com LAZY loading e toString de Lombok
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "liturgia_id", nullable = false)
    private Liturgia liturgia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoItemLiturgia tipo;

    @Column(nullable = false)
    private Integer ordem;

    @Lob
    @Column(name = "conteudo_textual")
    private String conteudoTextual;

    @Enumerated(EnumType.STRING)
    @Column(name = "livro_biblia")
    private LivroBiblia livroBiblia;

    @Column(name = "capitulo_biblia")
    private Integer capituloBiblia;

    @Column(name = "versiculo_inicio_biblia")
    private Integer versiculoInicioBiblia;

    @Column(name = "versiculo_fim_biblia")
    private Integer versiculoFimBiblia;

    @Column(name = "referencia_display_formatada")
    private String referenciaDisplayFormatada;
}