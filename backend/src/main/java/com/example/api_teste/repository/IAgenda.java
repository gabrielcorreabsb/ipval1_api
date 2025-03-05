package com.example.api_teste.repository;

import com.example.api_teste.model.Agenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface IAgenda extends JpaRepository<Agenda, Long> {
    List<Agenda> findByUsuarioIdUsuario(Long usuarioId);

    @Query("SELECT a FROM Agenda a WHERE a.dataInicio BETWEEN :inicio AND :fim OR a.dataFim BETWEEN :inicio AND :fim")
    List<Agenda> findEventosPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}