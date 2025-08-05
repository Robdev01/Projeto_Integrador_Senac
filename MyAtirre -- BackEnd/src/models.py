import pymysql
from src.config import db_config

def inserir_usuario(nome, email, senha_hash, perfil, ativo=1):
    conn = pymysql.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo)
        VALUES (%s, %s, %s, %s, %s)
    """, (nome, email, senha_hash, perfil, ativo))
    conn.commit()
    cursor.close()
    conn.close()

def buscar_usuario_por_email(email):
    conn = pymysql.connect(**db_config)
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()
    return usuario