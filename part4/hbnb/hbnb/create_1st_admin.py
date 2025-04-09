from app import create_app, db
from app.models.user import User
import bcrypt

app = create_app()

with app.app_context():
    # Supprimer l'utilisateur s'il existe déjà (pour être sûr)
    db.session.query(User).filter_by(email="admin@hbnb.io").delete()
    db.session.commit()
    
    # Créer un nouvel admin
    admin = User(
        first_name="Admin",
        last_name="User",
        email="admin@hbnb.io",
        password="admin123",  # sera hashé par le modèle
        is_admin=True
    )
    
    # Ajout et commit
    db.session.add(admin)
    db.session.commit()
    
    # Vérifier que l'utilisateur a été créé
    user_check = db.session.query(User).filter_by(email="admin@hbnb.io").first()
    if user_check:
        print(f"Utilisateur admin créé et vérifié: {user_check.email}")
        print(f"ID de l'utilisateur: {user_check.id}")
    else:
        print("ERREUR: L'utilisateur n'a pas été créé correctement dans la base de données")