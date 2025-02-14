package com.example.api_teste.service;

import com.example.api_teste.model.Usuario;
import com.example.api_teste.repository.IUsuario;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UsuarioService {

    private final IUsuario repository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UsuarioService(IUsuario repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> listarUsuario() {
        log.info("Listando todos os usuários");
        return repository.findAll();
    }

    public Usuario criarUsuario(Usuario usuario) {
        log.info("Criando novo usuário com login: {}", usuario.getLogin());
        
        if (usuario == null) {
            throw new IllegalArgumentException("Usuário não pode ser nulo");
        }

        if (repository.existsByLogin(usuario.getLogin())) {
            throw new RuntimeException("Login já existe");
        }

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        usuario.setDataCriacao(LocalDateTime.now());
        
        return repository.save(usuario);
    }

    public Usuario editarUsuario(Usuario usuario) {
        log.info("Editando usuário com ID: {}", usuario.getIdUsuario());
        
        if (!repository.existsById(usuario.getIdUsuario())) {
            throw new RuntimeException("Usuário não encontrado");
        }

        if (repository.existsByLoginAndIdUsuarioNot(usuario.getLogin(), usuario.getIdUsuario())) {
            throw new RuntimeException("Login já existe para outro usuário");
        }

        Optional<Usuario> usuarioExistente = repository.findById(usuario.getIdUsuario());
        if (usuarioExistente.isPresent()) {
            Usuario usuarioAtual = usuarioExistente.get();
            
            if (usuario.getSenha() == null || usuario.getSenha().isEmpty()) {
                usuario.setSenha(usuarioAtual.getSenha());
            } else {
                usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
            }
        }

        return repository.save(usuario);
    }

    public Boolean excluirUsuario(Integer idUsuario) {
        log.info("Excluindo usuário com ID: {}", idUsuario);
        
        if (!repository.existsById(idUsuario)) {
            throw new RuntimeException("Usuário não encontrado");
        }
        repository.deleteById(idUsuario);
        return true;
    }

    public Usuario verificarCredenciais(String login, String senha) {
        log.info("Verificando credenciais para login: {}", login);
        
        return repository.findByLogin(login)
            .map(usuario -> {
                if (usuario.isContaBloqueada()) {
                    throw new RuntimeException("Conta bloqueada");
                }

                if (passwordEncoder.matches(senha, usuario.getSenha())) {
                    usuario.resetarTentativasLogin();
                    usuario.atualizarUltimoAcesso();
                    return repository.save(usuario);
                } else {
                    usuario.incrementarTentativasLogin();
                    repository.save(usuario);
                    return null;
                }
            })
            .orElse(null);
    }
}