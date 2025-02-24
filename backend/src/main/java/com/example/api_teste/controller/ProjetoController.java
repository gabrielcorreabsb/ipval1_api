package com.example.api_teste.controller;

import com.example.api_teste.dto.ProjetoDTO;
import com.example.api_teste.model.Projeto;
import com.example.api_teste.model.Usuario;
import com.example.api_teste.service.ProjetoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projetos")
@Slf4j
public class ProjetoController {

    private final ProjetoService projetoService;

    @Autowired
    public ProjetoController(ProjetoService projetoService) {
        this.projetoService = projetoService;
    }

    @PostMapping
    public ResponseEntity<ProjetoDTO> criarProjeto(
            @RequestBody ProjetoDTO projetoDTO,
            @AuthenticationPrincipal Usuario usuario) {
        log.info("Recebida requisição para criar projeto: {}", projetoDTO.getNome());

        Projeto projeto = projetoService.criarProjeto(
                projetoDTO.getNome(),
                projetoDTO.getLink(),
                projetoDTO.getGithub(),
                usuario
        );

        return ResponseEntity.ok(converterParaDTO(projeto));
    }

    @GetMapping
    public ResponseEntity<List<ProjetoDTO>> listarProjetos() {
        log.info("Listando todos os projetos");
        List<Projeto> projetos = projetoService.listarTodosProjetos(); // Novo método
        List<ProjetoDTO> projetosDTO = projetos.stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(projetosDTO);
    }

    private ProjetoDTO converterParaDTO(Projeto projeto) {
        ProjetoDTO dto = new ProjetoDTO();
        dto.setId(projeto.getId());
        dto.setNome(projeto.getNome());
        dto.setLink(projeto.getLink());
        dto.setGithub(projeto.getGithub());
        dto.setDataCriacao(projeto.getDataCriacao());
        return dto;
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjetoDTO> atualizarProjeto(
            @PathVariable Long id,
            @RequestBody ProjetoDTO projetoDTO,
            @AuthenticationPrincipal Usuario usuario) {
        log.info("Recebida requisição para atualizar projeto: {}", id);

        Projeto projeto = projetoService.atualizarProjeto(
                id,
                projetoDTO.getNome(),
                projetoDTO.getLink(),
                projetoDTO.getGithub(),
                usuario
        );

        return ResponseEntity.ok(converterParaDTO(projeto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarProjeto(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        log.info("Recebida requisição para deletar projeto: {}", id);

        projetoService.deletarProjeto(id, usuario);
        return ResponseEntity.noContent().build();
    }
}