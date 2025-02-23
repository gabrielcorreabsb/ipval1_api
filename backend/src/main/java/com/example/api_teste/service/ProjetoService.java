package com.example.api_teste.service;

import com.example.api_teste.model.Projeto;
import com.example.api_teste.model.Usuario;
import com.example.api_teste.repository.IProjeto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class ProjetoService {

    private final IProjeto projetoRepository;

    @Autowired
    public ProjetoService(IProjeto projetoRepository) {
        this.projetoRepository = projetoRepository;
    }

    public Projeto criarProjeto(String nome, String link, Usuario usuario) {
        Projeto projeto = new Projeto();
        projeto.setNome(nome);
        projeto.setLink(link);
        projeto.setUsuario(usuario);

        log.info("Criando novo projeto: {}", nome);
        return projetoRepository.save(projeto);
    }

    public List<Projeto> listarProjetosPorUsuario(Usuario usuario) {
        return projetoRepository.findByUsuarioOrderByDataCriacaoDesc(usuario);
    }
}