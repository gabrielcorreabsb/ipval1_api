package com.example.api_teste.securingweb;

import com.example.api_teste.config.JwtProperties;
import com.example.api_teste.repository.IUsuario;
import com.example.api_teste.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomAuthenticationProvider customAuthenticationProvider;
    private final JwtTokenProvider jwtTokenProvider;
    private final IUsuario usuarioRepository;

    public SecurityConfig(
            CustomAuthenticationProvider customAuthenticationProvider,
            JwtTokenProvider jwtTokenProvider,
            IUsuario usuarioRepository) {
        this.customAuthenticationProvider = customAuthenticationProvider;
        this.jwtTokenProvider = jwtTokenProvider;
        this.usuarioRepository = usuarioRepository;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, usuarioRepository);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Primeiro, permitir OPTIONS para CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Endpoints públicos da API
                                .requestMatchers("/api/auth/login").permitAll()
                                .requestMatchers("/api/auth/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/projetos").permitAll()

// Permissões para endpoints de usuários
                                .requestMatchers(HttpMethod.GET, "/api/usuarios").hasAnyRole("PASTOR", "USER")
                                .requestMatchers(HttpMethod.POST, "/api/usuarios").hasRole("PASTOR")
                                .requestMatchers(HttpMethod.PUT, "/api/usuarios/**").hasRole("PASTOR")
                                .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("PASTOR")

// Permissões para endpoints de membros
                                .requestMatchers(HttpMethod.GET, "/api/membros/**").hasAnyRole("BOASVINDAS", "PASTOR")
                                .requestMatchers(HttpMethod.POST, "/api/membros").hasAnyRole("BOASVINDAS", "PASTOR")
                                .requestMatchers(HttpMethod.PUT, "/api/membros/**").hasAnyRole("BOASVINDAS", "PASTOR")
                                .requestMatchers(HttpMethod.DELETE, "/api/membros/**").hasRole("PASTOR")

// Permissões para endpoints de agenda/eventos
                                .requestMatchers(HttpMethod.GET, "/api/agenda/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/agenda/**").hasRole("PASTOR")
                                .requestMatchers(HttpMethod.PUT, "/api/agenda/**").hasRole("PASTOR")
                                .requestMatchers(HttpMethod.DELETE, "/api/agenda/**").hasRole("PASTOR")


                        // Recursos estáticos
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/login.html",
                                "/home.html",
                                "/novo_projeto.html",
                                "/agenda.html",
                                "/usuarios.html",

                                "/assets/**",
                                "/css/**",
                                "/js/**",
                                "/favicon.ico"
                        ).permitAll()
                        .requestMatchers("/error").permitAll()
                        // Endpoints protegidos
                        .requestMatchers("/api/projetos/**").authenticated()
                        .anyRequest().authenticated()
                )
                .authenticationProvider(customAuthenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Configurar origens permitidas
        configuration.setAllowedOrigins(Arrays.asList(
                "https://gabrielcorrea.tech",  // Primeiro, coloque o domínio principal
                "http://localhost:63342",
                "http://127.0.0.1:63342"
        ));

        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        // Headers permitidos
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));

        // Headers expostos
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials"
        ));

        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}