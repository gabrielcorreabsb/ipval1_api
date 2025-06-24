package com.example.api_teste.dto;

import com.example.api_teste.model.ItemLiturgia;
import com.example.api_teste.model.enums.TipoItemLiturgia;
import com.example.api_teste.model.enums.LivroBiblia;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemLiturgiaDTO {

    private Long id;

    @NotNull(message = "O tipo do item é obrigatório.")
    private TipoItemLiturgia tipo;

    @NotNull(message = "A ordem do item é obrigatória.")
    private Integer ordem;

    private String conteudoTextual;

    private LivroBiblia livroBiblia;

    private Integer capituloBiblia;

    private Integer versiculoInicioBiblia;

    private Integer versiculoFimBiblia;

    private String referenciaDisplayFormatada;

    public static ItemLiturgiaDTO fromEntity(ItemLiturgia item) {
        if (item == null) {
            return null; // Ou lançar uma exceção, dependendo do caso
        }
        return ItemLiturgiaDTO.builder()
                .id(item.getId())
                .tipo(item.getTipo())
                .ordem(item.getOrdem())
                .conteudoTextual(item.getConteudoTextual())
                .livroBiblia(item.getLivroBiblia())
                .capituloBiblia(item.getCapituloBiblia())
                .versiculoInicioBiblia(item.getVersiculoInicioBiblia())
                .versiculoFimBiblia(item.getVersiculoFimBiblia())
                .referenciaDisplayFormatada(item.getReferenciaDisplayFormatada())
                .build();
    }

    public ItemLiturgia toEntity() {
        return ItemLiturgia.builder()
                .id(this.id)
                .tipo(this.tipo)
                .ordem(this.ordem)
                .conteudoTextual(this.conteudoTextual)
                .livroBiblia(this.livroBiblia)
                .capituloBiblia(this.capituloBiblia)
                .versiculoInicioBiblia(this.versiculoInicioBiblia)
                .versiculoFimBiblia(this.versiculoFimBiblia)
                .referenciaDisplayFormatada(this.referenciaDisplayFormatada)
                .build();
    }
}