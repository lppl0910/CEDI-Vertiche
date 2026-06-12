"""
Módulo de acceso a la base de datos MySQL del data warehouse de Vertiche.

Provee una conexión configurada desde variables de entorno y una función
de consulta de solo lectura con límite de filas para proteger el rendimiento.
"""

import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()


def get_connection() -> mysql.connector.MySQLConnection:
    """Crea y devuelve una nueva conexión a la base de datos MySQL.

    La conexión lee las credenciales desde variables de entorno (.env).
    autocommit=False porque todas las operaciones son de solo lectura;
    no se requiere control de transacciones explícito.

    Returns:
        mysql.connector.MySQLConnection: Conexión activa lista para usar.
    """
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "vertiche_ventas"),
        autocommit=False,
    )


def execute_query(sql: str) -> list[dict]:
    """Ejecuta una consulta SELECT y devuelve los resultados como lista de diccionarios.

    Solo acepta sentencias SELECT o WITH (CTEs). Cualquier intento de escritura
    (INSERT, UPDATE, DELETE, DROP, etc.) lanza ValueError como medida de seguridad.
    El número de filas retornadas está limitado a 200 para evitar respuestas excesivas.

    Args:
        sql: Consulta SQL a ejecutar. Se eliminan espacios y punto y coma al final.

    Returns:
        Lista de diccionarios donde cada elemento es una fila con columna→valor.

    Raises:
        ValueError: Si la sentencia no comienza con SELECT o WITH.
        mysql.connector.Error: Si ocurre un error de base de datos durante la ejecución.
    """
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
