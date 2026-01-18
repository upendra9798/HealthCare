# information_synthesis/entity_extractor.py
import logging
import re
from typing import List, Dict

# For a real system, you'd use a dedicated pre-trained medical NER model.
# Example: from transformers import pipeline
# For this example, we'll use a very simple regex-based approach.

class MedicalEntityExtractor:
    def __init__(self, model_path: str = None):
        # In a real scenario, model_path would point to a fine-tuned BioBERT or ClinicalBERT model.
        # self.nlp_pipeline = pipeline("ner", model=model_path, tokenizer=model_path)
        self.medical_terms_keywords = {
            "disease": ["diabetes", "hypertension", "fever", "flu", "migraine", "cancer", "infection"],
            "symptom": ["headache", "fatigue", "nausea", "vomiting", "cough", "runny nose", "blurred vision", "frequent urination", "increased thirst"],
            "drug": ["metformin", "lisinopril", "paracetamol", "ibuprofen", "penicillin", "aspirin"],
            "allergy": ["penicillin", "latex", "nuts"],
            "lab_test": ["a1c", "glucose", "cholesterol", "blood pressure"]
        }
        logging.info("Initialized MedicalEntityExtractor (using simple keyword matching).")

    def extract(self, text: str) -> list[dict]:
        """
        Extracts medical entities (e.g., diseases, symptoms, drugs) from text.
        Returns a list of dictionaries with 'text', 'label', 'start', 'end'.
        """
        entities = []
        cleaned_text = text.lower() # Work with lowercase for simple matching

        for label, keywords in self.medical_terms_keywords.items():
            for keyword in keywords:
                # Use regex to find all occurrences of the keyword
                for match in re.finditer(r'\b' + re.escape(keyword) + r'\b', cleaned_text):
                    entities.append({
                        "text": match.group(0),
                        "label": label.upper(), # DISEASE, SYMPTOM, DRUG etc.
                        "start": match.start(),
                        "end": match.end()
                    })
        logging.debug(f"Extracted {len(entities)} entities.")
        return entities
    

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    extractor = MedicalEntityExtractor()
    sample_text = "The patient is suffering from diabetes and hypertension."
    entities = extractor.extract(sample_text)
    for entity in entities:
        print(f"Found entity: {entity['text']} (Type: {entity['label']})")