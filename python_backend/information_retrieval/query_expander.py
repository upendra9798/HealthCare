# information_retrieval/query_expander.py
import logging
import os
import sys

# Ensure the parent directory is in sys.path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.medical_terms import MedicalOntology
from utils.text_preprocessing import TextPreprocessor

class QueryExpander:
    """
    Expands a list of base keywords into more comprehensive search queries
    using synonyms and related terms from an ontology.
    """
    def __init__(self, ontology_path: str = "medical_ontology.json", ontology_cls=MedicalOntology, preprocessor_cls=TextPreprocessor):
        self.ontology = ontology_cls(ontology_path)
        self.preprocessor = preprocessor_cls()
        logging.info("Initialized QueryExpander.")

    def expand_queries(self, base_keywords: list[str]) -> list[str]:
        """
        Expands base keywords using synonyms and related terms from the ontology.
        Returns a list of unique, preprocessed queries.
        """
        expanded_set = set()
        for keyword in base_keywords:
            if not keyword or not isinstance(keyword, str):
                continue
            cleaned_keyword = self.preprocessor.preprocess_for_search(keyword)
            if not cleaned_keyword:
                continue

            expanded_set.add(cleaned_keyword)

            # Add synonyms
            for syn in self.ontology.get_synonyms(cleaned_keyword):
                syn_clean = self.preprocessor.preprocess_for_search(syn)
                if syn_clean:
                    expanded_set.add(syn_clean)

            # Add related terms
            for rel in self.ontology.get_related_terms(cleaned_keyword):
                rel_clean = self.preprocessor.preprocess_for_search(rel)
                if rel_clean:
                    expanded_set.add(rel_clean)

        # Example: domain-specific expansion (can be customized or removed)
        if set(["frequent urination", "increased thirst"]).issubset(set(base_keywords)):
            expanded_set.add("polydipsia polyuria causes")

        return sorted(expanded_set)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    # You can change the ontology path as needed
    ontology_path = "medical_ontology.json"
    expander = QueryExpander(ontology_path)
    base_keywords = ["headache", "fever"]
    expanded_queries = expander.expand_queries(base_keywords)
    print("Expanded Queries:", expanded_queries)
