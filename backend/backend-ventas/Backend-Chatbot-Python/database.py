import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "vertiche_ventas"),
        autocommit=False,
    )

def execute_query(sql: str) -> list[dict]:
    """Ejecuta una query SELECT y regresa lista de dicts. Solo lectura."""
    sql_clean = sql.strip().rstrip(";")

    # Seguridad: solo permitir SELECT
    first_word = sql_clean.split()[0].upper()
    if first_word not in ("SELECT", "WITH"):
        raise ValueError("Solo se permiten queries SELECT o WITH.")

    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql_clean)
        rows = cursor.fetchmany(200)  # máximo 200 filas
        return rows
    finally:
        cursor.close()
        conn.close()
