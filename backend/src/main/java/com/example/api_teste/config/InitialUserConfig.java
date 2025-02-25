package com.example.api_teste.config;

import com.example.api_teste.model.Usuario;
import com.example.api_teste.repository.IUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class InitialUserConfig implements CommandLineRunner {

    private final IUsuario usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public InitialUserConfig(IUsuario usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Verifica se já existe um usuário admin
        if (!usuarioRepository.findByLogin("admin").isPresent()) {
            Usuario admin = new Usuario();
            admin.setNome("Administrador");
            admin.setLogin("admin");
            admin.setSenha(passwordEncoder.encode("G0212snake##"));
            admin.setDataCriacao(LocalDateTime.now());
            admin.setAtivo(true);
            admin.setTentativasLogin(0);

            usuarioRepository.save(admin);

            System.out.println("Usuário admin criado com sucesso!");
        }
    }
}