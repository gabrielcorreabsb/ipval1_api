package com.example.api_teste.securingweb;

import com.example.api_teste.repository.IUsuario;
import com.example.api_teste.model.Usuario;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class CustomAuthenticationProvider implements AuthenticationProvider {
    private final IUsuario usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomAuthenticationProvider(IUsuario usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String login = authentication.getName();         // Pega o valor do campo "login"
        String senha = authentication.getCredentials().toString();  // Pega o valor do campo "senha"

        // Busca o usuário no banco
        Usuario usuario = usuarioRepository.findByLogin(login)
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        // Verifica se a senha está correta
        if (!passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new BadCredentialsException("Senha inválida");
        }

        // Se chegou aqui, autenticação foi bem sucedida
        return new UsernamePasswordAuthenticationToken(
            usuario,
            senha,
            Collections.emptyList()  // adicionar as roles/authorities
        );
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
}