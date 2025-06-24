package com.example.api_teste.model;

import com.example.api_teste.model.enums.VersaoBibliaUtilizada;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "liturgias")
public class Liturgia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false)
    private LocalDate data;

    @Lob
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "versao_biblia_padrao", nullable = false)
    private VersaoBibliaUtilizada versaoBibliaPadrao;

    @ToString.Exclude
    @OneToMany(
            mappedBy = "liturgia",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @OrderBy("ordem ASC")
    @Builder.Default // Garante que o builder respeite a inicialização
    private List<ItemLiturgia> itens = new ArrayList<>();

    public void addItem(ItemLiturgia item) {
        this.itens.add(item); // Linha 53, agora segura
        item.setLiturgia(this);
    }

    public void removeItem(ItemLiturgia item) {
        this.itens.remove(item);
        item.setLiturgia(null);
    }
}