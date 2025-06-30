import os
import json
from typing import Dict, Any
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain.schema import HumanMessage, SystemMessage
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

load_dotenv()

class AnthropicService:
    def __init__(self):
        self.model = os.getenv("ANTHROPIC_MODEL")
        self.max_tokens = int(os.getenv("MAX_TOKENS"))
        self.temperature = float(os.getenv("TEMPERATURE"))
        
        # LangChain integration
        self.langchain_client = ChatAnthropic(
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
            model_name=self.model,
            temperature=self.temperature,
            max_tokens=self.max_tokens
        )

    async def generate_brief(
        self,
        keyword: str,
        content_type: str,
        tone: str,
        target_audience: str
    ) -> Dict[str, Any]:
        prompt = self._create_prompt(keyword, content_type, tone, target_audience)
        
        try:
            messages = [
                SystemMessage(content="You are an expert content strategist and SEO specialist. Generate comprehensive content briefs in valid JSON format. Always respond with properly formatted JSON only, no additional text."),
                HumanMessage(content=prompt)
            ]
            
            response = self.langchain_client.invoke(messages)
            content = response.content
            
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
            raise Exception(f"LangChain API error: {str(e)}")

    def _create_prompt(
        self,
        keyword: str,
        content_type: str,
        tone: str,
        target_audience: str
    ) -> str:
        return f"""
Generate a comprehensive content brief for a {content_type} about "{keyword}" targeting {target_audience}.
Use a {tone} tone.

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
        "style": "Writing style recommendations"
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
                "style": "informative"
            }
        
        return data
    
    async def generate_article_from_brief(self, brief_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            # Generate introduction
            intro_content = await self._generate_introduction(brief_data)
            
            # Generate body sections
            sections_content = []
            for section in brief_data.get("outline", []):
                section_content = await self._generate_section(
                    section, 
                    brief_data, 
                    intro_content + "\n\n" + "\n\n".join(sections_content)
                )
                sections_content.append(section_content)
            
            # Generate conclusion
            conclusion_content = await self._generate_conclusion(
                brief_data, 
                intro_content + "\n\n" + "\n\n".join(sections_content)
            )
            
            # Assemble complete article
            complete_article = self._assemble_article(
                brief_data,
                intro_content,
                sections_content,
                conclusion_content
            )
            
            # Calculate final word count
            actual_word_count = len(complete_article.split())
            
            return {
                "title": brief_data.get("title", ""),
                "content": complete_article,
                "word_count": actual_word_count,
                "sections": len(sections_content) + 2  # intro + sections + conclusion
            }
            
        except Exception as e:
            raise Exception(f"Article generation error: {str(e)}")
    
    async def _generate_introduction(self, brief_data: Dict[str, Any]) -> str:
        intro_template = PromptTemplate(
            input_variables=["title", "key_points", "target_audience", "tone"],
            template="""Write an engaging introduction for an article titled "{title}".

Target audience: {target_audience}
Tone: {tone}
Key points to preview: {key_points}

Create a compelling hook, provide context, and end with a clear thesis statement.
Write 2-3 concise paragraphs that draw readers in and set up the article's main points.

Return only the introduction text, no additional formatting."""
        )
        
        chain = LLMChain(llm=self.langchain_client, prompt=intro_template)
        
        key_points_str = ", ".join(brief_data.get("key_points", []))
        
        result = await chain.arun(
            title=brief_data.get("title", ""),
            key_points=key_points_str,
            target_audience=brief_data.get("recommendations", {}).get("target_audience", "general audience"),
            tone=brief_data.get("recommendations", {}).get("tone", "professional")
        )
        
        return result.strip()
    
    async def _generate_section(self, section: Dict[str, Any], brief_data: Dict[str, Any], previous_content: str) -> str:
        section_template = PromptTemplate(
            input_variables=["heading", "subpoints", "previous_content", "tone", "target_audience"],
            template="""Write a detailed section for the heading "{heading}".

Subpoints to cover: {subpoints}
Target audience: {target_audience}
Tone: {tone}
Previous content for context: {previous_content}

Write 2-3 focused paragraphs that thoroughly cover the subpoints.
Ensure smooth transitions from the previous content.
Use examples and explanations appropriate for the target audience.
Keep it concise but comprehensive.

Return only the section content with the heading, no additional formatting."""
        )
        
        chain = LLMChain(llm=self.langchain_client, prompt=section_template)
        
        subpoints_str = ", ".join(section.get("subpoints", []))
        
        result = await chain.arun(
            heading=section.get("heading", ""),
            subpoints=subpoints_str,
            previous_content=previous_content[-500:] if len(previous_content) > 500 else previous_content,
            tone=brief_data.get("recommendations", {}).get("tone", "professional"),
            target_audience=brief_data.get("recommendations", {}).get("target_audience", "general audience")
        )
        
        return result.strip()
    
    async def _generate_conclusion(self, brief_data: Dict[str, Any], article_content: str) -> str:
        conclusion_template = PromptTemplate(
            input_variables=["title", "key_points", "article_content", "tone"],
            template="""Write a compelling conclusion for an article titled "{title}".

Key points covered: {key_points}
Tone: {tone}
Article content for context: {article_content}

Create a conclusion that:
1. Summarizes the main points
2. Reinforces the article's value
3. Includes a call-to-action or next steps
4. Ends with a memorable final thought

Write 2-3 concise paragraphs that provide closure and inspire action.

Return only the conclusion text, no additional formatting."""
        )
        
        chain = LLMChain(llm=self.langchain_client, prompt=conclusion_template)
        
        key_points_str = ", ".join(brief_data.get("key_points", []))
        
        result = await chain.arun(
            title=brief_data.get("title", ""),
            key_points=key_points_str,
            article_content=article_content[-800:] if len(article_content) > 800 else article_content,
            tone=brief_data.get("recommendations", {}).get("tone", "professional")
        )
        
        return result.strip()
    
    
    def _assemble_article(self, brief_data: Dict[str, Any], intro: str, sections: list, conclusion: str) -> str:
        title = brief_data.get("title", "")
        
        article_parts = [f"# {title}", "", intro, ""]
        
        for i, section_content in enumerate(sections):
            article_parts.append(section_content)
            if i < len(sections) - 1:
                article_parts.append("")
        
        article_parts.extend(["", conclusion])
        
        return "\n".join(article_parts)