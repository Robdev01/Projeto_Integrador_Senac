from flask import Flask
from flask_cors import CORS
from src.routes import rotas

app = Flask(__name__)
CORS(app)  # Permite requisições de qualquer origem (http, https, etc.)

app.register_blueprint(rotas)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5050)