"""
Configuración de Firebase Firestore
"""
import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

# Inicializar Firebase (solo una vez)
db = None

def get_firestore_db():
    """Obtener instancia de Firestore"""
    global db
    
    if db is None:
        # Opción 1: Usar credenciales desde variable de entorno (JSON como string)
        firebase_creds = os.getenv("FIREBASE_CREDENTIALS")
        
        if firebase_creds:
            # Si viene como string JSON, parsearlo
            import json
            cred_dict = json.loads(firebase_creds)
            cred = credentials.Certificate(cred_dict)
        else:
            # Opción 2: Usar archivo de credenciales
            cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-credentials.json")
            
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
            else:
                # Opción 3: Usar Application Default Credentials (para producción en GCP)
                # Railway puede configurar esto automáticamente
                try:
                    cred = credentials.ApplicationDefault()
                except:
                    raise Exception(
                        "Firebase credentials not found. "
                        "Set FIREBASE_CREDENTIALS (JSON string) or FIREBASE_CREDENTIALS_PATH (file path)"
                    )
        
        # Inicializar Firebase Admin (solo si no está inicializado)
        try:
            firebase_admin.get_app()
        except ValueError:
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        print("✅ Firebase Firestore initialized successfully")
    
    return db

def get_collection(collection_name="test_results"):
    """Obtener una colección de Firestore"""
    firestore_db = get_firestore_db()
    return firestore_db.collection(collection_name)

