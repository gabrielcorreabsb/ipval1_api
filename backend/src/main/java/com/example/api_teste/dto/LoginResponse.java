package com.example.api_teste.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginResponse {
    private String token;
    private String type;
    private UserDTO user;

    public LoginResponse(String token, String type, UserDTO user) {
        this.token = token;
        this.type = type;
        this.user = user;
    }
}