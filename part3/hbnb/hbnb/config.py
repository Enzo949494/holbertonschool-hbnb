import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Pour éviter le warning
    SQLALCHEMY_DATABASE_URI = 'sqlite:///instance/hbnb_dev.db'

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///hbnb_dev.db')  # Utilisation d'une base SQLite par défaut

config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig
}
