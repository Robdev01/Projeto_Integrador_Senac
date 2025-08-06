from werkzeug.security import generate_password_hash, check_password_hash
from src.models import inserir_usuario, buscar_usuario_por_email, listar_tarefas_db, inserir_tarefa_db, \
    atualizar_tarefa_db
from flask import jsonify, request
import jwt
from datetime import datetime, timedelta
from src.config import senha_forte


SECRET_KEY = senha_forte

def cadastrar_usuario(data):
    nome = data.get("nome")
    email = data.get("email")
    senha = data.get("senha")
    perfil = data.get("perfil")
    ativo = data.get("ativo", 1)  # default 1 se não informado

    if not email or not nome or not senha:
        return jsonify({"error": "Email, nome e senha são obrigatórios"}), 400

    if buscar_usuario_por_email(email):
        return jsonify({"error": "Usuário com esse Email já existe"}), 400

    # Gerar o hash da senha
    senha_hash = generate_password_hash(senha)

    try:
        inserir_usuario(nome, email, senha_hash, perfil, ativo)
        return jsonify({"message": "Usuário cadastrado com sucesso"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def login_usuario(data):
    email = data.get("email")
    senha = data.get("senha")

    if not email or not senha:
        return jsonify({"error": "Email e senha são obrigatórios"}), 400

    usuario = buscar_usuario_por_email(email)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404

    # Verificar a senha usando check_password_hash
    if not check_password_hash(usuario["senha_hash"], senha):
        return jsonify({"error": "Senha incorreta"}), 403

    # Criar o token JWT
    token_payload = {
        "email": usuario["email"],
        "exp": datetime.utcnow() + timedelta(hours=1)  # token válido por 1 hora
    }
    token = jwt.encode(token_payload, SECRET_KEY, algorithm="HS256")

    return jsonify({
        "message": "Login realizado com sucesso",
        "token": token,
        "usuario": {
            "nome": usuario.get("nome"),
            "perfil": usuario.get("perfil"),
            "ativo": usuario.get("ativo")
        }
    }), 200

def listar_tarefas(filtros):
    tarefas = listar_tarefas_db(filtros)
    for tarefa in tarefas:
        tarefa['assigned_user'] = {'name': f'Funcionário {tarefa["id_funcionario"]}'}
        tarefa['setor'] = {'name': f'Setor {tarefa["id_setor"]}'}
        tarefa['title'] = tarefa['titulo']
        tarefa['description'] = tarefa['descricao']
        tarefa['assigned_to'] = str(tarefa['id_funcionario'])
        tarefa['setor_id'] = str(tarefa['id_setor'])
        tarefa['created_at'] = tarefa['data_criacao'].strftime('%Y-%m-%d')
        tarefa['deadline'] = tarefa['prazo'].strftime('%Y-%m-%d') if tarefa['prazo'] else ''
    return tarefas

def criar_tarefa(data):
    data['data_criacao'] = datetime.now()
    inserir_tarefa_db(data)
    return {"mensagem": "Tarefa criada com sucesso"}

def editar_tarefa(tarefa_id, data):
    atualizar_tarefa_db(tarefa_id, data)
    return {"mensagem": "Tarefa atualizada com sucesso"}
