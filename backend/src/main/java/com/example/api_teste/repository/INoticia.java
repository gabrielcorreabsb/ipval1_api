package com.example.api_teste.repository;

import com.example.api_teste.model.Noticia;
import com.example.api_teste.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface INoticia extends JpaRepository<Noticia, Integer> {
    List<Noticia> findByAprovadaOrderByDataCriacaoDesc(boolean aprovada);
    List<Noticia> findByAutorOrderByDataCriacaoDesc(Usuario autor);
}