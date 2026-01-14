# information_retrieval/search_engine.py
import requests
import logging
from config import Config
from information_retrieval.source_evaluator import SourceEvaluator
from data_ingestion.web_crawler import WebCrawler

class MedicalSearchEngine:
    def __init__(self, api_key: str, search_endpoint: str, source_evaluator: SourceEvaluator):
        self.api_key = api_key
        self.search_endpoint = search_endpoint
        self.search_engine_id = Config.SEARCH_ENGINE_ID # From Config
        self.source_evaluator = source_evaluator
        self.web_crawler = WebCrawler()
        logging.info("Initialized MedicalSearchEngine.")

    def search_medical_information(self, queries: list[str], num_results: int = 5) -> list[dict]:
        """
        Performs a search using an external API (e.g., Google Custom Search) and
        then potentially crawls the top results to extract content.
        Filters and ranks results based on source credibility.
        """
        all_results = []
        for query in queries:
            logging.info(f"Searching for query: '{query}'")
            params = {
                "key": self.api_key,
                "cx": self.search_engine_id,
                "q": query,
                "num": num_results
            }
            try:
                response = requests.get(self.search_endpoint, params=params, timeout=15)
                response.raise_for_status()
                search_data = response.json()
                if "items" in search_data:
                    for item in search_data["items"]:
                        # Basic filtering and scoring based on URL
                        credibility = self.source_evaluator.evaluate_url(item.get('link', ''))
                        if credibility > 0: # Only consider trusted sources
                            all_results.append({
                                "title": item.get('title'),
                                "url": item.get('link'),
                                "snippet": item.get('snippet'),
                                "credibility_score": credibility,
                                "query_matched": query # Keep track of which query yielded this
                            })
                else:
                    logging.warning(f"No items found for query: '{query}'")

            except requests.exceptions.RequestException as e:
                logging.error(f"Search API request failed for '{query}': {e}")
            except Exception as e:
                logging.error(f"An unexpected error occurred during search for '{query}': {e}")

        # Sort all results by credibility and then by a simple relevance (e.g., query match count)
        # For full relevance, you'd integrate more sophisticated ranking algorithms here.
        all_results.sort(key=lambda x: x['credibility_score'], reverse=True)

        # Now, attempt to crawl the content for the top N highly credible results
        final_results = []
        crawled_urls = set()
        for result in all_results:
            if len(final_results) >= Config.MAX_SEARCH_RESULTS:
                break
            if result['url'] in crawled_urls: # Avoid crawling same URL multiple times if from different queries
                continue

            content = self.web_crawler.fetch_page(result['url'])
            if content:
                parsed_content = self.web_crawler.parse_html(content)
                result['content'] = parsed_content
                final_results.append(result)
                crawled_urls.add(result['url'])
            else:
                logging.warning(f"Could not crawl content for {result['url']}, skipping.")

        return final_results
    
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    config = Config()
    source_evaluator = SourceEvaluator(trusted_domains=config.TRUSTED_DOMAINS)
    
    search_engine = MedicalSearchEngine(
        api_key=config.SEARCH_API_KEY,
        search_endpoint=config.SEARCH_API_ENDPOINT,
        source_evaluator=source_evaluator
    )
    queries = ["hypertension treatment", "diabetes management", "latest COVID-19 research"]
    results = search_engine.search_medical_information(queries, num_results=5) 
    for result in results:
        print(f"Title: {result['title']}")
        print(f"URL: {result['url']}")
        print(f"Snippet: {result['snippet']}")
        print(f"Credibility Score: {result['credibility_score']}")
        print(f"Content: {result.get('content', 'No content crawled')}\n")

        

