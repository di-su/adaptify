import json
import os
from typing import Dict, Any
from langchain_anthropic import ChatAnthropic
from langchain.prompts import PromptTemplate
from langchain.schema import HumanMessage
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class ContentAnalyzer:
    """Analyze scraped content to extract keywords and target audience using LLM."""
    
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            print("⚠️  WARNING: ANTHROPIC_API_KEY not found in environment variables!")
            print("  Make sure you have a .env file with ANTHROPIC_API_KEY=your_key_here")
        else:
            print(f"✅ API key loaded (length: {len(api_key)} chars)")
            
        self.llm = ChatAnthropic(
            model="claude-3-haiku-20240307",
            anthropic_api_key=api_key,
            temperature=0.3,
            max_tokens=500
        )
        
        self.analysis_prompt = PromptTemplate(
            input_variables=["content"],
            template="""Analyze the following website content and extract:
1. Primary target keyword/topic (1-3 words that best represent the main topic)
2. Target audience (brief description of intended readers)

Website content:
{content}

Return ONLY a JSON object in this exact format:
{{
  "keyword": "main topic or keyword",
  "target_audience": "description of intended audience"
}}

Be specific and concise. The keyword should be the core topic of the content."""
        )
    
    async def analyze_content(self, content: str) -> Dict[str, str]:
        """Analyze content and extract keyword and target audience."""
        print(f"\n🤖 Content Analyzer: Starting content analysis...")
        print(f"📊 Content length: {len(content):,} characters")
        
        try:
            # Truncate content if too long
            if len(content) > 5000:
                print(f"✂️  Truncating content from {len(content):,} to 5,000 characters for analysis")
                content = content[:5000] + "..."
            
            prompt = self.analysis_prompt.format(content=content)
            
            # Get response from LLM
            print(f"🧠 Sending content to Claude for analysis...")
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            
            print(f"📝 Raw LLM response: {response.content}")
            
            # Parse JSON response
            result = self._parse_json_response(response.content)
            
            # Validate result
            if not result.get("keyword") or not result.get("target_audience"):
                raise ValueError("Missing required fields in analysis result")
            
            # Clean and validate the extracted data
            result["keyword"] = result["keyword"].strip()[:50]  # Limit keyword length
            result["target_audience"] = result["target_audience"].strip()[:200]  # Limit audience description
            
            print(f"✅ Analysis complete!")
            print(f"🎯 Extracted keyword: '{result['keyword']}'")
            print(f"👥 Extracted target audience: '{result['target_audience']}'")
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing content: {str(e)}")
            print(f"❌ Error during analysis: {str(e)}")
            print(f"⚠️  Returning default values")
            # Return defaults on error
            return {
                "keyword": "general content",
                "target_audience": "general audience"
            }
    
    def _parse_json_response(self, response: str) -> Dict[str, str]:
        """Parse JSON from LLM response, handling common formatting issues."""
        try:
            # Try direct parsing first
            return json.loads(response)
        except json.JSONDecodeError:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{[^{}]*\}', response, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass
            
            # If all else fails, try to extract key-value pairs
            keyword_match = re.search(r'"keyword"\s*:\s*"([^"]+)"', response)
            audience_match = re.search(r'"target_audience"\s*:\s*"([^"]+)"', response)
            
            if keyword_match and audience_match:
                return {
                    "keyword": keyword_match.group(1),
                    "target_audience": audience_match.group(1)
                }
            
            raise ValueError("Could not parse JSON response")

# Singleton instance
content_analyzer = ContentAnalyzer()