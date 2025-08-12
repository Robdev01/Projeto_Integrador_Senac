from typing import Dict, Any
import bcrypt
import jwt
from datetime import datetime, timedelta
from flask import jsonify, request
from src.models import cadastrar_usuarios, atualizar_senha, listar_usuarios, listar_usuario_por_email, listar_setores, \
    cadastrar_setor, cadastrar_tarefa, listar_tarefas, listar_tarefa_por_id, atualizar_tarefa, deletar_tarefa
from src.config import db_config, senha_forte  # jwt_secret_key é a chave secreta para o JWT
from datetime import datetime

# Função para gerar o token JWT
def gerar_token(usuario_id: int, email: str):
    payload = {
        "sub": usuario_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=1)  # Token expira em 1 hora
    }
    token = jwt.encode(payload, senha_forte, algorithm='HS256')
    return token

def cadastrar_usuario(data):
    nome = data.get("nome")
    email = data.get("email")
    senha = data.get("senha")
    perfil = data.get("perfil", "usuario")
    setor = data.get("setor")
    ativo = data.get("ativo", True)

    if not nome or not email or not senha:
        return jsonify({"error": "Nome, email e senha são obrigatórios"}), 400

    # Verifica se o usuário já existe com o mesmo e-mail
    if listar_usuario_por_email(email):
        return jsonify({"error": "Usuário com esse e-mail já existe"}), 400

    # Hash da senha usando bcrypt
    senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt())

    try:
        # Chama a função para cadastrar o usuário com a senha criptografada
        data['senha_hash'] = senha_hash.decode('utf-8')  # bcrypt retorna em bytes, precisamos decodificar
        cadastrar_usuarios(data)

        # Gerar token JWT após o cadastro (opcional, pode ser usado no login)
        token = gerar_token(data.get("id"), email)

        return jsonify({
            "message": "Usuário cadastrado com sucesso",
            "token": token  # Retorna o token JWT
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def atualizar_senha_usuario(data):
    id_usuario = data.get("id")
    senha_atual = data.get("senha_atual")
    nova_senha = data.get("nova_senha")

    if not id_usuario or not senha_atual or not nova_senha:
        return jsonify({"error": "Dados incompletos"}), 400

    # Verifica se o usuário existe
    usuario = listar_usuario_por_email(data.get("email"))
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404

    if not bcrypt.checkpw(senha_atual.encode('utf-8'), usuario["senha_hash"].encode('utf-8')):
        return jsonify({"error": "Senha atual incorreta"}), 403

    # Hash da nova senha
    nova_senha_hash = bcrypt.hashpw(nova_senha.encode('utf-8'), bcrypt.gensalt())

    try:
        # Chama a função para atualizar a senha no banco
        data['senha_hash'] = nova_senha_hash.decode('utf-8')  # Atualiza com a nova senha hash
        atualizar_senha(data)
        return jsonify({"message": "Senha alterada com sucesso"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def listar_todos_usuarios():
    try:
        usuarios = listar_usuarios()  # Chama o model para listar os usuários
        return jsonify(usuarios), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def listar_usuario_por_email_controller(email: str):
    try:
        usuario = listar_usuario_por_email(email)  # Chama o model para buscar por e-mail
        if usuario:
            return jsonify(usuario), 200
        else:
            return jsonify({"error": "Usuário não encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def login_usuario(data):
    email = data.get("email")
    senha = data.get("senha")

    if not email or not senha:
        return jsonify({"error": "Email e senha são obrigatórios"}), 400

    usuario = listar_usuario_por_email(email)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404

    if not bcrypt.checkpw(senha.encode('utf-8'), usuario["senha_hash"].encode('utf-8')):
        return jsonify({"error": "Senha incorreta"}), 403

    # Gerar token JWT após login
    token = gerar_token(usuario['id'], email)
    return jsonify({
        "message": "Login bem-sucedido",
        "token": token,
        "usuario": {
            "email": usuario['email'],
            "nome": usuario['nome'],
            "role": usuario['perfil'],
            "setor": usuario['setor'],
            "ativo": usuario['ativo']
        }
    }), 200


def cadastrar_setor_controller(data: Dict):
    nome = data.get("nome")

    if not nome:
        return jsonify({"error": "Nome do setor é obrigatório"}), 400

    try:
        # Chama a função para cadastrar o setor
        data['nome'] = nome
        cadastrar_setor(data)

        # Retorno de sucesso
        return jsonify({
            "message": "Setor cadastrado com sucesso"
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Função para listar os setores
def listar_setores_controller():
    try:
        setores = listar_setores()

        if not setores:
            return jsonify({"message": "Nenhum setor encontrado"}), 404

        return jsonify(setores), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def validar_payload_tarefa(data: Dict[str, Any], create: bool = True):
    obrigatorios = ["titulo", "setor"]
    faltando = [c for c in obrigatorios if create and not data.get(c)]
    if faltando:
        return f"Campos obrigatórios ausentes: {', '.join(faltando)}"
    return None

def cadastrar_tarefa_controller(data: Dict[str, Any]):
    erro = validar_payload_tarefa(data, create=True)
    if erro:
        return jsonify({"error": erro}), 400
    try:
        novo_id = cadastrar_tarefa(data)
        tarefa = listar_tarefa_por_id(novo_id)
        return jsonify({"message": "Tarefa cadastrada com sucesso", "tarefa": tarefa}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def listar_tarefas_controller():
    try:
        return jsonify(listar_tarefas()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def listar_tarefa_por_id_controller(tarefa_id: int):
    try:
        tarefa = listar_tarefa_por_id(tarefa_id)
        if not tarefa:
            return jsonify({"error": "Tarefa não encontrada"}), 404
        return jsonify(tarefa), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def atualizar_tarefa_controller(tarefa_id: int, data: Dict[str, Any]):
    try:
        if not listar_tarefa_por_id(tarefa_id):
            return jsonify({"error": "Tarefa não encontrada"}), 404
        atualizar_tarefa(tarefa_id, data)
        tarefa = listar_tarefa_por_id(tarefa_id)
        return jsonify({"message": "Tarefa atualizada com sucesso", "tarefa": tarefa}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def deletar_tarefa_controller(tarefa_id: int):
    try:
        if not listar_tarefa_por_id(tarefa_id):
            return jsonify({"error": "Tarefa não encontrada"}), 404
        deletar_tarefa(tarefa_id)
        return jsonify({"message": "Tarefa excluída com sucesso"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500