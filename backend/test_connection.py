import psycopg2
import os

try:
    # Tentar conectar usando as configurações
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="gestor_tarefas",
        user="postgres",
        password="postgres"
    )
    print("Conexao com PostgreSQL bem-sucedida!")
    conn.close()
except Exception as e:
    print(f"Erro na conexao: {e}")