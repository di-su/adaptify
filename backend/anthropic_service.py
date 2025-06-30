import json
from typing import Dict, Any
import anthropic

from anthropic_config import AnthropicConfig
from content_prompts import ContentPrompts
from response_validator import ResponseValidator


class AnthropicService:
    def __init__(self):
        self.config = AnthropicConfig()
        self.config.validate()
        
        self.client = anthropic.Anthropic(api_key=self.config.api_key)
        
        self.prompts = ContentPrompts()
        self.validator = ResponseValidator()

    async def generate_brief(
        self, keyword: str, content_type: str, tone: str, target_audience: str
    ) -> Dict[str, Any]:
        prompt = self.prompts.get_brief_prompt(keyword, content_type, tone, target_audience)

        try:
            response = self.client.messages.create(
                model=self.config.model,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                system="You are an expert content strategist and SEO specialist. Generate comprehensive content briefs in valid JSON format. Always respond with properly formatted JSON only, no additional text.",
                messages=[{"role": "user", "content": prompt}]
            )
            
            content = self.validator.clean_json_response(response.content[0].text)
            brief_data = json.loads(content)

            return self.validator.validate_and_format_brief(brief_data)

        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse JSON response: {str(e)}")
        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")



    async def generate_article_from_brief(
        self, brief_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            # Create a simple article generation prompt
            outline_text = "\n".join([f"- {section['heading']}: {', '.join(section['subpoints'])}" for section in brief_data.get("outline", [])])
            
            article_prompt = f"""Write a complete article based on this brief:

Title: {brief_data.get('title', '')}
Target Audience: {brief_data.get('recommendations', {}).get('target_audience', 'general')}
Tone: {brief_data.get('recommendations', {}).get('tone', 'professional')}

Outline:
{outline_text}

Key Points to Include:
{', '.join(brief_data.get('key_points', []))}

Write a comprehensive, well-structured article with an introduction, body sections covering all outline points, and a conclusion. Use proper formatting with headings and paragraphs."""

            response = self.client.messages.create(
                model=self.config.model,
                max_tokens=4000,
                temperature=self.config.temperature,
                messages=[{"role": "user", "content": article_prompt}]
            )
            
            article_content = response.content[0].text
            word_count = len(article_content.split())
            section_count = len(brief_data.get("outline", [])) + 2  # intro + sections + conclusion

            return {
                "title": brief_data.get("title", ""),
                "content": article_content,
                "word_count": word_count,
                "sections": section_count,
            }

        except Exception as e:
            raise Exception(f"Article generation error: {str(e)}")




