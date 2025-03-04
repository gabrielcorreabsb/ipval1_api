package com.example.api_teste.dto;

import com.example.api_teste.model.Usuario;
import lombok.Data;
import com.example.api_teste.model.Cargo;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Integer idUsuario;
    private String login;
    private String nome;
    private LocalDateTime dataCriacao;
    private Boolean ativo;
    private Cargo cargo;

    public UserDTO(Usuario usuario) {
        this.idUsuario = usuario.getIdUsuario();
        this.login = usuario.getLogin();
        this.nome = usuario.getNome();
        this.dataCriacao = usuario.getDataCriacao();
        this.ativo = usuario.getAtivo();
        this.cargo = usuario.getCargo();
    }
}