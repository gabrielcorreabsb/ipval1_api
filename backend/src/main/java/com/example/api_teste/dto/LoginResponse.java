package com.example.api_teste.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String token;
    private String type;
    private UserDTO user; // Certifique-se que este campo é UserDTO e não Usuario
}