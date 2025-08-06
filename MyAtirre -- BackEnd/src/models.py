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

def listar_tarefas_db(filtros):
    conn = pymysql.connect(**db_config)
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    sql = "SELECT * FROM tarefas WHERE 1=1"
    params = []

    if filtros.get("status") and filtros["status"] != "all":
        sql += " AND status = %s"
        params.append(filtros["status"])

    if filtros.get("prioridade") and filtros["prioridade"] != "all":
        sql += " AND prioridade = %s"
        params.append(filtros["prioridade"])

    if filtros.get("id_funcionario") and filtros["id_funcionario"] != "all":
        sql += " AND id_funcionario = %s"
        params.append(filtros["id_funcionario"])

    if filtros.get("id_setor") and filtros["id_setor"] != "all":
        sql += " AND id_setor = %s"
        params.append(filtros["id_setor"])

    if filtros.get("busca"):
        sql += " AND (LOWER(titulo) LIKE %s OR LOWER(descricao) LIKE %s)"
        busca = f"%{filtros['busca'].lower()}%"
        params.extend([busca, busca])

    cursor.execute(sql, params)
    tarefas = cursor.fetchall()

    cursor.close()
    conn.close()
    return tarefas

def inserir_tarefa_db(tarefa):
    conn = pymysql.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO tarefas (titulo, descricao, id_funcionario, id_setor, data_criacao, prazo, prioridade, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        tarefa['titulo'],
        tarefa['descricao'],
        tarefa['id_funcionario'],
        tarefa['id_setor'],
        tarefa['data_criacao'],
        tarefa['prazo'],
        tarefa['prioridade'],
        tarefa['status']
    ))
    conn.commit()
    cursor.close()
    conn.close()

def atualizar_tarefa_db(id, tarefa):
    conn = pymysql.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE tarefas
        SET titulo = %s, descricao = %s, id_funcionario = %s, id_setor = %s,
            prazo = %s, prioridade = %s, status = %s
        WHERE id = %s
    """, (
        tarefa['titulo'],
        tarefa['descricao'],
        tarefa['id_funcionario'],
        tarefa['id_setor'],
        tarefa['prazo'],
        tarefa['prioridade'],
        tarefa['status'],
        id
    ))
    conn.commit()
    cursor.close()
    conn.close()