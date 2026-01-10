# data_ingestion/web_crawler.py
import requests
from bs4 import BeautifulSoup
import logging
import time
from urllib.parse import urljoin, urlparse

class WebCrawler:
    def __init__(self, rate_limit_seconds=1, max_pages=50):
        self.rate_limit_seconds = rate_limit_seconds
        self.max_pages = max_pages
        self.crawled_urls = set()
        logging.info("Initialized WebCrawler.")

    def fetch_page(self, url: str) -> str | None:
        """Fetches content from a URL."""
        if url in self.crawled_urls:
            logging.debug(f"Skipping already crawled: {url}")
            return None
        self.crawled_urls.add(url)

        logging.info(f"Fetching: {url}")
        try:
            time.sleep(self.rate_limit_seconds) # Be polite
            headers = {'User-Agent': 'Mozilla/5.0 (compatible; MedicalAI/1.0)'} # Identify your bot
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status() # Raise an exception for HTTP errors
            return response.text
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed to fetch {url}: {e}")
            return None

    def parse_html(self, html_content: str) -> str:
        """Parses HTML to extract main text content."""
        if not html_content:
            return ""
        soup = BeautifulSoup(html_content, 'html.parser')
        # Try to find the main content area. This is highly site-specific.
        # Common selectors: article, main, div with specific IDs/classes.
        main_content_tags = ['article', 'main', 'div', 'p']
        text_parts = []
        for tag_name in main_content_tags:
            for tag in soup.find_all(tag_name):
                # Simple heuristic to avoid navigation/footer/header
                if tag.get('class') and ('navbar' in ' '.join(tag['class']) or 'footer' in ' '.join(tag['class'])):
                    continue
                text_parts.append(tag.get_text(separator=' ', strip=True))
        return " ".join(text_parts) if text_parts else soup.get_text(separator=' ', strip=True)


    def _get_domain(self, url: str) -> str:
        return urlparse(url).netloc
    
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    crawler = WebCrawler(rate_limit_seconds=1, max_pages=50)

    # Example usage
    start_url = "https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/diagnosis-treatment/drc-20373417"
    html_content = crawler.fetch_page(start_url)
    
    if html_content:
        main_text = crawler.parse_html(html_content)
        print(main_text)  # Output the main text content
    else:
        print("Failed to fetch or parse the page.")
        