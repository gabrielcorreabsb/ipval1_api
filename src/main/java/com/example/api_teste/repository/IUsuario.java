package com.example.api_teste.repository;

import com.example.api_teste.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface IUsuario extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByLogin(String login);
    boolean existsByLogin(String login);
    boolean existsByLoginAndIdUsuarioNot(String login, Integer idUsuario);
    List<Usuario> findByLoginContaining(String texto);
    List<Usuario> findByAtivo(boolean ativo);
    List<Usuario> findAllByOrderByLoginAsc();
}