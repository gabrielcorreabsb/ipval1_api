package com.example.api_teste.dto;

import com.example.api_teste.model.Membro;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembroDTO {
    private Long id;
    private String nome;
    private String telefone;
    private String endereco;
    private LocalDate dataNascimento;

    public static MembroDTO fromEntity(Membro membro) {
        return MembroDTO.builder()
                .id(membro.getId())
                .nome(membro.getNome())
                .telefone(membro.getTelefone())
                .endereco(membro.getEndereco())
                .dataNascimento(membro.getDataNascimento())
                .build();
    }

    public Membro toEntity() {
        return Membro.builder()
                .id(this.id)
                .nome(this.nome)
                .telefone(this.telefone)
                .endereco(this.endereco)
                .dataNascimento(this.dataNascimento)
                .build();
    }
}
