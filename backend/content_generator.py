from typing import Dict, Any
import anthropic
from content_prompts import ContentPrompts

class ContentGenerator:
    def __init__(self, anthropic_client: anthropic.Anthropic, config):
        self.client = anthropic_client
        self.config = config
        self.prompts = ContentPrompts()

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