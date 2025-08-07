from werkzeug.security import generate_password_hash, check_password_hash
from flask import jsonify
from datetime import datetime, timedelta
import jwt
from typing import Dict, Any, List, Optional
from src.models import (
    inserir_usuario,
    buscar_usuario_por_email,
    listar_tarefas,
    inserir_tarefa,
    atualizar_tarefa,
    inserir_setor,
    listar_setores
)
from src.config import senha_forte


def cadastrar_usuario(dados: Dict[str, Any]) -> tuple[Dict[str, Any], int]:
    """
    Cadastra um novo usuário no sistema.

    Args:
        dados: Dicionário com os dados do usuário (nome, email, senha, perfil, ativo).

    Returns:
        Tupla contendo a resposta JSON e o código de status HTTP.
    """
    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")
    perfil = dados.get("perfil")
    ativo = dados.get("ativo", True)

    if not all([email, nome, senha]):
        return jsonify({"erro": "Nome, email e senha são obrigatórios"}), 400

    if buscar_usuario_por_email(email):
        return jsonify({"erro": "Usuário com este email já existe"}), 400

    try:
        senha_hash = generate_password_hash(senha)
        inserir_usuario(nome, email, senha_hash, perfil, ativo)
        return jsonify({"mensagem": "Usuário cadastrado com sucesso"}), 201
    except Exception as e:
        return jsonify({"erro": f"Falha ao cadastrar usuário: {str(e)}"}), 500


def autenticar_usuario(dados: Dict[str, Any]) -> tuple[Dict[str, Any], int]:
    """
    Autentica um usuário e gera um token JWT.

    Args:
        dados: Dicionário com email e senha.

    Returns:
        Tupla contendo a resposta JSON com token e informações do usuário, e o código de status HTTP.
    """
    email = dados.get("email")
    senha = dados.get("senha")

    if not all([email, senha]):
        return jsonify({"erro": "Email e senha são obrigatórios"}), 400

    usuario = buscar_usuario_por_email(email)
    if not usuario:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    if not check_password_hash(usuario["senha_hash"], senha):
        return jsonify({"erro": "Senha inválida"}), 403

    token_dados = {
        "email": usuario["email"],
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(token_dados, senha_forte, algorithm="HS256")

    return jsonify({
        "mensagem": "Login realizado com sucesso",
        "token": token,
        "usuario": {
            "nome": usuario["nome"],
            "perfil": usuario["perfil"],
            "ativo": usuario["ativo"]
        }
    }), 200


def obter_tarefas(filtros: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Obtém tarefas com base nos filtros fornecidos.

    Args:
        filtros: Dicionário com filtros opcionais (status, prioridade, funcionario, id_setor, busca).

    Returns:
        Lista de dicionários com tarefas formatadas.
    """
    tarefas = listar_tarefas(filtros)
    tarefas_formatadas = []

    for tarefa in tarefas:
        tarefa_formatada = {
            "id": tarefa["id"],
            "titulo": tarefa.get("titulo", ""),
            "descricao": tarefa.get("descricao", ""),
            "nome_funcionario": tarefa.get("funcionario", ""),
            "nome_setor": tarefa.get("setor", ""),
            "data_criacao": tarefa["data_criacao"].strftime('%Y-%m-%d') if tarefa.get("data_criacao") else "",
            "prazo": tarefa["prazo"].strftime('%Y-%m-%d') if tarefa.get("prazo") else "",
            "status": tarefa.get("status", ""),
            "prioridade": tarefa.get("prioridade", ""),
            "funcionario": {"nome": tarefa.get("funcionario", "")},
            "setor": {"nome": tarefa.get("setor", "")}
        }
        tarefas_formatadas.append(tarefa_formatada)

    return tarefas_formatadas


def criar_tarefa(dados: Dict[str, Any]) -> Dict[str, str]:
    """
    Cria uma nova tarefa.

    Args:
        dados: Dicionário com os dados da tarefa.

    Returns:
        Dicionário com mensagem de sucesso.
    """
    dados["data_criacao"] = datetime.now()
    inserir_tarefa(dados)
    return {"mensagem": "Tarefa criada com sucesso"}


def atualizar_tarefa_por_id(id_tarefa: int, dados: Dict[str, Any]) -> Dict[str, str]:
    """
    Atualiza uma tarefa existente.

    Args:
        id_tarefa: ID da tarefa a ser atualizada.
        dados: Dicionário com os dados atualizados da tarefa.

    Returns:
        Dicionário com mensagem de sucesso.
    """
    atualizar_tarefa(id_tarefa, dados)
    return {"mensagem": "Tarefa atualizada com sucesso"}


def criar_setor(dados: Dict[str, Any]) -> Dict[str, str]:
    """
    Cria um novo setor.

    Args:
        dados: Dicionário com os dados do setor.

    Returns:
        Dicionário com mensagem de sucesso.
    """
    dados["data_criacao"] = datetime.now()
    inserir_setor(dados)
    return {"mensagem": "Setor criado com sucesso"}


def obter_setores() -> List[Dict[str, Any]]:
    """
    Obtém todos os setores ativos.

    Returns:
        Lista de dicionários com setores formatados.
    """
    setores = listar_setores()
    return [
        {
            "id": setor["id"],
            "nome": setor.get("nome", ""),
            "ativo": setor.get("ativo", False)
        }
        for setor in setores
    ]