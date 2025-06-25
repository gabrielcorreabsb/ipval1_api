package com.example.api_teste.controller;

import com.example.api_teste.dto.LiturgiaDTO;
import com.example.api_teste.service.LiturgiaService;
import jakarta.validation.Valid; // Para acionar a validação dos DTOs
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/liturgias") // Ponto de entrada base para todas as operações de liturgia
@RequiredArgsConstructor
public class LiturgiaController {

    private final LiturgiaService liturgiaService;

    /**
     * Endpoint para listar todas as liturgias.
     * GET /api/liturgias
     */
    @GetMapping
    public ResponseEntity<List<LiturgiaDTO>> listarTodas() {
        List<LiturgiaDTO> liturgias = liturgiaService.listarTodasComItens();
        return ResponseEntity.ok(liturgias);
    }

    /**
     * Endpoint para buscar uma liturgia específica por ID.
     * GET /api/liturgias/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<LiturgiaDTO> buscarPorId(@PathVariable Long id) {
        LiturgiaDTO liturgia = liturgiaService.buscarPorIdComItens(id);
        // EntityNotFoundException lançada pelo serviço será tratada globalmente (ver próximo passo)
        return ResponseEntity.ok(liturgia);
    }

    /**
     * Endpoint para criar uma nova liturgia.
     * POST /api/liturgias
     */
    @PostMapping
    public ResponseEntity<LiturgiaDTO> criar(@Valid @RequestBody LiturgiaDTO liturgiaDTO) {
        LiturgiaDTO novaLiturgia = liturgiaService.criar(liturgiaDTO);

        // Constrói a URI do novo recurso criado para retornar no header "Location"
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest() // Pega a URL base da requisição atual (/api/liturgias)
                .path("/{id}")       // Adiciona o path para o recurso específico
                .buildAndExpand(novaLiturgia.getId()) // Substitui {id} pelo ID da nova liturgia
                .toUri();

        return ResponseEntity.created(location).body(novaLiturgia); // Retorna 201 Created
    }

    /**
     * Endpoint para atualizar uma liturgia existente.
     * PUT /api/liturgias/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<LiturgiaDTO> atualizar(@PathVariable Long id,
                                                 @Valid @RequestBody LiturgiaDTO liturgiaDTO) {
        LiturgiaDTO liturgiaAtualizada = liturgiaService.atualizar(id, liturgiaDTO);
        return ResponseEntity.ok(liturgiaAtualizada); // Retorna 200 OK
    }

    /**
     * Endpoint para deletar uma liturgia.
     * DELETE /api/liturgias/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        liturgiaService.deletar(id);
        // EntityNotFoundException será tratada globalmente
        return ResponseEntity.noContent().build(); // Retorna 204 No Content
    }
}