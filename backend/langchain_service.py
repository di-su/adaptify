import json
from typing import Dict, Any

from response_validator import ResponseValidator
from langchain_content_generator import LangChainContentGenerator


class LangChainService:
    """Service using LangChain for multi-LLM content generation."""
    
    def __init__(self):
        self.generator = LangChainContentGenerator()
    
    async def generate_brief(
        self, keyword: str, content_type: str, tone: str, target_audience: str
    ) -> Dict[str, Any]:
        """Generate content brief using LangChain."""
        try:
            response = await self.generator.generate_brief(
                keyword, content_type, tone, target_audience
            )
            
            content = ResponseValidator.clean_json_response(response)
            brief_data = json.loads(content)
            
            return ResponseValidator.validate_and_format_brief(brief_data)
            
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse JSON response: {str(e)}")
        except Exception as e:
            raise Exception(f"Brief generation error: {str(e)}")
    
    async def generate_article_from_brief(
        self, brief_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate article using LangChain with Claude for content and ChatGPT for conclusion."""
        try:
            # Generate introduction using Claude
            intro_content = await self.generator.generate_introduction(brief_data)
            
            # Generate body sections using Claude
            sections_content = []
            for section in brief_data.get("outline", []):
                section_content = await self.generator.generate_section(
                    section,
                    brief_data,
                    intro_content + "\n\n" + "\n\n".join(sections_content),
                )
                sections_content.append(section_content)
            
            # Generate conclusion using LangChain (demonstrates multi-LLM pattern)
            conclusion_content = await self.generator.generate_conclusion(
                brief_data, intro_content + "\n\n" + "\n\n".join(sections_content)
            )
            
            # Assemble complete article
            complete_article = self.generator.assemble_article(
                brief_data, intro_content, sections_content, conclusion_content
            )
            
            # Calculate final word count
            actual_word_count = len(complete_article.split())
            
            return {
                "title": brief_data.get("title", ""),
                "content": complete_article,
                "word_count": actual_word_count,
                "sections": len(sections_content) + 2,  # intro + sections + conclusion
                "llm_info": {
                    "brief_and_content": "Claude 3.5 Sonnet (via LangChain)",
                    "conclusion": "Claude 3.5 Sonnet (via LangChain)",
                    "framework": "LangChain"
                }
            }
            
        except Exception as e:
            raise Exception(f"Article generation error: {str(e)}")