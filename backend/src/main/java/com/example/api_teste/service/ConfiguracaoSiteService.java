package com.example.api_teste.service;

import com.example.api_teste.dto.ConfiguracaoSiteDTO;
import com.example.api_teste.model.ConfiguracaoSite;
import com.example.api_teste.repository.IConfiguracaoSite;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
public class ConfiguracaoSiteService {

    private final IConfiguracaoSite configuracaoRepository;

    @Autowired
    public ConfiguracaoSiteService(IConfiguracaoSite configuracaoRepository) {
        this.configuracaoRepository = configuracaoRepository;
    }

    public ConfiguracaoSiteDTO getConfiguracoes() {
        ConfiguracaoSite configuracao = configuracaoRepository.findFirst1ByOrderByIdAsc()
                .orElse(new ConfiguracaoSite());
        return convertToDTO(configuracao);
    }

    public ConfiguracaoSiteDTO salvarConfiguracoes(ConfiguracaoSiteDTO dto) {
        ConfiguracaoSite configuracao = configuracaoRepository.findFirst1ByOrderByIdAsc()
                .orElse(new ConfiguracaoSite());

        updateConfiguracao(configuracao, dto);
        ConfiguracaoSite saved = configuracaoRepository.save(configuracao);
        return convertToDTO(saved);
    }

    private void updateConfiguracao(ConfiguracaoSite configuracao, ConfiguracaoSiteDTO dto) {
        configuracao.setNomeSite(dto.getNomeSite());
        configuracao.setDescricao(dto.getDescricao());
        configuracao.setFacebookUrl(dto.getFacebookUrl());
        configuracao.setInstagramUrl(dto.getInstagramUrl());
        configuracao.setYoutubeUrl(dto.getYoutubeUrl());
        configuracao.setWhatsapp(dto.getWhatsapp());
        configuracao.setEmail(dto.getEmail());
        configuracao.setTelefone(dto.getTelefone());
        configuracao.setEndereco(dto.getEndereco());
        configuracao.setHorarioFuncionamento(dto.getHorarioFuncionamento());
        configuracao.setHorarioCultos(dto.getHorarioCultos());
        configuracao.setSobreIgreja(dto.getSobreIgreja());
        configuracao.setMensagemWhatsapp(dto.getMensagemWhatsapp());
    }

    private ConfiguracaoSiteDTO convertToDTO(ConfiguracaoSite configuracao) {
        return ConfiguracaoSiteDTO.builder()
                .id(configuracao.getId())
                .nomeSite(configuracao.getNomeSite())
                .descricao(configuracao.getDescricao())
                .facebookUrl(configuracao.getFacebookUrl())
                .instagramUrl(configuracao.getInstagramUrl())
                .youtubeUrl(configuracao.getYoutubeUrl())
                .whatsapp(configuracao.getWhatsapp())
                .email(configuracao.getEmail())
                .telefone(configuracao.getTelefone())
                .endereco(configuracao.getEndereco())
                .horarioFuncionamento(configuracao.getHorarioFuncionamento())
                .horarioCultos(configuracao.getHorarioCultos())
                .sobreIgreja(configuracao.getSobreIgreja())
                .mensagemWhatsapp(configuracao.getMensagemWhatsapp())
                .build();
    }
}