import os
import json
from typing import Dict, Any
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()

class AnthropicService:
    def __init__(self):
        self.client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model = os.getenv("ANTHROPIC_MODEL", "claude-3-sonnet-20240229")
        self.max_tokens = int(os.getenv("MAX_TOKENS", "2000"))
        self.temperature = float(os.getenv("TEMPERATURE", "0.7"))

    async def generate_brief(
        self,
        keyword: str,
        content_type: str,
        tone: str,
        target_audience: str,
        word_count: int
    ) -> Dict[str, Any]:
        
        prompt = self._create_prompt(keyword, content_type, tone, target_audience, word_count)
        
        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system="You are an expert content strategist and SEO specialist. Generate comprehensive content briefs in valid JSON format. Always respond with properly formatted JSON only, no additional text.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            content = response.content[0].text
            # Clean up the response in case it has markdown formatting
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            brief_data = json.loads(content)
            
            return self._validate_and_format_response(brief_data)
            
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse JSON response: {str(e)}")
        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")

    def _create_prompt(
        self,
        keyword: str,
        content_type: str,
        tone: str,
        target_audience: str,
        word_count: int
    ) -> str:
        return f"""
Generate a comprehensive content brief for a {content_type} about "{keyword}" targeting {target_audience}.
Use a {tone} tone and aim for approximately {word_count} words.

Create a detailed content brief in JSON format with the following structure:
{{
    "title": "SEO-optimized title including the main keyword",
    "meta_description": "Compelling meta description (max 155 characters)",
    "outline": [
        {{
            "heading": "Main section heading (H2)",
            "subpoints": ["Key point 1", "Key point 2", "Key point 3"]
        }}
    ],
    "key_points": ["Important concept 1", "Important concept 2", "Important concept 3", "Important concept 4"],
    "recommendations": {{
        "tone": "Specific tone guidance",
        "style": "Writing style recommendations",
        "length": {word_count}
    }}
}}

Make sure to:
1. Include the keyword naturally in the title and throughout the outline
2. Create at least 3-5 main sections with detailed subpoints
3. Focus on providing value and answering user intent
4. Make the content comprehensive and thorough
5. Ensure all headings are engaging and descriptive

Important: Return ONLY valid JSON, no markdown formatting or additional text."""

    def _validate_and_format_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        required_fields = ["title", "meta_description", "outline", "key_points", "recommendations"]
        
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")
        
        if len(data["meta_description"]) > 160:
            data["meta_description"] = data["meta_description"][:155] + "..."
        
        formatted_outline = []
        for item in data["outline"]:
            if isinstance(item, dict) and "heading" in item and "subpoints" in item:
                formatted_outline.append({
                    "heading": item["heading"],
                    "subpoints": item["subpoints"] if isinstance(item["subpoints"], list) else []
                })
        
        data["outline"] = formatted_outline
        
        if "recommendations" not in data or not isinstance(data["recommendations"], dict):
            data["recommendations"] = {
                "tone": "professional",
                "style": "informative",
                "length": 1500
            }
        
        return data