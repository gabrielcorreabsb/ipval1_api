package com.example.api_teste.model;

import com.example.api_teste.model.enums.CategoriaGaleria;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "fotos_galeria")
public class FotoGaleria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob // Para URLs potencialmente longas
    @Column(nullable = false)
    private String url;

    @Column(length = 255) // Descrição opcional
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaGaleria categoria;

    @CreationTimestamp // Define a data de upload automaticamente
    @Column(name = "data_upload", nullable = false, updatable = false)
    private LocalDateTime dataUpload;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id") // Opcional: para saber quem fez o upload
    private Usuario usuario;
}