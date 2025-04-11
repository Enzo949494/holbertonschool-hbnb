from flask import Flask, make_response, redirect, request
from flask_restx import Api
from flask_cors import CORS
from app.persistence.repository import SQLAlchemyRepository
from app.extensions import db, bcrypt, jwt
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.auth import api as auth_ns
from app.api.v1.protector import api as protected_ns
from datetime import timedelta


def create_app(config_class="config.DevelopmentConfig"):
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Load the configuration
    app.config.from_object(config_class)

    # Secret key for JWT
    app.config['JWT_SECRET_KEY'] = 'your-secret-key'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)  # Tokens valides pendant 24h
    app.config['JWT_TOKEN_LOCATION'] = ['headers']  # Chercher le token uniquement dans le header
    app.config['JWT_HEADER_NAME'] = 'Authorization'  # Nom du header contenant le token
    app.config['JWT_HEADER_TYPE'] = 'Bearer'  # Type de token (Bearer)
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        # Database tables will be created
        db.create_all()

    # Gérer la redirection problématique pour /api/v1/places
    @app.route('/api/v1/places', methods=['GET'])
    def places_without_slash():
        return redirect('/api/v1/places/', code=307)  # Redirection temporaire qui préserve la méthode

    # Route spéciale pour gérer les reviews d'une place
    @app.route('/api/v1/places/<place_id>/reviews', methods=['POST', 'OPTIONS'])
    def place_reviews_endpoint(place_id):
        if request.method == 'OPTIONS':
            response = make_response()
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:8080')
            response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 200
        else:
            # Rediriger vers le bon endpoint du namespace reviews
            # Cette route sert principalement à gérer le CORS pour les requêtes POST
            return redirect('/api/v1/reviews', code=307)  # Temporary redirect

    # Route pour gérer les options des reviews
    @app.route('/api/v1/reviews', methods=['OPTIONS'])
    def reviews_options():
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:8080')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200

    # Initialize Flask-RESTX API
    api = Api(
        app,
        version='1.0',
        title='HBNB API',
        description='HBNB Application API',
        doc='/api/v1/',
        authorizations={
            'Bearer': {
                'type': 'apiKey',
                'in': 'header',
                'name': 'Authorization',
                'description': "Type in the *'Value'* input box below: **'Bearer &lt;JWT&gt;'**, where JWT is the token"
            }
        },
        security='Bearer'
    )

    # Register the namespaces
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(auth_ns, path='/api/v1/auth')
    api.add_namespace(protected_ns, path='/api/v1/protector')

    # Configuration CORS globale
    CORS(app, 
         resources={r"/api/*": {
             "origins": "http://localhost:8080",
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
             "supports_credentials": True
         }})

    return app
