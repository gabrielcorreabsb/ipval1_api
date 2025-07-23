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
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoticiaService {

    @Autowired
    private INoticia noticiaRepository;

    @Autowired
    private IUsuario usuarioRepository;

    @Autowired
    private FirebaseStorageService firebaseStorageService;

    @Transactional
    public NoticiaDTO criar(Noticia noticia, MultipartFile imagem, Integer usuarioId) {
        try {
            Usuario autor = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            // --- CORREÇÃO AQUI: Passando os parâmetros de pasta ---
            String imageUrl = firebaseStorageService.uploadImage(
                    imagem,
                    "noticias", // Pasta principal
                    "geral"     // Subpasta para notícias (pode ser "default", "publicacoes", etc.)
            );

            noticia.setAutor(autor);
            noticia.setImagemUrl(imageUrl);
            noticia.setDataCriacao(LocalDateTime.now());
            noticia.setAprovada(false);

            Noticia noticiaSalva = noticiaRepository.save(noticia);
            return new NoticiaDTO(noticiaSalva);

        } catch (Exception e) {
            throw new RuntimeException("Erro ao criar notícia: " + e.getMessage(), e); // Adicionado 'e' para stack trace
        }
    }

    @Transactional
    public NoticiaDTO atualizarNoticia(Integer id, String titulo, String conteudo, MultipartFile imagem) {
        Noticia noticia = noticiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notícia não encontrada"));

        noticia.setTitulo(titulo);
        noticia.setConteudo(conteudo);

        if (imagem != null && !imagem.isEmpty()) {
            try {
                if (noticia.getImagemUrl() != null && !noticia.getImagemUrl().isEmpty()) {
                    firebaseStorageService.deleteFile(noticia.getImagemUrl());
                }

                // --- CORREÇÃO AQUI: Passando os parâmetros de pasta ---
                String imageUrl = firebaseStorageService.uploadImage(
                        imagem,
                        "noticias", // Pasta principal
                        "geral"     // Subpasta para notícias
                );
                noticia.setImagemUrl(imageUrl);
            } catch (Exception e) {
                throw new RuntimeException("Erro ao processar imagem: " + e.getMessage(), e); // Adicionado 'e' para stack trace
            }
        }

        Noticia noticiaAtualizada = noticiaRepository.save(noticia);
        return new NoticiaDTO(noticiaAtualizada);
    }

    public List<NoticiaDTO> listarNoticiasAprovadas() {
        return noticiaRepository.findByAprovadaOrderByDataCriacaoDesc(true).stream()
                .map(NoticiaDTO::new)
                .collect(Collectors.toList());
    }

    public List<NoticiaDTO> listarTodas() {
        List<Noticia> noticias = noticiaRepository.findAll();
        return noticias.stream()
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