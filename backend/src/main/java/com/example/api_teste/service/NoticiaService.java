package com.example.api_teste.service;

import com.example.api_teste.dto.NoticiaDTO;
import com.example.api_teste.model.Cargo;
import com.example.api_teste.model.Noticia;
import com.example.api_teste.model.Usuario;
import com.example.api_teste.repository.INoticia;
import com.example.api_teste.repository.IUsuario;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoticiaService {

    @Autowired
    private INoticia noticiaRepository;

    @Autowired
    private IUsuario usuarioRepository;

    @Transactional
    public NoticiaDTO criar(Noticia noticia, Integer usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        noticia.setAutor(usuario);
        noticia.setAprovada(false);
        noticia.setDataCriacao(LocalDateTime.now());

        Noticia savedNoticia = noticiaRepository.save(noticia);
        return new NoticiaDTO(savedNoticia);
    }

    public List<NoticiaDTO> listarNoticiasAprovadas() {
        return noticiaRepository.findByAprovadaOrderByDataCriacaoDesc(true).stream()
                .map(NoticiaDTO::new)
                .collect(Collectors.toList());
    }

    public List<NoticiaDTO> listarNoticiasPendentes() {
        return noticiaRepository.findByAprovadaOrderByDataCriacaoDesc(false).stream()
                .map(NoticiaDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public NoticiaDTO aprovar(Integer id) {
        Noticia noticia = noticiaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notícia não encontrada"));

        noticia.setAprovada(true);
        return new NoticiaDTO(noticiaRepository.save(noticia));
    }

    @Transactional
    public void deletar(Integer id) {
        if (!noticiaRepository.existsById(id)) {
            throw new EntityNotFoundException("Notícia não encontrada");
        }
        noticiaRepository.deleteById(id);
    }

    public NoticiaDTO buscarPorId(Integer id) {
        Noticia noticia = noticiaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notícia não encontrada"));
        return new NoticiaDTO(noticia);
    }

    public List<NoticiaDTO> buscarPorAutor(Integer usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        return noticiaRepository.findByAutorOrderByDataCriacaoDesc(usuario).stream()
                .map(NoticiaDTO::new)
                .collect(Collectors.toList());
    }
}