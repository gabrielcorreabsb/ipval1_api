package com.example.api_teste.repository;

import com.example.api_teste.model.ConfiguracaoSite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IConfiguracaoSite extends JpaRepository<ConfiguracaoSite, Long> {
    Optional<ConfiguracaoSite> findFirst1ByOrderByIdAsc();
}
