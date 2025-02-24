package com.example.api_teste.service;

import com.example.api_teste.model.Projeto;
import com.example.api_teste.model.Usuario;
import com.example.api_teste.repository.IProjeto;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
public class ProjetoService {

    private final IProjeto projetoRepository;

    @Autowired
    public ProjetoService(IProjeto projetoRepository) {
        this.projetoRepository = projetoRepository;
    }

    @Transactional(readOnly = true)
    public List<Projeto> listarTodosProjetos() {
        log.info("Listando todos os projetos");
        return projetoRepository.findAll();
    }

    @Transactional
    public Projeto criarProjeto(String nome, String link, String github, Usuario usuario) {
        log.info("Criando novo projeto: {}", nome);

        Projeto projeto = new Projeto();
        projeto.setNome(nome);
        projeto.setLink(link);
        projeto.setGithub(github);
        projeto.setUsuario(usuario);

        return projetoRepository.save(projeto);
    }

    @Transactional(readOnly = true)
    public List<Projeto> listarProjetosPorUsuario(Usuario usuario) {
        log.info("Listando projetos para usuário: {}", usuario.getLogin());
        return projetoRepository.findByUsuarioOrderByDataCriacaoDesc(usuario);
    }

    @Transactional
    public Projeto atualizarProjeto(Long id, String nome, String link, String github, Usuario usuario) {
        log.info("Atualizando projeto: {}", id);

        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado: " + id));

        projeto.setNome(nome);
        projeto.setLink(link);
        projeto.setGithub(github);

        return projetoRepository.save(projeto);
    }

    @Transactional
    public void deletarProjeto(Long id, Usuario usuario) {
        log.info("Deletando projeto: {}", id);

        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado: " + id));

        projetoRepository.delete(projeto);
        log.info("Projeto {} deletado com sucesso", id);
    }

    @Transactional(readOnly = true)
    public Projeto buscarProjetoPorId(Long id) {
        log.info("Buscando projeto por ID: {}", id);
        return projetoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado: " + id));
    }
}