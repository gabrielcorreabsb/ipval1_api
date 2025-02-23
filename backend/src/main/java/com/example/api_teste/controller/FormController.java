package com.example.api_teste.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.core.Authentication;

@Controller
public class FormController {

    @GetMapping("/form")
    public String showForm(Model model, Authentication authentication) {
        // Pega o usuário autenticado
        if (authentication != null) {
            model.addAttribute("username", authentication.getName());
        }
        return "form"; // Isso vai procurar por form.html
    }
}