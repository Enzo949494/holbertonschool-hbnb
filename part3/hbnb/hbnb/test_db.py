from app import create_app, db
from app.models.user import User

app = create_app()

with app.app_context():
    new_user = User(
        first_name="John",
        last_name="Doe",
        email="john.doe@example.com",
        password="test123",  # ✅ Ajout du mot de passe
        is_admin=False
    )

    db.session.add(new_user)
    db.session.commit()

    print("Utilisateur ajouté avec succès :", new_user.first_name, new_user.email)
