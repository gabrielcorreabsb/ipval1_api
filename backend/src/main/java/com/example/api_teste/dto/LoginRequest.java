package com.example.api_teste.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String login;
    private String senha;
}