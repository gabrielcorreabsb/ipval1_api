package com.example.api_teste.repository;

import com.example.api_teste.model.ItemLiturgia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IItemLiturgiaRepository extends JpaRepository<ItemLiturgia, Long> {

    // Busca todos os itens de uma liturgia específica, ordenados pela 'ordem'
    List<ItemLiturgia> findByLiturgiaIdOrderByOrdemAsc(Long liturgiaId);

    // Outros métodos de busca específicos para ItemLiturgia podem ser adicionados aqui
    // se necessário, embora muitas operações com itens sejam feitas através da
    // entidade Liturgia (devido ao cascade e mappedBy).
}