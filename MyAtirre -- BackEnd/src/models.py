import pymysql
from pymysql.cursors import DictCursor
from typing import Dict, Any, List, Optional
from src.config import db_config
import traceback


def cadastrar_usuarios(data: Dict[str, Any]) -> None:
    try:
        # Estabelecendo a conexão com o banco de dados
        conn = pymysql.connect(**db_config)  # Usando db_config para a conexão
        cursor = conn.cursor()

        # Query para inserir dados do usuário
        query = """
            INSERT INTO usuarios (nome, email, senha_hash, perfil, setor, ativo)
            VALUES (%s, %s, %s, %s, %s, %s)
        """

        # Valores a serem inseridos
        valores_user = (
            data['nome'],
            data['email'],
            data['senha_hash'],
            data['perfil'],
            data['setor'],
            data['ativo']
        )

        # Executando a query de inserção
        cursor.execute(query, valores_user)

        # Commitando a transação
        conn.commit()
    except Exception as e:
        print(f"Erro ao cadastrar usuário: {str(e)}")  # Adiciona um print para verificar o erro no servidor
        raise
    finally:
        # Fechando o cursor e a conexão, independentemente de erro
        cursor.close()
        conn.close()



def atualizar_senha(data: Dict[str, Any]) -> None:
    try:
        # Estabelecendo a conexão com o banco de dados
        conn = pymysql.connect(**db_config)  # Usando db_config para a conexão

        # Criando um cursor para execução das queries
        cursor = conn.cursor()

        # Query para atualizar a senha do usuário
        query = """
            UPDATE usuarios
            SET senha_hash = %s
            WHERE id = %s
        """

        # Valores a serem atualizados
        valores_user = (
            data['senha_hash'],  # nova senha (já deve ser hasheada)
            data['id']  # id do usuário a ser atualizado
        )

        # Executando a query de atualização
        cursor.execute(query, valores_user)

        # Commitando a transação
        conn.commit()
    except Exception as e:
        # Tratando erros e imprimindo a traceback
        print(f"Erro ao atualizar senha: {str(e)}\n{traceback.format_exc()}")
        raise
    finally:
        # Fechando o cursor e a conexão, independentemente de erro
        cursor.close()
        conn.close()


def listar_usuarios() -> List[Dict]:
    try:
        # Estabelecendo a conexão com o banco de dados
        conn = pymysql.connect(**db_config)  # Usando db_config para a conexão

        # Criando um cursor para execução das queries
        cursor = conn.cursor(DictCursor)

        # Query para listar todos os usuários
        query = "SELECT id, nome, email, perfil, ativo, criado_em, setor FROM usuarios"

        # Executando a query
        cursor.execute(query)

        # Buscando todos os resultados
        usuarios = cursor.fetchall()

        return usuarios
    except Exception as e:
        print(f"Erro ao listar usuários: {str(e)}")
        raise
    finally:
        # Fechando o cursor e a conexão, independentemente de erro
        cursor.close()
        conn.close()


def listar_usuario_por_email(email: str) -> Optional[Dict]:
    try:
        # Estabelecendo a conexão com o banco de dados
        conn = pymysql.connect(**db_config)  # Usando db_config para a conexão

        # Criando um cursor para execução das queries
        cursor = conn.cursor(DictCursor)

        # Query para buscar um usuário por e-mail
        query = "SELECT id, nome, email, senha_hash, perfil, ativo, criado_em, setor FROM usuarios WHERE email = %s"

        # Executando a query com o e-mail como parâmetro
        cursor.execute(query, (email,))

        # Buscando o resultado
        usuario = cursor.fetchone()

        return usuario
    except Exception as e:
        print(f"Erro ao listar usuário por e-mail: {str(e)}")
        raise
    finally:
        # Fechando o cursor e a conexão, independentemente de erro
        cursor.close()
        conn.close()

# Função para cadastrar um novo setor
def cadastrar_setor(data: Dict[str, Any]) -> None:
    try:
        # Estabelecendo a conexão com o banco de dados
        conn = pymysql.connect(**db_config)  # Usando db_config para a conexão
        cursor = conn.cursor()

        # Query para inserir dados do setor
        query = """
            INSERT INTO setores (nome, data_criacao)
            VALUES (%s, NOW())  -- A data de criação será automaticamente preenchida com o timestamp atual
        """

        # Valores a serem inseridos
        valores_setor = (data['nome'],)

        # Executando a query de inserção
        cursor.execute(query, valores_setor)

        # Commitando a transação
        conn.commit()
    except Exception as e:
        print(f"Erro ao cadastrar setor: {str(e)}\n{traceback.format_exc()}")
        raise
    finally:
        # Fechando o cursor e a conexão, independentemente de erro
        cursor.close()
        conn.close()


