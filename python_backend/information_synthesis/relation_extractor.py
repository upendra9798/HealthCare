# information_synthesis/relation_extractor.py
import logging
# For a real system, you'd use a dedicated pre-trained medical relation extraction model.
# Example: from transformers import pipeline
# For this example, we'll use a very simple rule-based approach.

class MedicalRelationExtractor:
    def __init__(self, model_path: str = None):
        # In a real scenario, model_path would point to a fine-tuned model for relation extraction.
        # self.rel_pipeline = pipeline("relation-extraction", model=model_path, tokenizer=model_path)
        logging.info("Initialized MedicalRelationExtractor (using simple rule-based matching).")

    def extract(self, text: str, entities: list[dict]) -> list[dict]:
        """
        Extracts relationships between identified entities in the text.
        This is a very simplistic rule-based approach.
        A real system would use advanced NLP models.
        """
        relations = []
        cleaned_text = text.lower()

        # Simple rule: If "treats" or "is treated by" is between a drug and a disease
        for i, entity1 in enumerate(entities):
            for j, entity2 in enumerate(entities):
                if i == j: continue

                # Example 1: Drug A treats Disease B
                if entity1['label'] == 'DRUG' and entity2['label'] == 'DISEASE':
                    # Check if 'treats' or similar verb is between them in the text
                    # This is highly simplified and prone to errors.
                    start_idx = min(entity1['start'], entity2['start'])
                    end_idx = max(entity1['end'], entity2['end'])
                    segment = cleaned_text[start_idx:end_idx]
                    if "treats" in segment or "is used for" in segment:
                        relations.append({
                            "head": entity1,
                            "relation": "TREATS",
                            "tail": entity2
                        })

                # Example 2: Symptom A caused by Disease B
                elif entity1['label'] == 'SYMPTOM' and entity2['label'] == 'DISEASE':
                    start_idx = min(entity1['start'], entity2['start'])
                    end_idx = max(entity1['end'], entity2['end'])
                    segment = cleaned_text[start_idx:end_idx]
                    if "caused by" in segment or "symptom of" in segment:
                        relations.append({
                            "head": entity1,
                            "relation": "CAUSED_BY",
                            "tail": entity2
                        })

                # Example 3: Drug A side effect is Symptom B
                elif entity1['label'] == 'DRUG' and entity2['label'] == 'SYMPTOM':
                    start_idx = min(entity1['start'], entity2['start'])
                    end_idx = max(entity1['end'], entity2['end'])
                    segment = cleaned_text[start_idx:end_idx]
                    if "side effect" in segment or "can cause" in segment:
                        relations.append({
                            "head": entity1,
                            "relation": "HAS_SIDE_EFFECT",
                            "tail": entity2
                        })
        logging.debug(f"Extracted {len(relations)} relations.")
        return relations
    
if __name__ == "__main__":
    print("Running Medical Relation Extractor Example...")
    logging.basicConfig(level=logging.INFO)
    relation_extractor = MedicalRelationExtractor()
    sample_text = "Aspirin is used for treating headaches."
    print(f"Sample text: {sample_text}")
    entities = [
        {"text": "Aspirin", "label": "DRUG", "start": 0, "end": 7},
        {"text": "headaches", "label": "SYMPTOM", "start": 30, "end": 39}
    ]
    relations = relation_extractor.extract(sample_text, entities)
    print(relations)
    