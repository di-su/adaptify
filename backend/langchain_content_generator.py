from typing import Dict, Any
from langchain.chains import LLMChain
from langchain_config import LangChainConfig
from langchain_prompts import LangChainPrompts
from rag_service import rag_service
from constants import (
    DEFAULT_TONE,
    DEFAULT_TARGET_AUDIENCE,
    SECTION_CONTEXT_LIMIT,
    CONCLUSION_CONTEXT_LIMIT,
)


class LangChainContentGenerator:
    """Content generator using LangChain for multi-LLM workflow."""
    
    def __init__(self):
        self.config = LangChainConfig()
        
        # Create chains for different content types
        self.brief_chain = LLMChain(
            llm=self.config.get_anthropic_llm(),
            prompt=LangChainPrompts.get_brief_prompt(),
            output_key="brief"
        )
        
        self.intro_chain = LLMChain(
            llm=self.config.get_anthropic_llm(),
            prompt=LangChainPrompts.get_introduction_prompt(),
            output_key="introduction"
        )
        
        self.section_chain = LLMChain(
            llm=self.config.get_anthropic_llm(),
            prompt=LangChainPrompts.get_section_prompt(),
            output_key="section"
        )
        
        # Use separate LLM for conclusions (currently also Claude, but shows multi-LLM pattern)
        self.conclusion_chain = LLMChain(
            llm=self.config.get_conclusion_llm(),
            prompt=LangChainPrompts.get_conclusion_prompt(),
            output_key="conclusion"
        )
    
    def _get_recommendations(self, brief_data: Dict[str, Any]) -> Dict[str, str]:
        """Extract recommendations with defaults."""
        recommendations = brief_data.get("recommendations", {})
        return {
            "tone": recommendations.get("tone", DEFAULT_TONE),
            "target_audience": recommendations.get(
                "target_audience", DEFAULT_TARGET_AUDIENCE
            ),
        }
    
    async def generate_brief(self, keyword: str, content_type: str, tone: str, target_audience: str) -> str:
        """Generate content brief using LangChain."""
        try:
            result = await self.brief_chain.arun(
                keyword=keyword,
                content_type=content_type,
                tone=tone,
                target_audience=target_audience
            )
            return result.strip()
        except Exception as e:
            raise Exception(f"Brief generation failed: {str(e)}")
    
    async def generate_introduction(self, brief_data: Dict[str, Any]) -> str:
        """Generate introduction using Claude via LangChain."""
        key_points_str = ", ".join(brief_data.get("key_points", []))
        recommendations = self._get_recommendations(brief_data)
        
        # Use RAG to retrieve relevant content
        query = f"{brief_data.get('title', '')} introduction {key_points_str}"
        relevant_docs = rag_service.retrieve_relevant_content(query, k=3)
        
        # Combine retrieved chunks as reference content
        reference_content = "\n\n".join([
            f"[Source: {doc['source']}]\n{doc['content']}" 
            for doc in relevant_docs
        ]) if relevant_docs else "No reference content available."
        
        try:
            result = await self.intro_chain.arun(
                title=brief_data.get("title", ""),
                key_points=key_points_str,
                target_audience=recommendations["target_audience"],
                tone=recommendations["tone"],
                reference_content=reference_content
            )
            return result.strip()
        except Exception as e:
            raise Exception(f"Introduction generation failed: {str(e)}")
    
    async def generate_section(
        self, section: Dict[str, Any], brief_data: Dict[str, Any], previous_content: str
    ) -> str:
        """Generate section using Claude via LangChain."""
        subpoints_str = ", ".join(section.get("subpoints", []))
        recommendations = self._get_recommendations(brief_data)
        
        # Truncate previous content if too long
        if len(previous_content) > SECTION_CONTEXT_LIMIT:
            previous_content = previous_content[-SECTION_CONTEXT_LIMIT:]
        
        # Use RAG to retrieve relevant content for this section
        query = f"{section.get('heading', '')} {subpoints_str} {recommendations['target_audience']}"
        relevant_docs = rag_service.retrieve_relevant_content(query, k=3)
        
        # Combine retrieved chunks as reference content
        reference_content = "\n\n".join([
            f"[Source: {doc['source']}]\n{doc['content']}" 
            for doc in relevant_docs
        ]) if relevant_docs else "No reference content available."
        
        try:
            result = await self.section_chain.arun(
                heading=section.get("heading", ""),
                subpoints=subpoints_str,
                previous_content=previous_content,
                tone=recommendations["tone"],
                target_audience=recommendations["target_audience"],
                reference_content=reference_content
            )
            return result.strip()
        except Exception as e:
            raise Exception(f"Section generation failed: {str(e)}")
    
    async def generate_conclusion(
        self, brief_data: Dict[str, Any], article_content: str
    ) -> str:
        """Generate conclusion using LangChain (currently Claude, but pattern supports multiple LLMs)."""
        key_points_str = ", ".join(brief_data.get("key_points", []))
        recommendations = self._get_recommendations(brief_data)
        
        # Truncate article content if too long
        if len(article_content) > CONCLUSION_CONTEXT_LIMIT:
            article_content = article_content[-CONCLUSION_CONTEXT_LIMIT:]
        
        # Use RAG to retrieve relevant content for conclusion
        query = f"{brief_data.get('title', '')} conclusion summary {key_points_str}"
        relevant_docs = rag_service.retrieve_relevant_content(query, k=3)
        
        # Combine retrieved chunks as reference content
        reference_content = "\n\n".join([
            f"[Source: {doc['source']}]\n{doc['content']}" 
            for doc in relevant_docs
        ]) if relevant_docs else "No reference content available."
        
        try:
            result = await self.conclusion_chain.arun(
                title=brief_data.get("title", ""),
                key_points=key_points_str,
                article_content=article_content,
                tone=recommendations["tone"],
                reference_content=reference_content
            )
            return result.strip()
        except Exception as e:
            raise Exception(f"Conclusion generation failed: {str(e)}")
    
    def assemble_article(
        self, brief_data: Dict[str, Any], intro: str, sections: list, conclusion: str
    ) -> str:
        """Assemble the complete article."""
        title = brief_data.get("title", "")
        
        article_parts = [f"# {title}", "", intro, ""]
        
        for i, section_content in enumerate(sections):
            article_parts.append(section_content)
            if i < len(sections) - 1:
                article_parts.append("")
        
        article_parts.extend(["", conclusion])
        
        return "\n".join(article_parts)