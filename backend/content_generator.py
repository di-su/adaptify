from typing import Dict, Any
from langchain.chains import LLMChain
from .content_prompts import ContentPrompts

class ContentGenerator:
    def __init__(self, llm_client):
        self.llm_client = llm_client
        self.prompts = ContentPrompts()

    async def generate_introduction(self, brief_data: Dict[str, Any]) -> str:
        chain = LLMChain(llm=self.llm_client, prompt=self.prompts.get_introduction_template())
        
        key_points_str = ", ".join(brief_data.get("key_points", []))
        
        result = await chain.arun(
            title=brief_data.get("title", ""),
            key_points=key_points_str,
            target_audience=brief_data.get("recommendations", {}).get(
                "target_audience", "general audience"
            ),
            tone=brief_data.get("recommendations", {}).get("tone", "professional"),
        )
        
        return result.strip()

    async def generate_section(
        self, section: Dict[str, Any], brief_data: Dict[str, Any], previous_content: str
    ) -> str:
        chain = LLMChain(llm=self.llm_client, prompt=self.prompts.get_section_template())
        
        subpoints_str = ", ".join(section.get("subpoints", []))
        
        result = await chain.arun(
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
        
        return result.strip()

    async def generate_conclusion(
        self, brief_data: Dict[str, Any], article_content: str
    ) -> str:
        chain = LLMChain(llm=self.llm_client, prompt=self.prompts.get_conclusion_template())
        
        key_points_str = ", ".join(brief_data.get("key_points", []))
        
        result = await chain.arun(
            title=brief_data.get("title", ""),
            key_points=key_points_str,
            article_content=(
                article_content[-800:]
                if len(article_content) > 800
                else article_content
            ),
            tone=brief_data.get("recommendations", {}).get("tone", "professional"),
        )
        
        return result.strip()

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
