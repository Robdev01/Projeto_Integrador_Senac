from flask import Blueprint, request, jsonify
from src.controller import (
    cadastrar_usuario,
    autenticar_usuario,
    obter_tarefas,
    criar_tarefa,
    atualizar_tarefa_por_id,
    criar_setor,
    obter_setores
)

rotas = Blueprint('rotas', __name__)


@rotas.route('/usuarios/cadastrar', methods=['POST'])
def rota_cadastrar_usuario():
    """Cadastra um novo usuário."""
    return cadastrar_usuario(request.get_json())


@rotas.route('/usuarios/login', methods=['POST'])
def rota_autenticar_usuario():
    """Autentica um usuário e retorna um token JWT."""
    return autenticar_usuario(request.get_json())


@rotas.route('/tarefas', methods=['GET'])
def rota_listar_tarefas():
    """Lista tarefas com filtros opcionais."""
    filtros = {
        "status": request.args.get("status"),
        "prioridade": request.args.get("prioridade"),
        "funcionario": request.args.get("funcionario"),
        "id_setor": request.args.get("id_setor"),
        "busca": request.args.get("busca")
    }
    tarefas = obter_tarefas(filtros)
    return jsonify(tarefas), 200


@rotas.route('/tarefas', methods=['POST'])
def rota_criar_tarefa():
    """Cria uma nova tarefa."""
    dados = request.get_json()
    resultado = criar_tarefa(dados)
    return jsonify(resultado), 201


@rotas.route('/tarefas/<int:id_tarefa>', methods=['PUT'])
def rota_atualizar_tarefa(id_tarefa):
    """Atualiza uma tarefa existente."""
    dados = request.get_json()
    resultado = atualizar_tarefa_por_id(id_tarefa, dados)
    return jsonify(resultado), 200


@rotas.route('/setores', methods=['POST'])
def rota_criar_setor():
    """Cria um novo setor."""
    dados = request.get_json()
    resultado = criar_setor(dados)
    return jsonify(resultado), 201


@rotas.route('/setores', methods=['GET'])
def rota_listar_setores():
    """Lista todos os setores ativos."""
    setores = obter_setores()
    return jsonify(setores), 200