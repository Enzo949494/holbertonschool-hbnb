import jwt
import sys
from datetime import datetime

# Si vous passez le token en argument
token = sys.argv[1] if len(sys.argv) > 1 else None

if not token:
    print("Veuillez fournir un token JWT en argument")
    sys.exit(1)

# Si le token commence par 'Bearer ', enlevez ce préfixe
if token.startswith('Bearer '):
    token = token[7:]

try:
    # Décodez le token manuellement sans vérifier la signature
    decoded = jwt.decode(token, options={"verify_signature": False})
    print("\nToken décodé avec succès!")
    
    # Afficher l'identité (subject)
    if 'sub' in decoded:
        print(f"Subject (identité): {decoded['sub']} (type: {type(decoded['sub']).__name__})")
        
        # Si l'identité est un dictionnaire, examinez-le plus en détail
        if isinstance(decoded['sub'], dict):
            print(f"  ID: {decoded['sub'].get('id')}")
            print(f"  Admin: {decoded['sub'].get('is_admin')}")
    
    # Afficher l'expiration si présente
    if 'exp' in decoded:
        exp_time = datetime.fromtimestamp(decoded['exp'])
        print(f"Expiration: {exp_time}")
    
    # Afficher tous les claims
    print("\nClaims supplémentaires:")
    for key, value in decoded.items():
        if key != 'sub':  # Nous avons déjà affiché l'identité
            print(f"  {key}: {value}")
            
except Exception as e:
    print(f"Erreur lors du décodage du token: {e}")
    import traceback
    traceback.print_exc()