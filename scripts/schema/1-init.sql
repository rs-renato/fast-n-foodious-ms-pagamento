-- Criação de banco de dados
CREATE DATABASE IF NOT EXISTS FAST_N_FOODIOUS;

-- Configuração de permissão para usuário da aplicação
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, REFERENCES ON FAST_N_FOODIOUS.* TO 'fnf_user'@'%';
FLUSH PRIVILEGES;

USE FAST_N_FOODIOUS;

--
-- CRIAÇÃO DE TABELAS
--

-- Tabela PAGAMENTO
CREATE TABLE IF NOT EXISTS PAGAMENTO (
                                       ID INT AUTO_INCREMENT PRIMARY KEY,
                                       PEDIDO_ID INT NOT NULL,
                                       TRANSACAO_ID VARCHAR(255) NOT NULL,
                                       ESTADO_PAGAMENTO INT NOT NULL,
                                       TOTAL DECIMAL(8,2) NOT NULL,
                                       DATA_HORA_PAGAMENTO DATETIME NULL
);
