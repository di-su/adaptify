from langchain.prompts import PromptTemplate


class LangChainPrompts:
    """LangChain prompt templates for content generation."""
    
    @staticmethod
    def get_brief_prompt():
        """Prompt template for generating content briefs."""
        return PromptTemplate(
            input_variables=["keyword", "content_type", "tone", "target_audience"],
            template="""Generate a comprehensive content brief for a {content_type} about "{keyword}" targeting {target_audience}.
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
        )
    
    @staticmethod
    def get_introduction_prompt():
        """Prompt template for generating introductions."""
        return PromptTemplate(
            input_variables=["title", "key_points", "target_audience", "tone", "reference_content"],
            template="""Write an engaging introduction for an article titled "{title}".

Target audience: {target_audience}
Tone: {tone}
Key points to preview: {key_points}

Reference content from original source:
{reference_content}

Create a compelling hook, provide context, and end with a clear thesis statement.
Write 1 concise paragraph that draws readers in and sets up the article's main points.
Use the reference content to ensure accuracy and avoid hallucination, especially for niche topics.
Use proper line breaks (\\n\\n) between sentences or logical breaks to improve readability.

Return only the introduction text, no additional formatting."""
        )
    
    @staticmethod
    def get_section_prompt():
        """Prompt template for generating sections."""
        return PromptTemplate(
            input_variables=["heading", "subpoints", "previous_content", "tone", "target_audience", "reference_content"],
            template="""Write a detailed section for the heading "{heading}".

Subpoints to cover: {subpoints}
Target audience: {target_audience}
Tone: {tone}
Previous content for context: {previous_content}

Reference content from original source:
{reference_content}

Write 1-2 focused paragraphs that thoroughly cover the subpoints.
Use proper line breaks (\\n\\n) between paragraphs and logical breaks within paragraphs to improve readability.
Ensure smooth transitions from the previous content.
Use the reference content to provide accurate information and avoid hallucination, especially for niche topics.
Use examples and explanations appropriate for the target audience.
Keep it concise but comprehensive.

Return only the section content with the heading, no additional formatting."""
        )
    
    @staticmethod
    def get_conclusion_prompt():
        """Prompt template for generating conclusions."""
        return PromptTemplate(
            input_variables=["title", "key_points", "article_content", "tone", "reference_content"],
            template="""Write a compelling conclusion for an article titled "{title}".

Key points covered: {key_points}
Tone: {tone}
Article content for context: {article_content}

Reference content from original source:
{reference_content}

Create a conclusion that:
1. Summarizes the main points
2. Reinforces the article's value
3. Includes a call-to-action or next steps
4. Ends with a memorable final thought

Write 1 concise paragraph that provides closure and inspires action.
Use the reference content to ensure accuracy and avoid hallucination.
Use proper line breaks (\\n\\n) between sentences or logical breaks to improve readability.

Return only the conclusion text, no additional formatting."""
        )