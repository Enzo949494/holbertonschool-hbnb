from .base_model import BaseModel

class User(BaseModel):
    def __init__(self, first_name, last_name, email, password=None, is_admin=False):
        super().__init__()
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin
        # Si un mot de passe est fourni lors de la création, on le hache
        if password:
            self.hash_password(password)
        else:
            self.password = None
        self.validate()

    def validate(self):
        if not self.first_name or len(self.first_name) > 50:
            raise ValueError("First name must be between 1 and 50 characters")
        if not self.last_name or len(self.last_name) > 50:
            raise ValueError("Last name must be between 1 et 50 characters")
        if not self.is_valid_email(self.email):
            raise ValueError("Invalid email format")

    @staticmethod
    def is_valid_email(email):
        import re
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        return re.match(email_regex, email) is not None

    def hash_password(self, password):
        """Hashes the password before storing it."""
        # On utilise l'instance bcrypt initialisée dans app/__init__.py
        from app import bcrypt
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        """Verifies if the provided password matches the hashed password."""
        from app import bcrypt
        return bcrypt.check_password_hash(self.password, password)
