from flask import Blueprint, request, jsonify
from src.controller import cadastrar_usuario, login_usuario, listar_tarefas, criar_tarefa, editar_tarefa

routes = Blueprint('routes', __name__)

@routes.route('/cadastrar_usuario', methods=['POST'])
def route_cadastrar_usuario():
    return cadastrar_usuario(request.json)

@routes.route('/login', methods=['POST'])
def rota_login():
    return login_usuario(request.json)

@routes.route('/tarefas', methods=['GET'])
def get_tarefas():
    filtros = {
        "status": request.args.get("status"),
        "prioridade": request.args.get("prioridade"),
        "id_funcionario": request.args.get("id_funcionario"),
        "id_setor": request.args.get("id_setor"),
        "busca": request.args.get("busca")
    }
    tarefas = listar_tarefas(filtros)
    return jsonify(tarefas), 200

@routes.route('/tarefas', methods=['POST'])
def post_tarefa():
    data = request.get_json()
    resultado = criar_tarefa(data)
    return jsonify(resultado), 201

@routes.route('/tarefas/<int:id>', methods=['PUT'])
def put_tarefa(id):
    data = request.get_json()
    resultado = editar_tarefa(id, data)
    return jsonify(resultado), 200