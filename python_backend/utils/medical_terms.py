import json
import logging
from typing import List, Dict, Any

class MedicalOntology:
    """
    A class to handle medical terminology and relationships.
    """
    def __init__(self, ontology_path: str):
        self.ontology_path = ontology_path
        self.ontology_data = self._load_ontology()
        logging.info(f"Loaded medical ontology from {ontology_path}")

    def _load_ontology(self) -> Dict[str, Any]:
        """
        Load the medical ontology from a JSON file.
        """
        try:
            with open(self.ontology_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logging.warning(f"Ontology file not found at {self.ontology_path}. Using empty ontology.")
            return {"terms": {}, "relationships": {}}
        except json.JSONDecodeError:
            logging.error(f"Invalid JSON in ontology file {self.ontology_path}")
            return {"terms": {}, "relationships": {}}

    def get_synonyms(self, term: str) -> List[str]:
        """
        Get synonyms for a given medical term.
        """
        term_data = self.ontology_data.get("terms", {}).get(term.lower(), {})
        return term_data.get("synonyms", [])

    def get_related_terms(self, term: str) -> List[str]:
        """
        Get related terms for a given medical term.
        """
        term_data = self.ontology_data.get("terms", {}).get(term.lower(), {})
        return term_data.get("related_terms", [])

    def get_definition(self, term: str) -> str:
        """
        Get the definition of a medical term.
        """
        term_data = self.ontology_data.get("terms", {}).get(term.lower(), {})
        return term_data.get("definition", "")

    def get_relationships(self, term: str) -> Dict[str, List[str]]:
        """
        Get all relationships for a given medical term.
        """
        return self.ontology_data.get("relationships", {}).get(term.lower(), {}) 