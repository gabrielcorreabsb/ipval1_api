package com.example.api_teste.service;


import com.example.api_teste.dto.AgendaDTO;
import com.example.api_teste.model.Agenda;
import com.example.api_teste.model.Usuario;
import com.example.api_teste.repository.IAgenda;
import com.example.api_teste.repository.IUsuario;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgendaService {

    @Autowired
    private IAgenda agendaRepository;

    @Autowired
    private IUsuario usuarioRepository;

    @Transactional
    public AgendaDTO criar(Agenda agenda, Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(Math.toIntExact(usuarioId))
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        // Validações
        if (agenda.getDataFim().isBefore(agenda.getDataInicio())) {
            throw new IllegalArgumentException("Data de término não pode ser anterior à data de início");
        }

        agenda.setUsuario(usuario);
        Agenda savedAgenda = agendaRepository.save(agenda);
        return new AgendaDTO(savedAgenda);
    }

    public List<AgendaDTO> listarTodos() {
        return agendaRepository.findAll().stream()
                .map(AgendaDTO::new)
                .collect(Collectors.toList());
    }

    public AgendaDTO buscarPorId(Long id) {
        Agenda agenda = agendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));
        return new AgendaDTO(agenda);
    }

    @Transactional
    public AgendaDTO atualizar(Long id, Agenda agendaAtualizada) {
        Agenda agenda = agendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));

        agenda.setTitulo(agendaAtualizada.getTitulo());
        agenda.setDescricao(agendaAtualizada.getDescricao());
        agenda.setDataInicio(agendaAtualizada.getDataInicio());
        agenda.setDataFim(agendaAtualizada.getDataFim());
        agenda.setLocalEvento(agendaAtualizada.getLocalEvento());

        return new AgendaDTO(agendaRepository.save(agenda));
    }

    @Transactional
    public void deletar(Long id) {
        if (!agendaRepository.existsById(id)) {
            throw new EntityNotFoundException("Evento não encontrado");
        }
        agendaRepository.deleteById(id);
    }

    public List<AgendaDTO> buscarPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        return agendaRepository.findEventosPeriodo(inicio, fim).stream()
                .map(AgendaDTO::new)
                .collect(Collectors.toList());
    }
}
