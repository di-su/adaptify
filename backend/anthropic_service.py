import json
from typing import Dict, Any
from langchain_anthropic import ChatAnthropic
from langchain.schema import HumanMessage, SystemMessage

from anthropic_config import AnthropicConfig
from content_prompts import ContentPrompts
from response_validator import ResponseValidator
from content_generator import ContentGenerator


class AnthropicService:
    def __init__(self):
        self.config = AnthropicConfig()
        self.config.validate()
        
        self.langchain_client = ChatAnthropic(
            anthropic_api_key=self.config.api_key,
            model_name=self.config.model,
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens,
        )
        
        self.prompts = ContentPrompts()
        self.validator = ResponseValidator()
        self.generator = ContentGenerator(self.langchain_client)

    async def generate_brief(
        self, keyword: str, content_type: str, tone: str, target_audience: str
    ) -> Dict[str, Any]:
        prompt = self.prompts.get_brief_prompt(keyword, content_type, tone, target_audience)

        try:
            messages = [
                SystemMessage(
                    content="You are an expert content strategist and SEO specialist. Generate comprehensive content briefs in valid JSON format. Always respond with properly formatted JSON only, no additional text."
                ),
                HumanMessage(content=prompt),
            ]

            response = self.langchain_client.invoke(messages)
            content = self.validator.clean_json_response(response.content)
            brief_data = json.loads(content)

            return self.validator.validate_and_format_brief(brief_data)

        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse JSON response: {str(e)}")
        except Exception as e:
            raise Exception(f"LangChain API error: {str(e)}")



    async def generate_article_from_brief(
        self, brief_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            # Generate introduction
            intro_content = await self.generator.generate_introduction(brief_data)

            # Generate body sections
            sections_content = []
            for section in brief_data.get("outline", []):
                section_content = await self.generator.generate_section(
                    section,
                    brief_data,
                    intro_content + "\n\n" + "\n\n".join(sections_content),
                )
                sections_content.append(section_content)

            # Generate conclusion
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
            }

        except Exception as e:
            raise Exception(f"Article generation error: {str(e)}")




