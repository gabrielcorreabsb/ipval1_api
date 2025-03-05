package com.example.api_teste.service;

import com.example.api_teste.dto.MembroDTO;
import com.example.api_teste.model.Membro;
import com.example.api_teste.repository.IMembro;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MembroService {

    private final IMembro membroRepository;

    public List<MembroDTO> listarTodos() {
        return membroRepository.findAll()
                .stream()
                .map(MembroDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public MembroDTO buscarPorId(Long id) {
        return membroRepository.findById(id)
                .map(MembroDTO::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Membro não encontrado"));
    }

    @Transactional
    public MembroDTO criar(MembroDTO membroDTO) {
        Membro membro = membroDTO.toEntity();
        membro = membroRepository.save(membro);
        return MembroDTO.fromEntity(membro);
    }

    @Transactional
    public MembroDTO atualizar(Long id, MembroDTO membroDTO) {
        if (!membroRepository.existsById(id)) {
            throw new EntityNotFoundException("Membro não encontrado");
        }

        Membro membro = membroDTO.toEntity();
        membro.setId(id);
        membro = membroRepository.save(membro);
        return MembroDTO.fromEntity(membro);
    }

    @Transactional
    public void deletar(Long id) {
        if (!membroRepository.existsById(id)) {
            throw new EntityNotFoundException("Membro não encontrado");
        }
        membroRepository.deleteById(id);
    }

    public List<MembroDTO> buscarPorNome(String nome) {
        return membroRepository.findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(MembroDTO::fromEntity)
                .collect(Collectors.toList());
    }
}