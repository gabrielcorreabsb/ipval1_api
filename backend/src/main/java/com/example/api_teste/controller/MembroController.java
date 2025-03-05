package com.example.api_teste.controller;

import com.example.api_teste.dto.MembroDTO;
import com.example.api_teste.service.MembroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/membros")
@RequiredArgsConstructor
public class MembroController {

    private final MembroService membroService;

    @GetMapping
    public ResponseEntity<List<MembroDTO>> listarTodos() {
        return ResponseEntity.ok(membroService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembroDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(membroService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<MembroDTO> criar(@Valid @RequestBody MembroDTO membroDTO) {
        MembroDTO novoMembro = membroService.criar(membroDTO);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(novoMembro.getId())
                .toUri();
        return ResponseEntity.created(location).body(novoMembro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MembroDTO> atualizar(@PathVariable Long id,
                                               @Valid @RequestBody MembroDTO membroDTO) {
        return ResponseEntity.ok(membroService.atualizar(id, membroDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        membroService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<MembroDTO>> buscarPorNome(@RequestParam String nome) {
        return ResponseEntity.ok(membroService.buscarPorNome(nome));
    }
}