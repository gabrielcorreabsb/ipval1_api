# API RESTful - Sistema de Gestão para Igreja

API REST desenvolvida para gestão de atividades da igreja, implementando funcionalidades como controle de usuários, agenda de eventos, sistema de notícias e gerenciamento de membros. Desenvolvida com Spring Boot, utilizando servidor Nginx, deploy com Docker em servidor Ubuntu arm64 e proxy reverso.

## 🚀 Tecnologias Utilizadas

### Backend
* Java 21
* Spring Boot 3
* Spring Security com JWT
* Spring Data JPA
* PostgreSQL
* Maven
* Docker
* Nginx (Proxy Reverso)

### Frontend
* HTML5
* CSS3
* JavaScript
* Bootstrap
* SweetAlert2

## 🛠️ Funcionalidades Implementadas

### Gestão de Usuários
* Autenticação e Autorização com JWT
* Controle de Níveis de Acesso (PASTOR, BOASVINDAS, SAF, UPH, OUTROS)
* Bloqueio de conta após tentativas falhas de login
* CRUD completo de usuários
* Registro de data de criação e último acesso

### Agenda de Eventos
* Criação e gestão de eventos
* Visualização em calendário
* Filtro por período
* Detalhes do local e descrição do evento
* Validação de datas

### Sistema de Notícias
* Publicação de notícias com aprovação
* Sistema de moderação (aprovação por PASTOR)
* Listagem de notícias pendentes e aprovadas
* CRUD completo de notícias

### Gestão de Membros
* Cadastro completo de membros
* Informações de contato
* Histórico de participação
* Exportação de dados para CSV

## 📋 Pré-requisitos

* Java JDK 21
* Maven 3.8+
* PostgreSQL 15+
* Docker e Docker Compose
* IDE (Eclipse, IntelliJ IDEA ou VS Code)
* Git
