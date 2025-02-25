package com.example.api_teste.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private final Logger logger = LoggerFactory.getLogger(TestController.class);

    @GetMapping
    public String test() {
        logger.info("Test endpoint called");
        return "API is working!";
    }
}