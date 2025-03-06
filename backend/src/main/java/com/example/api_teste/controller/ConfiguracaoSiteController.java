package com.example.api_teste.controller;

import com.example.api_teste.dto.ConfiguracaoSiteDTO;
import com.example.api_teste.service.ConfiguracaoSiteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/configuracoes")
@CrossOrigin(origins = "*")
@Slf4j
public class ConfiguracaoSiteController {

    private final ConfiguracaoSiteService configuracaoService;

    @Autowired
    public ConfiguracaoSiteController(ConfiguracaoSiteService configuracaoService) {
        this.configuracaoService = configuracaoService;
    }

    @GetMapping
    public ResponseEntity<ConfiguracaoSiteDTO> getConfiguracoes() {
        log.info("Recebida requisição para obter configurações do site");
        ConfiguracaoSiteDTO configuracao = configuracaoService.getConfiguracoes();
        return ResponseEntity.ok(configuracao);
    }

    @PostMapping
    public ResponseEntity<ConfiguracaoSiteDTO> salvarConfiguracoes(@RequestBody ConfiguracaoSiteDTO configuracao) {
        log.info("Recebida requisição para salvar configurações do site");
        ConfiguracaoSiteDTO configuracaoSalva = configuracaoService.salvarConfiguracoes(configuracao);
        return ResponseEntity.ok(configuracaoSalva);
    }
}