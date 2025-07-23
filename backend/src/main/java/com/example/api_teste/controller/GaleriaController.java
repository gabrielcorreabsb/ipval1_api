// src/main/java/com/example/api_teste/controller/GaleriaController.java
package com.example.api_teste.controller;

import com.example.api_teste.dto.FotoGaleriaDTO;
import com.example.api_teste.model.enums.CategoriaGaleria;
import com.example.api_teste.service.GaleriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/galeria")
@RequiredArgsConstructor
public class GaleriaController {

    private final GaleriaService galeriaService;

    // Endpoint para UPLOAD. Recebe um arquivo e os dados como 'form-data'
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<FotoGaleriaDTO> uploadFoto(
            @RequestParam("imagem") MultipartFile file,
            @RequestParam("categoria") CategoriaGaleria categoria,
            @RequestParam(value = "descricao", required = false) String descricao,
            Principal principal) { // Pega o usuário autenticado

        FotoGaleriaDTO fotoSalva = galeriaService.salvarFoto(file, categoria, descricao, principal);
        return new ResponseEntity<>(fotoSalva, HttpStatus.CREATED);
    }

    // Endpoint para LISTAR fotos por categoria
    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<FotoGaleriaDTO>> listarPorCategoria(@PathVariable CategoriaGaleria categoria) {
        return ResponseEntity.ok(galeriaService.listarPorCategoria(categoria));
    }

    // Endpoint para LISTAR todas as fotos (uma visão geral)
    @GetMapping
    public ResponseEntity<List<FotoGaleriaDTO>> listarTodas() {
        return ResponseEntity.ok(galeriaService.listarTodas());
    }

    // Endpoint para DELETAR uma foto por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarFoto(@PathVariable Long id) {
        galeriaService.deletarFoto(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoint para retornar a lista de categorias disponíveis
    @GetMapping("/categorias")
    public ResponseEntity<CategoriaGaleria[]> getCategorias() {
        return ResponseEntity.ok(CategoriaGaleria.values());
    }
}