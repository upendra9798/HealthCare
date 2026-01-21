# patient_data_processor/report_parser.py
import re
import logging


class MedicalReportParser:
    def __init__(self):
        logging.info("Initialized MedicalReportParser.")

    def parse(self, report_text: str) -> dict:
        """
        Parses a medical report text to extract key information.
        This is a very simplistic rule-based parser.
        A real system would use advanced NLP models (e.g., trained on clinical notes).
        """
        parsed_data = {
            "patient_name": self._extract_field(report_text, r"Patient Name:\s*(.*)"),
            "date_of_birth": self._extract_field(report_text, r"Date of Birth:\s*(.*)"),
            "last_visit": self._extract_field(report_text, r"Last Visit:\s*(.*)"),
            "diagnosed_conditions": self._extract_list_field(report_text, r"Diagnosis:\s*(.*)", ","),
            "medications": self._extract_list_field(report_text, r"Medications:\s*(.*)", ","),
            "allergies": self._extract_list_field(report_text, r"Allergies:\s*(.*)", ","),
            "previous_symptoms": self._extract_list_field(report_text, r"Previous Symptoms:\s*(.*)", ","),
            "lab_results": self._extract_lab_results(report_text)
        }
        logging.info("Medical report parsed.")
        return parsed_data

    def _extract_field(self, text: str, regex: str) -> str:
        match = re.search(regex, text, re.IGNORECASE)
        return match.group(1).strip() if match else "N/A"

    def _extract_list_field(self, text: str, regex: str, delimiter: str) -> list[str]:
        match = re.search(regex, text, re.IGNORECASE)
        if match:
            items_str = match.group(1).strip()
            return [item.strip() for item in items_str.split(delimiter) if item.strip()]
        return []

    def _extract_lab_results(self, text: str) -> dict:
        lab_results = {}
        lab_section_match = re.search(r"Lab Results\s*\(Recent\):\s*(.*)", text, re.IGNORECASE | re.DOTALL)
        if lab_section_match:
            lab_text = lab_section_match.group(1).split("Previous Symptoms:")[0].strip() # Stop at next section
            # Example: A1C 7.5%, Fasting Glucose 140 mg/dL.
            lab_matches = re.findall(r"([A-Za-z0-9\s]+?)\s*([\d\.\%mg/dL]+)", lab_text)
            for name, value in lab_matches:
                lab_results[name.strip()] = value.strip()
        return lab_results
    

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    parser = MedicalReportParser()
    sample_report = """
    Patient Name: John Doe
    Date of Birth: 01/01/1980
    Last Visit: 01/01/2023
    Diagnosis: Hypertension, Diabetes Mellitus
    Medications: Lisinopril, Metformin
    Allergies: Penicillin
    Previous Symptoms: Headache, Fatigue
    Lab Results (Recent):
    A1C 7.5%, Fasting Glucose 140 mg/dL.
    """
    parsed_report = parser.parse(sample_report)
    print(parsed_report)

    