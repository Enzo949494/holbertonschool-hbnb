# app/persistence/review_repository.py

from app.models.review import Review
from app import db
from sqlalchemy.exc import IntegrityError

class ReviewRepository:
    """
    Repository spécifique pour le modèle Review,
    sans relations (pas de foreign key).
    """

    def __init__(self):
        self.model = Review

    def get_by_id(self, review_id):
        """Récupère un avis (Review) par son ID."""
        return db.session.query(self.model).get(review_id)

    def create(self, text, rating, place_id=None, user_id=None):
        """
        Crée un nouvel avis (Review) et l'enregistre en base.
        """
        try:
            review = self.model(
                text=text,
                rating=rating
            )
            # place_id et user_id sont des colonnes simples
            if place_id is not None:
                review.place_id = place_id
            if user_id is not None:
                review.user_id = user_id

            db.session.add(review)
            db.session.commit()
            return review
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Erreur lors de la création du review (contrainte invalide).")

    def update(self, review_id, data):
        """
        Met à jour les informations d'un avis (Review).
        """
        review = self.get_by_id(review_id)
        if not review:
            raise ValueError("Review introuvable.")

        for key, value in data.items():
            if hasattr(review, key) and key != "id":
                setattr(review, key, value)

        db.session.commit()
        return review

    def delete(self, review_id):
        """
        Supprime un avis par son ID.
        """
        review = self.get_by_id(review_id)
        if not review:
            raise ValueError("Review introuvable.")

        db.session.delete(review)
        db.session.commit()

    def find_by_user_and_place(self, user_id, place_id):
        """
        Trouve un avis (Review) par user_id et place_id.
        
        Args:
            user_id: ID de l'utilisateur
            place_id: ID du lieu
            
        Returns:
            Review: L'avis trouvé ou None si aucun avis n'est trouvé
        """
        return db.session.query(self.model).filter_by(
            user_id=user_id, 
            place_id=place_id
        ).first()
        
    def get_all(self):
        """
        Récupère tous les avis.
        
        Returns:
            list: Liste de tous les avis
        """
        return db.session.query(self.model).all()

    def get_by_place_id(self, place_id):
        """
        Récupère tous les avis pour un lieu donné directement via SQL
        """
        reviews = db.session.query(self.model).filter(self.model.place_id == place_id).all()
        print(f"Direct query for place_id={place_id} returned {len(reviews)} reviews")
        for r in reviews:
            print(f"Found: Review ID={r.id}, place_id={r.place_id}, user_id={r.user_id}")
        return reviews