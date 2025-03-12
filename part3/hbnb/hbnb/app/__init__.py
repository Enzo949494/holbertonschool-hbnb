from flask import Flask
from flask_restx import Api
from app.persistence.repository import db
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Import models to ensure they are registered with SQLAlchemy
from app.persistence.models.user import User
from app.persistence.models.amenity import Amenity
from app.persistence.models.place import Place
from app.persistence.models.review import Review

db = SQLAlchemy()
bcrypt = Bcrypt()


def create_app(config_class="config.DevelopmentConfig"):
    """Create and configure the Flask application"""
    app = Flask(__name__)

    # Load the configuration
    app.config.from_object(config_class)

    # Initialize the database
    db.init_app(app)
    bcrypt.init_app(app)
    with app.app_context():
        db.create_all()
        print("Database initialized successfully!")  # Add this line
        print("Tables: ", db.engine.table_names())  # Add this line to print table names

    # Initialize Flask-RESTX API
    api = Api(
        app,
        version='1.0',
        title='HBnB API',
        description='HBnB Application API',
        doc='/api/v1/'
    )

    # Register the namespaces
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')

    print("App created successfully!")  # Add this line
    return app