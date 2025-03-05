package com.example.api_teste.controller;

import com.example.api_teste.dto.NoticiaDTO;
import com.example.api_teste.model.Noticia;
import com.example.api_teste.service.NoticiaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaController {

    @Autowired
    private NoticiaService noticiaService;

    @GetMapping
    public ResponseEntity<List<NoticiaDTO>> listarTodas() {
        return ResponseEntity.ok(noticiaService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<NoticiaDTO> criar(
            @RequestParam("imagem") MultipartFile imagem,
            @RequestParam("titulo") String titulo,
            @RequestParam("conteudo") String conteudo,
            @RequestParam Integer usuarioId) {

        // 1. Cria uma nova instância de Noticia com os dados básicos
        Noticia noticia = new Noticia();
        noticia.setTitulo(titulo);
        noticia.setConteudo(conteudo);

        // 2. O service vai:
        // - Fazer upload da imagem
        // - Salvar a URL da imagem na notícia
        // - Associar o usuário
        // - Salvar a notícia
        // - Retornar um NoticiaDTO
        NoticiaDTO noticiaDTO = noticiaService.criar(noticia, imagem, usuarioId);
        return ResponseEntity.ok(noticiaDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoticiaDTO> atualizarNoticia(
            @PathVariable Integer id,
            @RequestParam("titulo") String titulo,
            @RequestParam("conteudo") String conteudo,
            @RequestParam(value = "imagem", required = false) MultipartFile imagem) {
        try {
            NoticiaDTO noticiaAtualizada = noticiaService.atualizarNoticia(id, titulo, conteudo, imagem);
            return ResponseEntity.ok(noticiaAtualizada);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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
    public ResponseEntity<Map<String, String>> deletarNoticia(@PathVariable Integer id) {
        noticiaService.deletar(id);
        return ResponseEntity.ok(Map.of("message", "Notícia excluída com sucesso"));
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