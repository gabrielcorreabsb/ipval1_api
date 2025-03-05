package com.example.api_teste.controller;

import com.example.api_teste.dto.AgendaDTO;
import com.example.api_teste.model.Agenda;
import com.example.api_teste.service.AgendaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/agenda")
@CrossOrigin(origins = "*")
public class AgendaController {

    @Autowired
    private AgendaService agendaService;

    @PostMapping
    @PreAuthorize("hasAnyRole('PASTOR')")
    public ResponseEntity<AgendaDTO> criar(@Valid @RequestBody Agenda agenda,
                                           @RequestParam Long usuarioId) {
        return ResponseEntity.ok(agendaService.criar(agenda, usuarioId));
    }

    @GetMapping
    public ResponseEntity<List<AgendaDTO>> listarTodos() {
        return ResponseEntity.ok(agendaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgendaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(agendaService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PASTOR')")
    public ResponseEntity<AgendaDTO> atualizar(@PathVariable Long id,
                                               @Valid @RequestBody Agenda agenda) {
        return ResponseEntity.ok(agendaService.atualizar(id, agenda));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PASTOR')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        agendaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/periodo")
    public ResponseEntity<List<AgendaDTO>> buscarPorPeriodo(
            @RequestParam LocalDateTime inicio,
            @RequestParam LocalDateTime fim) {
        return ResponseEntity.ok(agendaService.buscarPorPeriodo(inicio, fim));
    }
}