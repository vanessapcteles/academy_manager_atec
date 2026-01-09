CREATE DATABASE IF NOT EXISTS atec_secretaria;
USE atec_secretaria;

CREATE TABLE IF NOT EXISTS utilizadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    tipo_utilizador VARCHAR(50) NOT NULL,
    activation_token VARCHAR(255),
    is_active BOOLEAN DEFAULT FALSE,
    auth_provider VARCHAR(50) DEFAULT 'local',
    two_fa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
