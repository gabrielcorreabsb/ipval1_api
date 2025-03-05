package com.example.api_teste.controller;

import com.example.api_teste.dto.NoticiaDTO;
import com.example.api_teste.model.Noticia;
import com.example.api_teste.service.NoticiaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaController {

    @Autowired
    private NoticiaService noticiaService;

    @PostMapping
    public ResponseEntity<NoticiaDTO> criar(@RequestBody Noticia noticia, @RequestParam Integer usuarioId) {
        NoticiaDTO noticiaDTO = noticiaService.criar(noticia, usuarioId);
        return ResponseEntity.ok(noticiaDTO);
    }

    @GetMapping("/aprovadas")
    public ResponseEntity<List<NoticiaDTO>> listarAprovadas() {
        return ResponseEntity.ok(noticiaService.listarNoticiasAprovadas());
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<NoticiaDTO>> listarPendentes() {
        return ResponseEntity.ok(noticiaService.listarNoticiasPendentes());
    }

    @PutMapping("/{id}/aprovar")
    public ResponseEntity<NoticiaDTO> aprovar(@PathVariable Integer id) {
        return ResponseEntity.ok(noticiaService.aprovar(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        noticiaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoticiaDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(noticiaService.buscarPorId(id));
    }

    @GetMapping("/autor/{usuarioId}")
    public ResponseEntity<List<NoticiaDTO>> buscarPorAutor(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(noticiaService.buscarPorAutor(usuarioId));
    }
}