# Função para listar todos os setores cadastrados
def listar_setores() -> list:
    try:
        # Estabelecendo a conexão com o banco de dados
        conn = pymysql.connect(**db_config)  # Usando db_config para a conexão
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        # Query para listar todos os setores
        query = "SELECT nome, data_criacao FROM setores"

        # Executando a query
        cursor.execute(query)

        # Buscando todos os resultados
        setores = cursor.fetchall()

        return setores
    except Exception as e:
        print(f"Erro ao listar setores: {str(e)}")
        raise
    finally:
        # Fechando o cursor e a conexão, independentemente de erro
        cursor.close()
        conn.close()


def cadastrar_tarefa(data: Dict[str, Any]) -> int:
    """
    Insere uma tarefa e retorna o ID gerado.
    Campos esperados: titulo, descricao, funcionario, setor, data_criacao, prazo, prioridade, status
    """
    conn = None
    cursor = None
    try:
        conn = pymysql.connect(**db_config)
        cursor = conn.cursor()
        query = """
            INSERT INTO tarefas (titulo, descricao, funcionario, setor, data_criacao, prazo, prioridade, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        valores = (
            data.get('titulo'),
            data.get('descricao'),
            data.get('funcionario'),
            data.get('setor'),
            data.get('data_criacao'),  # pode ser None; se na tabela tiver default NOW(), deixe None
            data.get('prazo'),
            data.get('prioridade'),
            data.get('status'),
        )
        cursor.execute(query, valores)
        conn.commit()
        return cursor.lastrowid
    except Exception as e:
        print(f"Erro ao cadastrar tarefa: {str(e)}\n{traceback.format_exc()}")
        raise
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def listar_tarefas() -> List[Dict[str, Any]]:
    conn = None
    cursor = None
    try:
        conn = pymysql.connect(**db_config)
        cursor = conn.cursor(DictCursor)
        query = """
            SELECT id, titulo, descricao, funcionario, setor, data_criacao, prazo, prioridade, status
            FROM tarefas
            ORDER BY id DESC
        """
        cursor.execute(query)
        return cursor.fetchall()
    except Exception as e:
        print(f"Erro ao listar tarefas: {str(e)}\n{traceback.format_exc()}")
        raise
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def listar_tarefa_por_id(tarefa_id: int) -> Optional[Dict[str, Any]]:
    conn = None
    cursor = None
    try:
        conn = pymysql.connect(**db_config)
        cursor = conn.cursor(DictCursor)
        query = """
            SELECT id, titulo, descricao, funcionario, setor, data_criacao, prazo, prioridade, status
            FROM tarefas
            WHERE id = %s
        """
        cursor.execute(query, (tarefa_id,))
        return cursor.fetchone()
    except Exception as e:
        print(f"Erro ao buscar tarefa: {str(e)}\n{traceback.format_exc()}")
        raise
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def atualizar_tarefa(tarefa_id: int, data: Dict[str, Any]) -> None:
    """
    Atualiza apenas os campos enviados em `data`.
    """
    conn = None
    cursor = None
    try:
        if not data:
            return
        campos = []
        valores = []
        for campo in ["titulo", "descricao", "funcionario", "setor", "data_criacao", "prazo", "prioridade", "status"]:
            if campo in data and data[campo] is not None:
                campos.append(f"{campo} = %s")
                valores.append(data[campo])

        if not campos:
            return

        valores.append(tarefa_id)

        conn = pymysql.connect(**db_config)
        cursor = conn.cursor()
        query = f"UPDATE tarefas SET {', '.join(campos)} WHERE id = %s"
        cursor.execute(query, tuple(valores))
        conn.commit()
    except Exception as e:
        print(f"Erro ao atualizar tarefa: {str(e)}\n{traceback.format_exc()}")
        raise
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


def deletar_tarefa(tarefa_id: int) -> None:
    conn = None
    cursor = None
    try:
        conn = pymysql.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tarefas WHERE id = %s", (tarefa_id,))
        conn.commit()
    except Exception as e:
        print(f"Erro ao deletar tarefa: {str(e)}\n{traceback.format_exc()}")
        raise
    finally:
        if cursor: cursor.close()
        if conn: conn.close()