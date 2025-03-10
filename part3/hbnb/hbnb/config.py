import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Pour éviter le warning

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///hbnb_dev.db')  # Utilisation d'une base SQLite par défaut

config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig
}
