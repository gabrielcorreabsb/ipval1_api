package com.example.api_teste.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @NotBlank(message = "O login não pode estar em branco")
    @Size(min = 3, max = 50, message = "O login deve ter entre 3 e 50 caracteres")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "O login deve conter apenas letras, números e os caracteres . _ -")
    @Column(name = "login", length = 50, nullable = false, unique = true)
    private String login;

    @NotBlank(message = "O nome não pode estar em branco")
    @Size(min = 3, max = 100, message = "O nome deve ter entre 3 e 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\s]+$", message = "O nome deve conter apenas letras e espaços")
    @Column(name = "nome", length = 100, nullable = false)
    private String nome;

    @NotBlank(message = "A senha não pode estar em branco")
    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$",
            message = "A senha deve conter pelo menos uma letra e um número")
    @Column(name = "senha", columnDefinition = "TEXT", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    @Column(name = "data_criacao", updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "ultimo_acesso")
    private LocalDateTime ultimoAcesso;

    @Builder.Default
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Builder.Default
    @Column(name = "tentativas_login")
    private Integer tentativasLogin = 0;

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        ultimoAcesso = LocalDateTime.now();
    }

    public void atualizarUltimoAcesso() {
        this.ultimoAcesso = LocalDateTime.now();
    }

    public void incrementarTentativasLogin() {
        this.tentativasLogin++;
    }

    public void resetarTentativasLogin() {
        this.tentativasLogin = 0;
    }

    @JsonIgnore
    public boolean isContaBloqueada() {
        return tentativasLogin >= 5;
    }

    @JsonIgnore
    public boolean isAtivo() {
        return ativo;
    }

    // Métodos da interface UserDetails
    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return this.senha;
    }

    @Override
    @JsonIgnore
    public String getUsername() {
        return this.login;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return !isContaBloqueada();
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return this.ativo;
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "idUsuario=" + idUsuario +
                ", login='" + login + '\'' +
                ", nome='" + nome + '\'' +
                ", dataCriacao=" + dataCriacao +
                ", ultimoAcesso=" + ultimoAcesso +
                ", ativo=" + ativo +
                ", tentativasLogin=" + tentativasLogin +
                '}';
    }
}