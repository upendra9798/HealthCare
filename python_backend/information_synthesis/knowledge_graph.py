# information_synthesis/knowledge_graph.py
import sqlite3
import json
import logging

class MedicalKnowledgeGraph:
    def __init__(self, db_path: str = "knowledge_graph.db", ontology_path: str = None):
        self.db_path = db_path
        self._initialize_db()
        self.ontology_path = ontology_path # Path to external ontology file/API if used for initial population
        self._load_initial_ontology_data()
        logging.info(f"Initialized MedicalKnowledgeGraph at {db_path}")

    def _initialize_db(self):
        """Initializes the SQLite database for the knowledge graph."""
        conn = None
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS entities (
                    id INTEGER PRIMARY KEY,
                    text TEXT UNIQUE,
                    label TEXT,
                    source_url TEXT
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS relations (
                    id INTEGER PRIMARY KEY,
                    head_id INTEGER,
                    relation_type TEXT,
                    tail_id INTEGER,
                    source_url TEXT,
                    FOREIGN KEY (head_id) REFERENCES entities(id),
                    FOREIGN KEY (tail_id) REFERENCES entities(id)
                )
            """)
            conn.commit()
            logging.info("Knowledge Graph schema initialized.")
        except sqlite3.Error as e:
            logging.error(f"Error initializing Knowledge Graph database: {e}")
        finally:
            if conn:
                conn.close()

    def _load_initial_ontology_data(self):
        """
        Loads some initial structured data from a predefined ontology (or dummy data).
        In a real system, this would be a constant feed from SNOMED CT, RxNorm, etc.
        """
        # This is hardcoded for demonstration.
        # In reality, you'd parse a large ontology file or connect to an API.
        initial_entities = [
            {"text": "diabetes mellitus type 2", "label": "DISEASE"},
            {"text": "hypertension", "label": "DISEASE"},
            {"text": "frequent urination", "label": "SYMPTOM"},
            {"text": "increased thirst", "label": "SYMPTOM"},
            {"text": "blurred vision", "label": "SYMPTOM"},
            {"text": "metformin", "label": "DRUG"},
            {"text": "lisinopril", "label": "DRUG"},
            {"text": "penicillin", "label": "DRUG"},
            {"text": "fatigue", "label": "SYMPTOM"},
            {"text": "polyuria", "label": "SYMPTOM"},
            {"text": "polydipsia", "label": "SYMPTOM"},
            {"text": "type 2 diabetes", "label": "DISEASE"} # Synonym
        ]

        initial_relations = [
            {"head_text": "frequent urination", "relation_type": "SYMPTOM_OF", "tail_text": "diabetes mellitus type 2"},
            {"head_text": "increased thirst", "relation_type": "SYMPTOM_OF", "tail_text": "diabetes mellitus type 2"},
            {"head_text": "blurred vision", "relation_type": "SYMPTOM_OF", "tail_text": "diabetes mellitus type 2"},
            {"head_text": "metformin", "relation_type": "TREATS", "tail_text": "diabetes mellitus type 2"},
            {"head_text": "lisinopril", "relation_type": "TREATS", "tail_text": "hypertension"},
            {"head_text": "penicillin", "relation_type": "ALLERGY_TO", "tail_text": "patient"}, # Note: "patient" is not a formal entity in KG usually
            {"head_text": "metformin", "relation_type": "INTERACTS_WITH", "tail_text": "alcohol"}, # Example interaction
            {"head_text": "polyuria", "relation_type": "SYNONYM_OF", "tail_text": "frequent urination"},
            {"head_text": "polydipsia", "relation_type": "SYNONYM_OF", "tail_text": "increased thirst"},
            {"head_text": "type 2 diabetes", "relation_type": "SYNONYM_OF", "tail_text": "diabetes mellitus type 2"},
        ]

        for entity in initial_entities:
            self.add_entity(entity['text'], entity['label'], "initial_ontology")

        for rel in initial_relations:
            # Need to get entity IDs first
            head_id = self._get_entity_id(rel['head_text'])
            tail_id = self._get_entity_id(rel['tail_text'])
            if head_id and tail_id:
                self.add_relation(head_id, rel['relation_type'], tail_id, "initial_ontology")

        logging.info("Initial ontology data loaded into Knowledge Graph.")


    def _get_entity_id(self, text: str) -> int | None:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM entities WHERE text = ?", (text.lower(),))
        row = cursor.fetchone()
        conn.close()
        return row[0] if row else None

    def add_entity(self, text: str, label: str, source_url: str) -> int:
        """Adds an entity to the knowledge graph."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT OR IGNORE INTO entities (text, label, source_url) VALUES (?, ?, ?)",
                           (text.lower(), label.upper(), source_url))
            conn.commit()
            # Get the ID of the inserted or existing entity
            cursor.execute("SELECT id FROM entities WHERE text = ?", (text.lower(),))
            entity_id = cursor.fetchone()[0]
            return entity_id
        except sqlite3.Error as e:
            logging.error(f"Error adding entity '{text}': {e}")
            return -1 # Indicate error
        finally:
            conn.close()

    def add_entities(self, entities_data: list[dict], source_url: str = "search_result"):
        """Adds multiple entities extracted from a document."""
        for entity in entities_data:
            self.add_entity(entity['text'], entity['label'], source_url)

    def add_relation(self, head_id: int, relation_type: str, tail_id: int, source_url: str):
        """Adds a relation between two entities."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT OR IGNORE INTO relations (head_id, relation_type, tail_id, source_url) VALUES (?, ?, ?, ?)",
                           (head_id, relation_type.upper(), tail_id, source_url))
            conn.commit()
        except sqlite3.Error as e:
            logging.error(f"Error adding relation {relation_type} between {head_id} and {tail_id}: {e}")
        finally:
            conn.close()

    def add_relations(self, relations_data: list[dict], source_url: str = "search_result"):
        """Adds multiple relations extracted from a document."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        for rel in relations_data:
            head_id = self._get_entity_id(rel['head']['text'])
            tail_id = self._get_entity_id(rel['tail']['text'])
            if head_id and tail_id:
                try:
                    cursor.execute("INSERT OR IGNORE INTO relations (head_id, relation_type, tail_id, source_url) VALUES (?, ?, ?, ?)",
                                   (head_id, rel['relation'].upper(), tail_id, source_url))
                except sqlite3.Error as e:
                    logging.warning(f"Could not add relation {rel['relation']} ({rel['head']['text']} -> {rel['tail']['text']}): {e}")
        conn.commit()
        conn.close()


    def query_related_conditions(self, symptom_text: str) -> list[str]:
        """Queries the KG for conditions related to a symptom."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        conditions = []
        symptom_id = self._get_entity_id(symptom_text)
        if symptom_id:
            # Find diseases for which this symptom is a SYMPTOM_OF
            cursor.execute("""
                SELECT T2.text FROM relations R
                JOIN entities T1 ON R.head_id = T1.id
                JOIN entities T2 ON R.tail_id = T2.id
                WHERE T1.id = ? AND R.relation_type = 'SYMPTOM_OF'
            """, (symptom_id,))
            conditions.extend([row[0] for row in cursor.fetchall()])

            # Also check if symptom is a synonym of another symptom that has a relation
            cursor.execute("""
                SELECT T2.text FROM relations R
                JOIN entities T1 ON R.head_id = T1.id
                JOIN entities T2 ON R.tail_id = T2.id
                WHERE T1.id = ? AND R.relation_type = 'SYNONYM_OF' AND T2.label = 'SYMPTOM'
            """, (symptom_id,))
            synonym_symptoms = [row[0] for row in cursor.fetchall()]
            for syn_symptom in synonym_symptoms:
                conditions.extend(self.query_related_conditions(syn_symptom))

        conn.close()
        return list(set(conditions)) # Return unique conditions

    def query_drugs_for_condition(self, condition_text: str) -> list[str]:
        """Queries the KG for drugs that treat a condition."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        drugs = []
        condition_id = self._get_entity_id(condition_text)
        if condition_id:
            cursor.execute("""
                SELECT T1.text FROM relations R
                JOIN entities T1 ON R.head_id = T1.id
                JOIN entities T2 ON R.tail_id = T2.id
                WHERE T2.id = ? AND R.relation_type = 'TREATS'
            """, (condition_id,))
            drugs.extend([row[0] for row in cursor.fetchall()])
        conn.close()
        return list(set(drugs))

    def check_drug_interaction(self, drug1_text: str, drug2_text: str) -> bool:
        """Checks for interactions between two drugs."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        drug1_id = self._get_entity_id(drug1_text)
        drug2_id = self._get_entity_id(drug2_text)

        if not drug1_id or not drug2_id:
            conn.close()
            return False

        # Check for direct INTERACTS_WITH relation
        cursor.execute("""
            SELECT COUNT(*) FROM relations
            WHERE (head_id = ? AND relation_type = 'INTERACTS_WITH' AND tail_id = ?)
               OR (head_id = ? AND relation_type = 'INTERACTS_WITH' AND tail_id = ?)
        """, (drug1_id, drug2_id, drug2_id, drug1_id))
        interaction_exists = cursor.fetchone()[0] > 0
        conn.close()
        return interaction_exists
    
