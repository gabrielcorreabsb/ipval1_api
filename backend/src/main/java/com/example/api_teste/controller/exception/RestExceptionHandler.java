package com.example.api_teste.controller.exception; // Ou o pacote de sua preferência para handlers

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice // Indica que esta classe irá aconselhar múltiplos controllers
public class RestExceptionHandler extends ResponseEntityExceptionHandler {

    // Classe interna para padronizar o corpo do erro
    // Pode ser movida para um arquivo separado se preferir
    private static class ApiError {
        private LocalDateTime timestamp;
        private int status;
        private String error; // Ex: "Not Found", "Bad Request"
        private String message;
        private String path;
        private Map<String, String> validationErrors; // Para erros de validação

        public ApiError(HttpStatus status, String message, WebRequest request) {
            this.timestamp = LocalDateTime.now();
            this.status = status.value();
            this.error = status.getReasonPhrase();
            this.message = message;
            this.path = request.getDescription(false).replace("uri=", "");
        }

        // Getters e Setters (Lombok @Data também funcionaria aqui)
        public LocalDateTime getTimestamp() { return timestamp; }
        public int getStatus() { return status; }
        public String getError() { return error; }
        public String getMessage() { return message; }
        public String getPath() { return path; }
        public Map<String, String> getValidationErrors() { return validationErrors; }
        public void setValidationErrors(Map<String, String> validationErrors) { this.validationErrors = validationErrors; }
    }

    /**
     * Handler para EntityNotFoundException.
     * Retorna 404 Not Found.
     */
    @ExceptionHandler(EntityNotFoundException.class)
    protected ResponseEntity<Object> handleEntityNotFound(
            EntityNotFoundException ex, WebRequest request) {
        ApiError apiError = new ApiError(HttpStatus.NOT_FOUND, ex.getMessage(), request);
        return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
    }

    /**
     * Handler para MethodArgumentNotValidException (erros de validação do @Valid).
     * Sobrescreve o método de ResponseEntityExceptionHandler para customizar a resposta.
     * Retorna 400 Bad Request.
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {

        ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST, "Erro de validação", request);

        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));
        apiError.setValidationErrors(errors);

        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handler genérico para outras exceções não tratadas especificamente.
     * Retorna 500 Internal Server Error.
     * É uma boa prática logar essas exceções.
     */
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<Object> handleAllUncaughtException(
            Exception ex, WebRequest request) {
        logger.error("Erro inesperado na aplicação: ", ex); // Loga a exceção completa
        ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Ocorreu um erro interno no servidor.", request);
        return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Você pode adicionar outros @ExceptionHandler para exceções específicas que sua aplicação possa lançar,
    // como DataIntegrityViolationException (para violações de constraint do banco), etc.
}