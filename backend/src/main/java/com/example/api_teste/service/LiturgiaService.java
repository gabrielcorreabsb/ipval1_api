package com.example.api_teste.service;

import com.example.api_teste.dto.ItemLiturgiaDTO;
import com.example.api_teste.dto.LiturgiaDTO;
import com.example.api_teste.model.ItemLiturgia;
import com.example.api_teste.model.Liturgia;
import com.example.api_teste.repository.ILiturgiaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LiturgiaService {

    private final ILiturgiaRepository liturgiaRepository;

    @Transactional(readOnly = true)
    public List<LiturgiaDTO> listarTodasComItens() {
        return liturgiaRepository.findAllWithItens().stream()
                .map(LiturgiaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LiturgiaDTO buscarPorIdComItens(Long id) {
        Liturgia liturgia = liturgiaRepository.findByIdWithItens(id)
                .orElseThrow(() -> new EntityNotFoundException("Liturgia não encontrada com ID: " + id));
        return LiturgiaDTO.fromEntity(liturgia);
    }

    @Transactional
    public LiturgiaDTO criar(LiturgiaDTO liturgiaDTO) {
        Liturgia liturgia = liturgiaDTO.toEntity();
        Liturgia liturgiaSalva = liturgiaRepository.save(liturgia);
        return LiturgiaDTO.fromEntity(liturgiaSalva);
    }

    @Transactional
    public LiturgiaDTO atualizar(Long id, LiturgiaDTO liturgiaDTO) {
        Liturgia liturgiaExistente = liturgiaRepository.findByIdWithItens(id)
                .orElseThrow(() -> new EntityNotFoundException("Liturgia não encontrada para atualização com ID: " + id));

        liturgiaExistente.setTitulo(liturgiaDTO.getTitulo());
        liturgiaExistente.setData(liturgiaDTO.getData());
        liturgiaExistente.setDescricao(liturgiaDTO.getDescricao());
        liturgiaExistente.setVersaoBibliaPadrao(liturgiaDTO.getVersaoBibliaPadrao());

        liturgiaExistente.getItens().clear(); // Seguro devido a @Builder.Default
        for (ItemLiturgiaDTO itemDTO : liturgiaDTO.getItens()) {
            ItemLiturgia itemEntidade = itemDTO.toEntity();
            liturgiaExistente.addItem(itemEntidade);
        }

        Liturgia liturgiaAtualizada = liturgiaRepository.save(liturgiaExistente);
        return LiturgiaDTO.fromEntity(liturgiaAtualizada);
    }

    @Transactional
    public void deletar(Long id) {
        if (!liturgiaRepository.existsById(id)) {
            throw new EntityNotFoundException("Liturgia não encontrada para deleção com ID: " + id);
        }
        liturgiaRepository.deleteById(id);
    }
}