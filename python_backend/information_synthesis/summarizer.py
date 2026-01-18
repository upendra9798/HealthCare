# information_synthesis/summarizer.py
import logging
from transformers import pipeline
import torch

class MedicalSummarizer:
    def __init__(self, model_name: str = "t5-small"):
        # Use GPU if available
        device = 0 if torch.cuda.is_available() else -1
        self.summarizer_pipeline = pipeline("summarization", model=model_name, device=device)
        self.model_name = model_name
        logging.info(f"Initialized MedicalSummarizer with model: {model_name} on {'GPU' if device == 0 else 'CPU'}.")

    def summarize(self, text: str, max_length: int = 150, min_length: int = 30) -> str:
        """
        Generates a summary of the provided text using a Hugging Face model.
        """
        if not text:
            return ""
        try:
            summary = self.summarizer_pipeline(
                text,
                max_length=max_length,
                min_length=min_length,
                do_sample=False
            )[0]['summary_text']
            logging.debug(f"Generated summary: {summary[:100]}...")
            return summary
        except Exception as e:
            logging.error(f"Error during summarization: {e}.")
            return ""

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    summarizer = MedicalSummarizer()
    sample_text = (
        "Diabetes is a chronic disease that occurs when the body cannot produce enough insulin. "
        "Insulin is a hormone that helps glucose from food get into your cells to be used for energy. "
        "Symptoms of diabetes include increased thirst, frequent urination, and fatigue. "
        "If left untreated, diabetes can lead to serious complications such as heart disease, kidney failure, and vision loss."
    )
    summary = summarizer.summarize(sample_text)
    print(f"Summary: {summary}")
