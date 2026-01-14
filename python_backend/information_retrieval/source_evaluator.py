
import logging
from urllib.parse import urlparse

class SourceEvaluator:
    def __init__(self, trusted_domains: list[str]):
        self.trusted_domains = set(trusted_domains)
        logging.info(f"Initialized SourceEvaluator with {len(trusted_domains)} trusted domains.")

    def evaluate_url(self, url: str) -> float:
        """
        Evaluates the credibility of a URL.
        Returns a score (e.g., 1.0 for highly trusted, 0.5 for general info, 0.0 for untrusted).
        """
        if not url:
            return 0.0

        try:
            parsed_url = urlparse(url)
            domain = parsed_url.netloc
            if domain.startswith("www."):
                domain = domain[4:] # Remove www.

            if domain in self.trusted_domains:
                return 1.0 # Highest credibility for whitelisted domains
            elif domain.endswith((".gov", ".edu", ".org")): # General reputable categories
                return 0.8
            elif domain.endswith((".com", ".net")): # Commercial, could be less reliable for health info
                return 0.5
            else:
                return 0.0 # Unknown or potentially untrusted
        except Exception as e:
            logging.error(f"Error parsing URL {url} for evaluation: {e}")
            return 0.0

    def evaluate_content(self, content_text: str) -> float:
        """
        Placeholder for content-based credibility evaluation (e.g., presence of citations,
        use of evidence-based language, lack of sensationalism).
        This would be a more advanced NLP task.
        """
        # For demonstration, always return 1.0 for now, but this needs real implementation.
        return 1.0
    

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    trusted_domains = ["who.int", "cdc.gov", "nih.gov"]
    evaluator = SourceEvaluator(trusted_domains)
    test_url = "https://www.who.int/news-room/fact-sheets/detail/coronavirus-disease-covid-19"
    score = evaluator.evaluate_url(test_url)
    print(f"Credibility score for {test_url}: {score}")  # Expected: 1.0
