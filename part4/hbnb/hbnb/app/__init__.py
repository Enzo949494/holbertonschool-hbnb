from flask import Flask
from flask_restx import Api
from flask_cors import CORS  # Ajoutez cette importation en haut du fichier avec les autres importations
from app.persistence.repository import SQLAlchemyRepository  # Import the new repository class
from app.extensions import db, bcrypt, jwt  # Use extensions for database and authentication
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.auth import api as auth_ns
from app.api.v1.protector import api as protected_ns


def create_app(config_class="config.DevelopmentConfig"):
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configuration CORS explicite pour l'authentification
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",  # Ou spécifiez votre origine frontend
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Load the configuration
    app.config.from_object(config_class)

    # Secret key for JWT (already present in your code)
    app.config['JWT_SECRET_KEY'] = 'your-secret-key'
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        # Database tables will be created later (next task)
        db.create_all()

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

    # Register the namespaces (already present in your code)
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(auth_ns, path='/api/v1/auth')
    api.add_namespace(protected_ns, path='/api/v1/protector')

    # Initialize JWT again (already present in your code)
    jwt.init_app(app)

    return app
