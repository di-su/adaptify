from typing import Dict, Any
import anthropic
from content_prompts import ContentPrompts
from constants import (
    DEFAULT_TONE, DEFAULT_TARGET_AUDIENCE, SECTION_CONTEXT_LIMIT, CONCLUSION_CONTEXT_LIMIT,
    MAX_TOKENS_INTRO, MAX_TOKENS_SECTION, MAX_TOKENS_CONCLUSION
)

class ContentGenerator:
    def __init__(self, anthropic_client: anthropic.Anthropic, config):
        self.client = anthropic_client
        self.config = config
        self.prompts = ContentPrompts()

    def _get_recommendations(self, brief_data: Dict[str, Any]) -> Dict[str, str]:
        """Extract recommendations with defaults."""
        recommendations = brief_data.get("recommendations", {})
        return {
            "tone": recommendations.get("tone", DEFAULT_TONE),
            "target_audience": recommendations.get("target_audience", DEFAULT_TARGET_AUDIENCE)
        }

    async def _generate_content(self, prompt: str, max_tokens: int = 1000) -> str:
        """Common method for generating content via Anthropic API."""
        response = self.client.messages.create(
            model=self.config.model,
            max_tokens=max_tokens,
            temperature=self.config.temperature,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text.strip()

    async def generate_introduction(self, brief_data: Dict[str, Any]) -> str:
        key_points_str = ", ".join(brief_data.get("key_points", []))
        recommendations = self._get_recommendations(brief_data)
        
        prompt = self.prompts.get_introduction_prompt(
            title=brief_data.get("title", ""),
            key_points=key_points_str,
            target_audience=recommendations["target_audience"],
            tone=recommendations["tone"],
        )
        
        return await self._generate_content(prompt, max_tokens=MAX_TOKENS_INTRO)

    async def generate_section(
        self, section: Dict[str, Any], brief_data: Dict[str, Any], previous_content: str
    ) -> str:
        subpoints_str = ", ".join(section.get("subpoints", []))
        recommendations = self._get_recommendations(brief_data)
        
        # Truncate previous content if too long
        if len(previous_content) > SECTION_CONTEXT_LIMIT:
            previous_content = previous_content[-SECTION_CONTEXT_LIMIT:]
        
        prompt = self.prompts.get_section_prompt(
            heading=section.get("heading", ""),
            subpoints=subpoints_str,
            previous_content=previous_content,
            tone=recommendations["tone"],
            target_audience=recommendations["target_audience"],
        )
        
        return await self._generate_content(prompt, max_tokens=MAX_TOKENS_SECTION)

    async def generate_conclusion(
        self, brief_data: Dict[str, Any], article_content: str
    ) -> str:
        key_points_str = ", ".join(brief_data.get("key_points", []))
        recommendations = self._get_recommendations(brief_data)
        
        # Truncate article content if too long
        if len(article_content) > CONCLUSION_CONTEXT_LIMIT:
            article_content = article_content[-CONCLUSION_CONTEXT_LIMIT:]
        
        prompt = self.prompts.get_conclusion_prompt(
            title=brief_data.get("title", ""),
            key_points=key_points_str,
            article_content=article_content,
            tone=recommendations["tone"],
        )
        
        return await self._generate_content(prompt, max_tokens=MAX_TOKENS_CONCLUSION)

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