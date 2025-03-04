package com.example.api_teste.securingweb;

import com.example.api_teste.repository.IUsuario;
import com.example.api_teste.model.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.ArrayList;
import java.util.List;

import java.util.Collections;

@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {

    private final IUsuario usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(CustomAuthenticationProvider.class);

    public CustomAuthenticationProvider(IUsuario usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String login = authentication.getName();
        String senha = authentication.getCredentials().toString();

        logger.debug("Tentativa de autenticação para usuário: {}", login);

        try {
            Usuario usuario = usuarioRepository.findByLogin(login)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + login));

            logger.debug("Usuário encontrado: {}", usuario.getLogin());
            logger.debug("Cargo do usuário: {}", usuario.getCargo());

            if (!usuario.isAtivo()) {
                logger.debug("Usuário está inativo: {}", login);
                throw new DisabledException("Usuário está desativado");
            }

            if (!passwordEncoder.matches(senha, usuario.getSenha())) {
                logger.debug("Senha inválida para usuário: {}", login);
                throw new BadCredentialsException("Senha inválida");
            }

            // Criar lista de autoridades baseada no cargo do usuário
            List<GrantedAuthority> authorities = new ArrayList<>();

            // Adicionar ROLE baseada no cargo
            authorities.add(new SimpleGrantedAuthority("ROLE_" + usuario.getCargo().toString()));

            // Opcional: adicionar também uma role genérica USER
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

            logger.debug("Autoridades atribuídas: {}", authorities);
            logger.debug("Autenticação bem-sucedida para usuário: {}", login);

            return new UsernamePasswordAuthenticationToken(
                    usuario,
                    senha,
                    authorities
            );
        } catch (Exception e) {
            logger.error("Erro durante autenticação: ", e);
            throw e;
        }
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
}