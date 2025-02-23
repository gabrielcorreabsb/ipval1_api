package com.example.api_teste.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.api_teste.model.Usuario;
import com.example.api_teste.model.Projeto;

import java.util.List;

@Repository
public interface IProjeto extends JpaRepository<Projeto, Long> {
    List<Projeto> findByUsuarioOrderByDataCriacaoDesc(Usuario usuario);
}