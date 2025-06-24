package com.example.api_teste.dto; // Certifique-se que o pacote está correto

import com.example.api_teste.model.ItemLiturgia;
import com.example.api_teste.model.Liturgia;
import com.example.api_teste.model.enums.VersaoBibliaUtilizada;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList; // Adicionado para o caso de precisar no toEntity, mas não é o foco principal da correção
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiturgiaDTO {

    private Long id;

    @NotBlank(message = "O título da liturgia é obrigatório.")
    private String titulo;

    @NotNull(message = "A data da liturgia é obrigatória.")
    private LocalDate data;

    private String descricao;

    @NotNull(message = "A versão da Bíblia padrão é obrigatória.")
    private VersaoBibliaUtilizada versaoBibliaPadrao;

    @Valid
    @NotEmpty(message = "A liturgia deve conter pelo menos um item.")
    private List<ItemLiturgiaDTO> itens = new ArrayList<>(); // Inicializado como lista vazia

    // --- Mapeamento ---
    public static LiturgiaDTO fromEntity(Liturgia liturgia) {
        return LiturgiaDTO.builder()
                .id(liturgia.getId())
                .titulo(liturgia.getTitulo())
                .data(liturgia.getData())
                .descricao(liturgia.getDescricao())
                .versaoBibliaPadrao(liturgia.getVersaoBibliaPadrao())
                .itens(liturgia.getItens().stream() // Isso agora é seguro, pois liturgia.getItens() não será null
                        .map(ItemLiturgiaDTO::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }

    public Liturgia toEntity() {
        Liturgia liturgia = Liturgia.builder()
                .id(this.id)
                .titulo(this.titulo)
                .data(this.data)
                .descricao(this.descricao)
                .versaoBibliaPadrao(this.versaoBibliaPadrao)
                .build();

        // Mapear itens
        for (ItemLiturgiaDTO itemDTO : this.itens) {
            ItemLiturgia itemEntidade = itemDTO.toEntity();
            liturgia.addItem(itemEntidade);
        }

        return liturgia;
    }
}