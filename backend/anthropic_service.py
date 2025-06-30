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
            # Generate introduction
            intro_content = await self.generate_introduction(brief_data)

            # Generate body sections
            sections_content = []
            for section in brief_data.get("outline", []):
                section_content = await self.generate_section(
                    section,
                    brief_data,
                    intro_content + "\n\n" + "\n\n".join(sections_content),
                )
                sections_content.append(section_content)

            # Generate conclusion
            conclusion_content = await self.generate_conclusion(
                brief_data, intro_content + "\n\n" + "\n\n".join(sections_content)
            )

            # Assemble complete article
            complete_article = self.assemble_article(
                brief_data, intro_content, sections_content, conclusion_content
            )

            # Calculate final word count
            actual_word_count = len(complete_article.split())

            return {
                "title": brief_data.get("title", ""),
                "content": complete_article,
                "word_count": actual_word_count,
                "sections": len(sections_content) + 2,  # intro + sections + conclusion
            }

        except Exception as e:
            raise Exception(f"Article generation error: {str(e)}")

    async def generate_introduction(self, brief_data: Dict[str, Any]) -> str:
        key_points_str = ", ".join(brief_data.get("key_points", []))
        
        prompt = self.prompts.get_introduction_prompt(
            title=brief_data.get("title", ""),
            key_points=key_points_str,
            target_audience=brief_data.get("recommendations", {}).get(
                "target_audience", "general audience"
            ),
            tone=brief_data.get("recommendations", {}).get("tone", "professional"),
        )
        
        response = self.client.messages.create(
            model=self.config.model,
            max_tokens=1000,
            temperature=self.config.temperature,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text.strip()

    async def generate_section(
        self, section: Dict[str, Any], brief_data: Dict[str, Any], previous_content: str
    ) -> str:
        subpoints_str = ", ".join(section.get("subpoints", []))
        
        prompt = self.prompts.get_section_prompt(
            heading=section.get("heading", ""),
            subpoints=subpoints_str,
            previous_content=(
                previous_content[-500:]
                if len(previous_content) > 500
                else previous_content
            ),
            tone=brief_data.get("recommendations", {}).get("tone", "professional"),
            target_audience=brief_data.get("recommendations", {}).get(
                "target_audience", "general audience"
            ),
        )
        
        response = self.client.messages.create(
            model=self.config.model,
            max_tokens=1500,
            temperature=self.config.temperature,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text.strip()

    async def generate_conclusion(
        self, brief_data: Dict[str, Any], article_content: str
    ) -> str:
        key_points_str = ", ".join(brief_data.get("key_points", []))
        
        prompt = self.prompts.get_conclusion_prompt(
            title=brief_data.get("title", ""),
            key_points=key_points_str,
            article_content=(
                article_content[-800:]
                if len(article_content) > 800
                else article_content
            ),
            tone=brief_data.get("recommendations", {}).get("tone", "professional"),
        )
        
        response = self.client.messages.create(
            model=self.config.model,
            max_tokens=1000,
            temperature=self.config.temperature,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text.strip()

    def assemble_article(
        self, brief_data: Dict[str, Any], intro: str, sections: list, conclusion: str
    ) -> str:
        title = brief_data.get("title", "")
        
        article_parts = [f"# {title}", "", intro, ""]
        
        for i, section_content in enumerate(sections):
            article_parts.append(section_content)
            if i < len(sections) - 1:
                article_parts.append("")
        
        article_parts.extend(["", conclusion])
        
        return "\n".join(article_parts)




