from flask import Blueprint, request, jsonify
from src.controller import cadastrar_usuario, login_usuario

routes = Blueprint('routes', __name__)

@routes.route('/cadastrar_usuario', methods=['POST'])
def route_cadastrar_usuario():
    return cadastrar_usuario(request.json)

@routes.route('/login', methods=['POST'])
def rota_login():
    return login_usuario(request.json)
