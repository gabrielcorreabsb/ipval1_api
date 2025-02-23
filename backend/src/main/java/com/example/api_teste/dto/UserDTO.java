package com.example.api_teste.dto;

import com.example.api_teste.model.Usuario;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Integer idUsuario;
    private String login;
    private String nome;
    private LocalDateTime dataCriacao;
    private Boolean ativo;

    public UserDTO(Usuario usuario) {
        this.idUsuario = usuario.getIdUsuario();
        this.login = usuario.getLogin();
        this.nome = usuario.getNome();
        this.dataCriacao = usuario.getDataCriacao();
        this.ativo = usuario.getAtivo();
    }
}