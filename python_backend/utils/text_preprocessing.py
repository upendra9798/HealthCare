import re
import logging
from typing import Optional

class TextPreprocessor:
    """
    A class for preprocessing medical text data.
    """
    def __init__(self):
        self.stop_words = set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as'])
        logging.info("Initialized TextPreprocessor")

    def preprocess_for_search(self, text: str) -> Optional[str]:
        """
        Preprocess text for search operations.
        """
        if not text or not isinstance(text, str):
            return None

        # Convert to lowercase
        text = text.lower()

        # Remove special characters but keep spaces and basic punctuation
        text = re.sub(r'[^a-z0-9\s.,;:!?-]', '', text)

        # Remove extra whitespace
        text = ' '.join(text.split())

        # Remove stop words
        words = text.split()
        filtered_words = [word for word in words if word not in self.stop_words]
        text = ' '.join(filtered_words)

        return text if text else None

    def normalize_medical_term(self, term: str) -> str:
        """
        Normalize a medical term for consistent comparison.
        """
        if not term:
            return ""

        # Convert to lowercase
        term = term.lower()

        # Remove special characters
        term = re.sub(r'[^a-z0-9\s]', '', term)

        # Remove extra whitespace
        term = ' '.join(term.split())

        return term

    def extract_keywords(self, text: str) -> list[str]:
        """
        Extract keywords from medical text.
        """
        if not text:
            return []

        # Preprocess the text
        processed_text = self.preprocess_for_search(text)
        if not processed_text:
            return []

        # Split into words and remove duplicates
        words = processed_text.split()
        return list(set(words)) 