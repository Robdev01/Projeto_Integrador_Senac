import pymysql
from pymysql.cursors import DictCursor
from typing import Dict, Any, List, Optional
from src.config import db_config


def obter_conexao_bd():
    """Cria e retorna uma conexão com o banco de dados."""
    return pymysql.connect(**db_config, cursorclass=DictCursor)


def inserir_usuario(nome: str, email: str, senha_hash: str, perfil: str, ativo: bool = True) -> None:
    """
    Insere um novo usuário no banco de dados.

    Args:
        nome: Nome do usuário.
        email: Email do usuário.
        hash_senha: Senha hasheada.
        perfil: Perfil/papel do usuário.
        ativo: Indica se o usuário está ativo (padrão: True).
    """
    with obter_conexao_bd() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (nome, email, senha_hash, perfil, ativo)
            )
        conn.commit()


def buscar_usuario_por_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Busca um usuário pelo email.

    Args:
        email: Email do usuário.

    Returns:
        Dicionário com os dados do usuário ou None se não encontrado.
    """
    with obter_conexao_bd() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
            return cursor.fetchone()


def listar_tarefas(filtros: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Lista tarefas com base nos filtros fornecidos.

    Args:
        filtros: Dicionário com filtros opcionais (status, prioridade, funcionario, id_setor, busca).

    Returns:
        Lista de dicionários com tarefas.
    """
    consulta = "SELECT * FROM tarefas WHERE 1=1"
    params = []

    if filtros.get("status") and filtros["status"] != "todos":
        consulta += " AND status = %s"
        params.append(filtros["status"])

    if filtros.get("prioridade") and filtros["prioridade"] != "todos":
        consulta += " AND prioridade = %s"
        params.append(filtros["prioridade"])

    if filtros.get("funcionario") and filtros["funcionario"] != "todos":
        consulta += " AND funcionario = %s"
        params.append(filtros["funcionario"])

    if filtros.get("id_setor") and filtros["id_setor"] != "todos":
        consulta += " AND id_setor = %s"
        params.append(filtros["id_setor"])

    if filtros.get("busca"):
        consulta += " AND (LOWER(titulo) LIKE %s OR LOWER(descricao) LIKE %s)"
        termo_busca = f"%{filtros['busca'].lower()}%"
        params.extend([termo_busca, termo_busca])

    with obter_conexao_bd() as conn:
        with conn.cursor() as cursor:
            cursor.execute(consulta, params)
            return cursor.fetchall()


def inserir_tarefa(tarefa: Dict[str, Any]) -> None:
    """
    Insere uma nova tarefa no banco de dados.

    Args:
        tarefa: Dicionário com os dados da tarefa.
    """
    with obter_conexao_bd() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO tarefas (titulo, descricao, funcionario, setor, data_criacao, prazo, prioridade, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    tarefa["titulo"],
                    tarefa["descricao"],
                    tarefa["funcionario"],
                    tarefa["setor"],
                    tarefa["data_criacao"],
                    tarefa["prazo"],
                    tarefa["prioridade"],
                    tarefa["status"]
                )
            )
        conn.commit()


def atualizar_tarefa(id_tarefa: int, tarefa: Dict[str, Any]) -> None:
    """
    Atualiza uma tarefa existente no banco de dados.

    Args:
        id_tarefa: ID da tarefa a ser atualizada.
        tarefa: Dicionário com os dados atualizados da tarefa.
    """
    with obter_conexao_bd() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE tarefas
                SET titulo = %s, descricao = %s, funcionario = %s, setor = %s,
                    prazo = %s, prioridade = %s, status = %s
                WHERE id = %s
                """,
                (
                    tarefa["titulo"],
                    tarefa["descricao"],
                    tarefa["funcionario"],
                    tarefa["setor"],
                    tarefa["prazo"],
                    tarefa["prioridade"],
                    tarefa["status"],
                    id_tarefa
                )
            )
        conn.commit()


def inserir_setor(setor: Dict[str, Any]) -> None:
    """
    Insere um novo setor no banco de dados.

    Args:
        setor: Dicionário com os dados do setor.
    """
    with obter_conexao_bd() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO setores (nome, ativo, data_criacao)
                VALUES (%s, %s, %s)
                """,
                (
                    setor["nome"],
                    setor.get("ativo", True),
                    setor["data_criacao"]
                )
            )
        conn.commit()


def listar_setores() -> List[Dict[str, Any]]:
    """
    Lista todos os setores ativos.

    Returns:
        Lista de dicionários com setores.
    """
    with obter_conexao_bd() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM setores WHERE ativo = 1")
            return cursor.fetchall()