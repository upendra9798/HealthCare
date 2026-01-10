# data_ingestion/database_connector.py
import sqlite3
import logging
from web_crawler import WebCrawler

class DatabaseConnector:
    def __init__(self, db_path: str = "medical_data.db"):
        self.db_path = db_path
        self._initialize_db()
        logging.info(f"Initialized DatabaseConnector for {db_path}")

    def _initialize_db(self):
        """Creates a dummy table for storing medical articles/facts."""
        conn = None
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS articles (
                    id INTEGER PRIMARY KEY,
                    url TEXT UNIQUE,
                    title TEXT,
                    content TEXT,
                    source TEXT,
                    publish_date TEXT,
                    credibility_score REAL
                )
            """)
            conn.commit()
            logging.info("Database schema initialized.")
        except sqlite3.Error as e:
            logging.error(f"Error initializing database: {e}")
        finally:
            if conn:
                conn.close()

    def insert_article(self, url: str, title: str, content: str, source: str, publish_date: str, credibility_score: float):
        """Inserts a medical article into the database."""
        conn = None
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR IGNORE INTO articles (url, title, content, source, publish_date, credibility_score) VALUES (?, ?, ?, ?, ?, ?)",
                (url, title, content, source, publish_date, credibility_score)
            )
            conn.commit()
            logging.info(f"Inserted/updated article: {title}")
        except sqlite3.Error as e:
            logging.error(f"Error inserting article '{title}': {e}")
        finally:
            if conn:
                conn.close()

    def get_article_by_url(self, url: str) -> dict | None:
        """Retrieves an article by its URL."""
        conn = None
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT url, title, content, source, publish_date, credibility_score FROM articles WHERE url = ?", (url,))
            row = cursor.fetchone()
            if row:
                return {
                    "url": row[0], "title": row[1], "content": row[2],
                    "source": row[3], "publish_date": row[4], "credibility_score": row[5]
                }
            return None
        except sqlite3.Error as e:
            logging.error(f"Error retrieving article by URL '{url}': {e}")
            return None
        finally:
            if conn:
                conn.close()

    def get_articles_by_keyword(self, keyword: str, limit: int = 5) -> list[dict]:
        """Retrieves articles containing a keyword (very basic full-text search)."""
        conn = None
        articles = []
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            # Basic LIKE query, in production use FTS (Full-Text Search)
            cursor.execute(
                "SELECT url, title, content, source, publish_date, credibility_score FROM articles WHERE content LIKE ? LIMIT ?",
                (f"%{keyword}%", limit)
            )
            rows = cursor.fetchall()
            for row in rows:
                articles.append({
                    "url": row[0], "title": row[1], "content": row[2],
                    "source": row[3], "publish_date": row[4], "credibility_score": row[5]
                })
        except sqlite3.Error as e:
            logging.error(f"Error retrieving articles by keyword '{keyword}': {e}")
        finally:
            if conn:
                conn.close()
        return articles
    
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    db_connector = DatabaseConnector()

    crawler = WebCrawler(rate_limit_seconds=1, max_pages=50)
    start_url = "https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/diagnosis-treatment/drc-20373417"
    html_content = crawler.fetch_page(start_url)
    if html_content:
        main_text = crawler.parse_html(html_content)
        # For demonstration, we use dummy values for title, source, publish_date, and credibility_score
        db_connector.insert_article(
            url=start_url,
            title="High Blood Pressure (Hypertension) - Diagnosis and Treatment",
            content=main_text,
            source="Mayo Clinic",
            publish_date="2023-10-01",
            credibility_score=0.95
        )

    #show from db

    articles = db_connector.get_articles_by_keyword("hypertension")
    for article in articles:
        print(f"Title: {article['title']}\nURL: {article['url']}\nSource: {article['source']}\n")
        print(f"Content Snippet: {article['content'][:200]}...\n")  # Show first 200 chars
        print(f"Credibility Score: {article['credibility_score']}\n")
