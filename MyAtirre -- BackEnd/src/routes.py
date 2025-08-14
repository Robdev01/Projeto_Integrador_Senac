from flask import Blueprint, request, jsonify
from src.controller import (
    cadastrar_usuario,
    atualizar_senha_usuario,
    listar_todos_usuarios,
    listar_usuario_por_email_controller,
    login_usuario, cadastrar_setor_controller, listar_setores_controller, cadastrar_tarefa_controller, listar_tarefas_controller,
    listar_tarefa_por_id_controller, atualizar_tarefa_controller,
    deletar_tarefa_controller
)

rotas = Blueprint('rotas', __name__)

# Rota para cadastrar um novo usuário
@rotas.route('/usuarios/cadastrar', methods=['POST'])
def rota_cadastrar_usuario():
    """Cadastra um novo usuário."""
    data = request.get_json()
    return cadastrar_usuario(data)

# Rota para atualizar a senha de um usuário
@rotas.route('/usuarios/atualizar_senha', methods=['PUT'])
def rota_atualizar_senha_usuario():
    """Atualiza a senha de um usuário."""
    data = request.get_json()
    return atualizar_senha_usuario(data)

# Rota para listar todos os usuários
@rotas.route('/usuarios', methods=['GET'])
def rota_listar_usuarios():
    """Lista todos os usuários cadastrados."""
    return listar_todos_usuarios()

# Rota para buscar um usuário específico por e-mail
@rotas.route('/usuarios/email/<string:email>', methods=['GET'])
def rota_listar_usuario_por_email(email):
    """Lista um usuário específico pelo e-mail."""
    return listar_usuario_por_email_controller(email)

# Rota para login de usuário
@rotas.route('/usuarios/login', methods=['POST'])
def rota_login_usuario():
    """Autentica um usuário e retorna um token JWT."""
    data = request.get_json()
    return login_usuario(data)

@rotas.route('/setores', methods=['POST'])
def rota_cadastrar_setor():
    return cadastrar_setor_controller(request.get_json())

# Rota para listar os setores
@rotas.route('/setores', methods=['GET'])
def rota_listar_setores():
    return listar_setores_controller()


# Cadastrar tarefa
@rotas.route('/tarefas', methods=['POST'])
def rota_cadastrar_tarefa():
    return cadastrar_tarefa_controller(request.get_json())

# Listar todas
@rotas.route('/tarefas', methods=['GET'])
def rota_listar_tarefas():
    return listar_tarefas_controller()

# Obter por ID
@rotas.route('/tarefas/<int:tarefa_id>', methods=['GET'])
def rota_obter_tarefa(tarefa_id):
    return listar_tarefa_por_id_controller(tarefa_id)

# Atualizar (parcial ou total)
@rotas.route('/tarefas/<int:tarefa_id>', methods=['PUT'])
def rota_atualizar_tarefa(tarefa_id):
    return atualizar_tarefa_controller(tarefa_id, request.get_json())

# Excluir
@rotas.route('/tarefas/<int:tarefa_id>', methods=['DELETE'])
def rota_deletar_tarefa(tarefa_id):
    return deletar_tarefa_controller(tarefa_id)