import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import time
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class UrlScraper:
    def __init__(self, timeout: int = 10, max_content_length: int = 100000):
        self.timeout = timeout
        self.max_content_length = max_content_length
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def validate_url(self, url: str) -> bool:
        """Validate if the URL is properly formatted and uses http/https protocol."""
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc]) and result.scheme in ['http', 'https']
        except Exception:
            return False
    
    def scrape_url(self, url: str) -> Optional[str]:
        """Scrape content from URL and extract main text content."""
        if not self.validate_url(url):
            raise ValueError(f"Invalid URL: {url}")
        
        try:
            # Make request with timeout
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            
            # Check content length
            content_length = len(response.content)
            if content_length > self.max_content_length:
                logger.warning(f"Content too large ({content_length} bytes), truncating")
                response._content = response.content[:self.max_content_length]
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Extract text content
            text_content = self._extract_main_content(soup)
            
            # Clean up text
            lines = (line.strip() for line in text_content.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            # Limit final text length
            if len(text) > 10000:
                text = text[:10000] + "..."
            
            return text
            
        except requests.RequestException as e:
            logger.error(f"Error scraping URL {url}: {str(e)}")
            raise Exception(f"Failed to scrape URL: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error scraping URL {url}: {str(e)}")
            raise Exception(f"Failed to process content: {str(e)}")
    
    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """Extract main content from parsed HTML."""
        # Try to find main content areas
        main_content_selectors = [
            'main',
            'article',
            '[role="main"]',
            '.main-content',
            '#main-content',
            '.content',
            '#content',
            '.post-content',
            '.entry-content'
        ]
        
        for selector in main_content_selectors:
            content = soup.select_one(selector)
            if content:
                return content.get_text()
        
        # Fallback to body or entire document
        body = soup.find('body')
        if body:
            return body.get_text()
        
        return soup.get_text()

# Singleton instance
url_scraper = UrlScraper()