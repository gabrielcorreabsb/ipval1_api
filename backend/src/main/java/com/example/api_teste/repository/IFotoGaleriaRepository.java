package com.example.api_teste.repository;

import com.example.api_teste.model.FotoGaleria;
import com.example.api_teste.model.enums.CategoriaGaleria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IFotoGaleriaRepository extends JpaRepository<FotoGaleria, Long> {

    // Encontra todas as fotos de uma categoria específica, ordenadas pela mais recente
    List<FotoGaleria> findByCategoriaOrderByDataUploadDesc(CategoriaGaleria categoria);

    // Encontra todas as fotos, ordenadas pela mais recente
    List<FotoGaleria> findAllByOrderByDataUploadDesc();
}