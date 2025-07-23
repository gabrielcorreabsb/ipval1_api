package com.example.api_teste.service;

import com.example.api_teste.dto.FotoGaleriaDTO;
import com.example.api_teste.model.FotoGaleria;
import com.example.api_teste.model.Usuario;
import com.example.api_teste.model.enums.CategoriaGaleria;
import com.example.api_teste.repository.IFotoGaleriaRepository;
import com.example.api_teste.repository.IUsuario; // Supondo que você tem este repositório
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal; // Para pegar o usuário logado
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GaleriaService {

    private final IFotoGaleriaRepository fotoGaleriaRepository;
    private final FirebaseStorageService firebaseStorageService;
    private final IUsuario usuarioRepository; // Para associar o usuário

    @Transactional
    public FotoGaleriaDTO salvarFoto(MultipartFile file, CategoriaGaleria categoria, String descricao, Principal principal){
        // Validações básicas
        if (file.isEmpty()) {
            throw new IllegalArgumentException("O arquivo de imagem não pode estar vazio.");
        }
        if (!file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("O arquivo deve ser uma imagem (jpeg, png, etc.).");
        }

        // 1. Faz o upload para o Firebase Storage
        //    (Poderíamos ajustar o FirebaseStorageService para aceitar a categoria e salvar em pastas separadas)
        String urlDaImagem = firebaseStorageService.uploadImage(
                file,
                "galeria", // Pasta principal
                categoria.name() // Subpasta (ex: "UPH", "SAF")
        );

        // 2. Busca o usuário logado (opcional, mas recomendado)
        Usuario usuarioLogado = usuarioRepository.findByLogin(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        // 3. Cria e salva a entidade no banco de dados
        FotoGaleria novaFoto = FotoGaleria.builder()
                .url(urlDaImagem)
                .descricao(descricao)
                .categoria(categoria)
                .usuario(usuarioLogado)
                .build();

        FotoGaleria fotoSalva = fotoGaleriaRepository.save(novaFoto);

        return FotoGaleriaDTO.fromEntity(fotoSalva);
    }

    @Transactional(readOnly = true)
    public List<FotoGaleriaDTO> listarPorCategoria(CategoriaGaleria categoria) {
        return fotoGaleriaRepository.findByCategoriaOrderByDataUploadDesc(categoria)
                .stream()
                .map(FotoGaleriaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FotoGaleriaDTO> listarTodas() {
        return fotoGaleriaRepository.findAllByOrderByDataUploadDesc()
                .stream()
                .map(FotoGaleriaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletarFoto(Long id) {
        FotoGaleria foto = fotoGaleriaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Foto não encontrada com ID: " + id));

        // 1. Deleta o arquivo do Firebase Storage
        firebaseStorageService.deleteFile(foto.getUrl());

        // 2. Deleta o registro do banco de dados
        fotoGaleriaRepository.deleteById(id);
    }
}