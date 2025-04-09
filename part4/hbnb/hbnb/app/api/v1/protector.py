# api/v1/protected.py
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Namespace('protected', description='Endpoints protected by JWT')

@api.route('/protected')  # Corrected endpoint
class ProtectedResource(Resource):  # Corrected class name
    @jwt_required()
    def get(self):
        """A protected endpoint that requires a valid JWT token"""
        current_user_id = get_jwt_identity()  # Maintenant c'est l'ID sous forme de chaîne
        return {'message': f'Hello, user {current_user_id}'}, 200
