#!/usr/bin/env python3
"""Script para criar tabelas manualmente sem usar Alembic"""

from sqlalchemy import create_engine, text
import sys
import os

# URL de conexão direta
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/gestor_tarefas"

def create_tables():
    try:
        engine = create_engine(DATABASE_URL, echo=True)

        # SQL para criar tabelas básicas
        create_sql = """
        -- Criar tabela de usuários
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Criar tabela de contratos
        CREATE TABLE IF NOT EXISTS contracts (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            contract_type VARCHAR(50) NOT NULL,
            client_name VARCHAR(255),
            start_date DATE,
            end_date DATE,
            total_value NUMERIC(15,2),
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Inserir dados de teste
        INSERT INTO users (username, email, hashed_password)
        VALUES ('admin', 'admin@test.com', '$2b$12$dummy_hash')
        ON CONFLICT (username) DO NOTHING;
        """

        with engine.connect() as connection:
            connection.execute(text(create_sql))
            connection.commit()
            print("✓ Tabelas criadas com sucesso!")

    except Exception as e:
        print(f"✗ Erro ao criar tabelas: {e}")
        return False

    return True

if __name__ == "__main__":
    success = create_tables()
    sys.exit(0 if success else 1)