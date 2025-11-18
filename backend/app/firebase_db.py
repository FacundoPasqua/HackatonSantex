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
            try:
                cred_dict = json.loads(firebase_creds)
                cred = credentials.Certificate(cred_dict)
            except Exception as e:
                print(f"[WARNING] Error parsing FIREBASE_CREDENTIALS: {e}")
                return None
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
                    # En desarrollo local sin credenciales, retornar None
                    print("[INFO] Firebase credentials not found. Running without database (development mode).")
                    return None
        
        # Inicializar Firebase Admin (solo si no está inicializado)
        try:
            firebase_admin.get_app()
        except ValueError:
            try:
                firebase_admin.initialize_app(cred)
            except Exception as e:
                print(f"[WARNING] Error initializing Firebase: {e}")
                return None
        
        try:
            db = firestore.client()
            print("[OK] Firebase Firestore initialized successfully")
        except Exception as e:
            print(f"[WARNING] Error creating Firestore client: {e}")
            db = None
            return None
    
    return db

def get_collection(collection_name="test_results"):
    """Obtener una colección de Firestore"""
    firestore_db = get_firestore_db()
    if firestore_db is None:
        # Retornar un objeto mock que simula una colección vacía
        import uuid
        
        class MockCollection:
            def add(self, data):
                doc_id = str(uuid.uuid4())
                return None, MockDocRef(doc_id)
            
            def document(self, doc_id):
                return MockDocRef(doc_id)
            
            def where(self, field, op, value):
                return self
            
            def order_by(self, field, direction=None):
                return self
            
            def limit(self, n):
                return self
            
            def stream(self):
                return []
        
        class MockDocRef:
            def __init__(self, doc_id=None):
                self._doc_id = doc_id or str(uuid.uuid4())
            
            def get(self):
                return MockDoc(self._doc_id)
        
        class MockDoc:
            def __init__(self, doc_id=None):
                self._doc_id = doc_id or ""
            
            def to_dict(self):
                return {}
            @property
            def exists(self):
                return False
            @property
            def id(self):
                return self._doc_id
        
        return MockCollection()
    return firestore_db.collection(collection_name)

