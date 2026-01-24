import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # API Keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    SEARCH_API_KEY = os.getenv('SEARCH_API_KEY')
    SEARCH_API_ENDPOINT = os.getenv('SEARCH_API_ENDPOINT')

    # Trusted Medical Domains
    TRUSTED_MEDICAL_DOMAINS = [
        'mayoclinic.org',
        'webmd.com',
        'medlineplus.gov',
        'healthline.com',
        'who.int',
        'cdc.gov',
        'nih.gov'
    ]

    # Model Paths
    NER_MODEL_PATH = os.getenv('NER_MODEL_PATH', 'models/ner_model')
    REL_MODEL_PATH = os.getenv('REL_MODEL_PATH', 'models/rel_model')
    MEDICAL_ONTOLOGY_PATH = os.path.join(os.path.dirname(__file__), 'data', 'medical_ontology.json')
    KNOWLEDGE_GRAPH_DB_PATH = os.getenv('KNOWLEDGE_GRAPH_DB_PATH', 'data/knowledge_graph.db')

    # Summarizer Configuration
    SUMMARIZER_MODEL_NAME = os.getenv('SUMMARIZER_MODEL_NAME', 'gpt-3.5-turbo')

    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_FILE = os.getenv('LOG_FILE', 'app.log')

    # Search Configuration
    MAX_SEARCH_RESULTS = int(os.getenv('MAX_SEARCH_RESULTS', 10))
    SEARCH_TIMEOUT = int(os.getenv('SEARCH_TIMEOUT', 30))

    # API Configuration
    API_HOST = os.getenv('API_HOST', '0.0.0.0')
    API_PORT = int(os.getenv('API_PORT', 5000))
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

    SEARCH_ENGINE_ID = os.getenv('SEARCH_ENGINE_ID', 'your_default_engine_id')