package com.example.api_teste.controller;

import com.example.api_teste.model.enums.LivroBiblia;
import com.example.api_teste.model.enums.TestamentoBiblico;
import com.example.api_teste.model.enums.VersaoBibliaUtilizada;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bibliainfo")
@RequiredArgsConstructor
@Tag(name = "Informações da Bíblia", description = "Endpoints para obter dados sobre versões e livros bíblicos disponíveis.")
public class BibliaInfoController {

    @GetMapping("/versoes")
    @Operation(summary = "Lista as versões da Bíblia utilizadas pela aplicação",
            description = "Retorna uma lista das versões da Bíblia (ex: ARA, NVI) com seus nomes completos e siglas para a API da Bíblia Digital.")
    @ApiResponse(responseCode = "200", description = "Lista de versões obtida com sucesso.")
    public ResponseEntity<List<Map<String, String>>> getVersoesBibliaUtilizadas() {
        List<Map<String, String>> versoes = Arrays.stream(VersaoBibliaUtilizada.values())
                .map(v -> {
                    Map<String, String> versaoMap = new HashMap<>();
                    versaoMap.put("enumNome", v.name()); // Ex: "ARA", "NVI" (para o backend usar no DTO)
                    versaoMap.put("siglaApi", v.getSiglaApi()); // Ex: "ra", "nvi" (para o frontend chamar a API externa)
                    versaoMap.put("nomeCompleto", v.getNomeCompleto()); // Ex: "Almeida Revista e Atualizada"
                    return versaoMap;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(versoes);
    }

    @GetMapping("/livros")
    @Operation(summary = "Lista todos os livros da Bíblia com detalhes",
            description = "Retorna uma lista completa dos 66 livros da Bíblia, incluindo nome, abreviação para a API, total de capítulos, testamento e grupo.")
    @ApiResponse(responseCode = "200", description = "Lista de livros obtida com sucesso.")
    public ResponseEntity<List<Map<String, Object>>> getLivrosBiblia() {
        List<Map<String, Object>> livros = Arrays.stream(LivroBiblia.values())
                .map(l -> {
                    Map<String, Object> livroMap = new HashMap<>();
                    livroMap.put("enumNome", l.name());             // Ex: "GENESIS" (para o backend usar no DTO)
                    livroMap.put("nomeCompleto", l.getNomeCompleto()); // Ex: "Gênesis"
                    livroMap.put("abrevApi", l.getAbrevPtApi());     // Ex: "gn" (para o frontend chamar a API externa)
                    livroMap.put("totalCapitulos", l.getTotalCapitulos());
                    livroMap.put("testamento", Map.of( // Objeto para o testamento
                            "enumNome", l.getTestamento().name(), // "VT" ou "NT"
                            "descricao", l.getTestamento().getDescricao() // "Velho Testamento" ou "Novo Testamento"
                    ));
                    livroMap.put("grupo", l.getGrupo());             // Ex: "Pentateuco"
                    return livroMap;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(livros);
    }

    @GetMapping("/testamentos")
    @Operation(summary = "Lista os testamentos bíblicos",
            description = "Retorna os testamentos disponíveis (Velho e Novo Testamento).")
    @ApiResponse(responseCode = "200", description = "Lista de testamentos obtida com sucesso.")
    public ResponseEntity<List<Map<String, String>>> getTestamentosBiblicos() {
        List<Map<String, String>> testamentos = Arrays.stream(TestamentoBiblico.values())
                .map(t -> Map.of(
                        "enumNome", t.name(), // "VT", "NT"
                        "descricao", t.getDescricao() // "Velho Testamento", "Novo Testamento"
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(testamentos);
    }
}