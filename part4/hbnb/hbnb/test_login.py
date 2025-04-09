from app import create_app, db, bcrypt
from app.models.user import User

app = create_app()

with app.app_context():
    # Trouver l'utilisateur
    email = "admin@hbnb.io"
    password = "admin123"
    user = db.session.query(User).filter_by(email=email).first()
    
    if user:
        print(f"Utilisateur trouvé: {user.email}")
        print(f"Mot de passe hashé: {user.password}")
        
        # Test direct avec bcrypt
        bcrypt_valid = bcrypt.check_password_hash(user.password, password)
        print(f"Vérification directe bcrypt: {bcrypt_valid}")
        
        # Test avec la méthode verify_password
        user_verify = user.verify_password(password)
        print(f"Vérification par user.verify_password(): {user_verify}")
        
        # Si la vérification échoue, réinitialisez le mot de passe
        if not user_verify:
            print("\nRéinitialisation du mot de passe...")
            user.hash_password(password)
            db.session.commit()
            print(f"Nouveau hash: {user.password}")
            
            # Vérifier de nouveau
            print("\nAprès réinitialisation:")
            bcrypt_valid_after = bcrypt.check_password_hash(user.password, password)
            print(f"Vérification directe bcrypt: {bcrypt_valid_after}")
            user_verify_after = user.verify_password(password)
            print(f"Vérification par user.verify_password(): {user_verify_after}")
    else:
        print(f"Aucun utilisateur trouvé avec l'email: {email}")