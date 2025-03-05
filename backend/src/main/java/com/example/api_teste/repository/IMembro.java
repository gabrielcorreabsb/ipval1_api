package com.example.api_teste.repository;

import com.example.api_teste.model.Membro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IMembro extends JpaRepository<Membro, Long> {
    List<Membro> findByNomeContainingIgnoreCase(String nome);
}