from slowapi import Limiter
from slowapi.util import get_remote_address

# On crée le limiteur basé sur l'adresse IP de l'utilisateur
limiter = Limiter(key_func=get_remote_address)