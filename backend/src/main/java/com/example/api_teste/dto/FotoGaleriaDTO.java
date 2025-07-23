// src/main/java/com/example/api_teste/dto/FotoGaleriaDTO.java
package com.example.api_teste.dto;

import com.example.api_teste.model.FotoGaleria;
import com.example.api_teste.model.enums.CategoriaGaleria;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FotoGaleriaDTO {

    private Long id;
    private String url;
    private String descricao;
    private CategoriaGaleria categoria;
    private LocalDateTime dataUpload;
    private String nomeUsuarioUpload; // Para exibir quem fez o upload

    public static FotoGaleriaDTO fromEntity(FotoGaleria foto) {
        return FotoGaleriaDTO.builder()
                .id(foto.getId())
                .url(foto.getUrl())
                .descricao(foto.getDescricao())
                .categoria(foto.getCategoria())
                .dataUpload(foto.getDataUpload())
                .nomeUsuarioUpload(foto.getUsuario() != null ? foto.getUsuario().getNome() : "Desconhecido")
                .build();
    }

    // toEntity será tratado no serviço, pois precisa do MultipartFile e do usuário
}