class ContentPrompts:
    @staticmethod
    def get_brief_prompt(keyword: str, content_type: str, tone: str, target_audience: str) -> str:
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