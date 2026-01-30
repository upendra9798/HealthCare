# main.py
import logging
from config import Config
from patient_data_processor.report_parser import MedicalReportParser
from information_retrieval.search_engine import MedicalSearchEngine
from information_retrieval.query_expander import QueryExpander
from information_retrieval.source_evaluator import SourceEvaluator
from information_synthesis.entity_extractor import MedicalEntityExtractor
from information_synthesis.relation_extractor import MedicalRelationExtractor
#from information_synthesis.summarizer import MedicalSummarizer
from information_synthesis.knowledge_graph import MedicalKnowledgeGraph
from prompt import text, text2, text3, extract_from_json  # Import your prompt text from a separate file
from gemini_llm import GeminiLLM  # Import your LLM class
import asyncio

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class MedicalAIOrchestrator:
    def __init__(self, config: Config):
        self.config = config
        self.report_parser = MedicalReportParser()
        self.query_expander = QueryExpander(ontology_path=config.MEDICAL_ONTOLOGY_PATH)
        self.source_evaluator = SourceEvaluator(trusted_domains=config.TRUSTED_MEDICAL_DOMAINS)
        self.search_engine = MedicalSearchEngine(
            api_key=config.SEARCH_API_KEY,
            search_endpoint=config.SEARCH_API_ENDPOINT,
            source_evaluator=self.source_evaluator
        )
        self.entity_extractor = MedicalEntityExtractor(model_path=config.NER_MODEL_PATH)
        self.relation_extractor = MedicalRelationExtractor(model_path=config.REL_MODEL_PATH)
        #self.summarizer = MedicalSummarizer(model_name=config.SUMMARIZER_MODEL_NAME)
        self.knowledge_graph = MedicalKnowledgeGraph(
            db_path=config.KNOWLEDGE_GRAPH_DB_PATH,
            ontology_path=config.MEDICAL_ONTOLOGY_PATH
        )
        self.llm = GeminiLLM(api_key=config.GEMINI_API_KEY)


    async def process_patient_case(self, medical_report_text: str, current_symptoms: list):
        logging.info("Starting patient case processing...")

        # 1. Process Patient Data
        parsed_report = self.report_parser.parse(medical_report_text)
        patient_data = {
            "symptoms": current_symptoms + parsed_report.get("diagnosed_conditions", []),
            "medications": parsed_report.get("medications", []),
            "allergies": parsed_report.get("allergies", []),
            "patient_history_keywords": parsed_report.get("keywords", [])
            # Add more relevant patient data fields
        }
        logging.info(f"Parsed patient data: {patient_data}")

        # 2. Formulate Search Queries
        base_query_terms = patient_data["symptoms"] + patient_data["patient_history_keywords"]
        expanded_queries = self.query_expander.expand_queries(base_query_terms)
        logging.info(f"Expanded search queries: {expanded_queries}")

        # 3. Information Retrieval (Internet Search)
        search_results = self.search_engine.search_medical_information(expanded_queries)
        
        logging.info(f"Retrieved {len(search_results)} search results.")

        # 4. Information Synthesis
        extracted_entities_all = []
        extracted_relations_all = []
        synthesized_summaries = {}

        summaries  = ""

        for i, result in enumerate(search_results):
            logging.info(f"Synthesizing information from result {i+1}: {result['title']}")
            text_content = result.get('content', '') # Assume 'content' is the main text from the search result

            # Extract Entities
            # entities = self.entity_extractor.extract(text_content)
            # extracted_entities_all.extend(entities)
            # logging.debug(f"Extracted entities: {entities}")
            
            
            # Extract Relations
            # relations = self.relation_extractor.extract(text_content, entities)
            # extracted_relations_all.extend(relations)
            # print("\n \n \n ")
            # logging.debug(f"Extracted relations: {relations}")
            # print(extracted_relations_all)

            # Summarize relevant sections
            t = text(text_content)
            summary = await self.llm.predict(t)  # Await the coroutine
            summaries += summary + "\n \n"
            synthesized_summaries[result['url']] = summary
            #print(summary)

            logging.debug(f"Generated summary: {summary}")

            

            # Populate/Update Knowledge Graph (optional, can be done asynchronously)
            # self.knowledge_graph.add_entities(entities)
            # self.knowledge_graph.add_relations(relations)

        # logging.info("Information synthesis complete.")

        # 5. Integrate Synthesized Information for Prescription Recommendation (Placeholder)
        # This is where the core "AI Brain" for diagnosis and prescription would live.
        # It would use the patient_data, extracted_entities_all, extracted_relations_all,
        # and the knowledge_graph to reason and suggest a prescription.
        # This part is highly complex and involves clinical decision support models.

        
        # prescription_recommendation = self._generate_prescription_recommendation(
        #     patient_data,
        #     extracted_entities_all,
        #     extracted_relations_all,
        #     self.knowledge_graph, # Pass the KG for reasoning
        #     synthesized_summaries # Pass summaries for context
        # )

        res = await self.recommend_prescription(summaries, medical_report_text, current_symptoms)

        # return {
        #     "patient_summary": patient_data,
        #     "synthesized_information": synthesized_summaries,
        #     "extracted_knowledge": {"entities": extracted_entities_all, "relations": extracted_relations_all},
        #     "prescription_recommendation": prescription_recommendation
        # }
        return res

    def _generate_prescription_recommendation(self, patient_data, entities, relations, kg, summaries):
        """
        Placeholder for the complex logic to generate a prescription.
        This would involve:
        - Differential diagnosis based on symptoms, history, and extracted knowledge.
        - Checking for drug-drug interactions, allergies using KG and patient data.
        - Consulting clinical guidelines (from synthesized info or KG).
        - Recommending dosage, frequency, duration.
        - Considering contraindications and patient-specific factors.
        - **Crucially, flagging areas for human review and ultimate decision.**
        """
        logging.info("Generating prescription recommendation (placeholder logic)...")
        # Example very simplistic logic:
        possible_conditions = []
        for symptom in patient_data['symptoms']:
            # Query KG or synthesized info for conditions related to symptom
            related = kg.query_related_conditions(symptom)
            possible_conditions.extend(related)

        # Remove duplicates and prioritize
        possible_conditions = list(set(possible_conditions))
        if not possible_conditions:
            return {"status": "No specific condition identified for prescription. Recommend human review.", "details": "Please consult a doctor."}

        # Select a primary condition (simplistic)
        primary_condition = possible_conditions[0]

        # Look up typical drugs for primary_condition in KG or extracted info
        recommended_drugs = kg.query_drugs_for_condition(primary_condition)

        # Check for conflicts (very basic)
        conflicts = []
        for drug in recommended_drugs:
            if drug in patient_data['allergies']:
                conflicts.append(f"Patient is allergic to {drug}.")
            for existing_med in patient_data['medications']:
                if kg.check_drug_interaction(drug, existing_med):
                    conflicts.append(f"Potential interaction between {drug} and {existing_med}.")

        if conflicts:
            return {
                "status": "Potential issues found. Human oversight REQUIRED.",
                "condition_considered": primary_condition,
                "suggested_drugs_if_no_conflicts": recommended_drugs,
                "conflicts": conflicts,
                "details": "AI detected conflicts. A medical professional must review."
            }
        else:
            return {
                "status": "Preliminary recommendation (requires human validation).",
                "condition_identified": primary_condition,
                "suggested_prescription": {
                    "drug": recommended_drugs[0] if recommended_drugs else "No specific drug recommended for this condition.",
                    "dosage": "Standard adult dose (to be confirmed by doctor)",
                    "frequency": "As per guidelines (to be confirmed by doctor)",
                    "duration": "As per guidelines (to be confirmed by doctor)"
                },
                "details": "This is an AI-generated suggestion. A qualified doctor must review, confirm diagnosis, and finalize the prescription considering all patient-specific factors."
            }
        
    async def recommend_prescription(self,summaries, patient_history, current_symptoms):
        current_symptoms = ", ".join(current_symptoms)
        response = await self.llm.predict(text2(summaries, patient_history, current_symptoms))
        formatted_response = text3(response)
        formatted_response = await self.llm.predict(formatted_response)
        print(formatted_response)
        dict_response = await extract_from_json(formatted_response)
        return dict_response


if __name__ == "__main__":
    # Example Usage
    app_config = Config()
    ai_orchestrator = MedicalAIOrchestrator(app_config)

    patient_report_example_2 = """
            Patient Name: Jane Smith
            Date of Birth: 1972-08-22
            Last Visit: 2025-01-10
            Diagnosis: Essential Hypertension
            Medications: Amlodipine 5mg QD, Hydrochlorothiazide 25mg QD
            Allergies: None known
            Previous Symptoms: Occasional headaches, mild dizziness.
            Lab Results (Recent): Blood Pressure 150/95 mmHg, Cholesterol (LDL) 135 mg/dL.
            """
    current_symptoms_example_2 = ["severe headache", "nausea", "shortness of breath upon exertion"]
    result = asyncio.run(ai_orchestrator.process_patient_case(patient_report_example_2, current_symptoms_example_2))

    print(result)