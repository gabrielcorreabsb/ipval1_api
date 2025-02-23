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
                usuario
        );

        return ResponseEntity.ok(converterParaDTO(projeto));
    }

    @GetMapping
    public ResponseEntity<List<ProjetoDTO>> listarProjetos(@AuthenticationPrincipal Usuario usuario) {
        log.info("Listando projetos para usuário: {}", usuario.getLogin());

        List<Projeto> projetos = projetoService.listarProjetosPorUsuario(usuario);
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
        dto.setDataCriacao(projeto.getDataCriacao());
        return dto;
    }
}