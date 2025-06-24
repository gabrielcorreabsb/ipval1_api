package com.example.api_teste.repository;

import com.example.api_teste.model.Liturgia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ILiturgiaRepository extends JpaRepository<Liturgia, Long> {

    // Busca liturgias por data
    List<Liturgia> findByData(LocalDate data);

    // Busca liturgias por título (ignorando case)
    List<Liturgia> findByTituloContainingIgnoreCase(String titulo);

    // Busca uma liturgia específica por ID e já carrega seus itens
    // para evitar o problema N+1 select quando os itens são LAZY.
    @Query("SELECT l FROM Liturgia l LEFT JOIN FETCH l.itens WHERE l.id = :id")
    Optional<Liturgia> findByIdWithItens(@Param("id") Long id);

    // Busca todas as liturgias e já carrega seus itens.
    // Cuidado com a performance se houver muitas liturgias e/ou muitos itens por liturgia.
    // Pode ser melhor ter um método que busca sem itens para listagens gerais,
    // e este apenas para quando os detalhes completos são realmente necessários para várias liturgias.
    @Query("SELECT DISTINCT l FROM Liturgia l LEFT JOIN FETCH l.itens ORDER BY l.data DESC, l.titulo ASC")
    List<Liturgia> findAllWithItens();
}