from typing import Dict, Any
from constants import MAX_META_DESCRIPTION_LENGTH, DEFAULT_TONE


class ResponseValidator:
    @staticmethod
    def validate_and_format_brief(data: Dict[str, Any]) -> Dict[str, Any]:
        required_fields = [
            "title",
            "meta_description",
            "outline",
            "key_points",
            "recommendations",
        ]

        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        # Truncate meta description if too long
        if len(data["meta_description"]) > MAX_META_DESCRIPTION_LENGTH:
            data["meta_description"] = (
                data["meta_description"][: MAX_META_DESCRIPTION_LENGTH - 3] + "..."
            )

        # Format outline
        formatted_outline = []
        for item in data["outline"]:
            if isinstance(item, dict) and "heading" in item and "subpoints" in item:
                formatted_outline.append(
                    {
                        "heading": item["heading"],
                        "subpoints": (
                            item["subpoints"]
                            if isinstance(item["subpoints"], list)
                            else []
                        ),
                    }
                )

        data["outline"] = formatted_outline

        # Ensure recommendations exist with proper defaults
        if "recommendations" not in data or not isinstance(
            data["recommendations"], dict
        ):
            data["recommendations"] = {"tone": DEFAULT_TONE, "style": "informative"}

        return data

    @staticmethod
    def clean_json_response(content: str) -> str:
        # Clean up the response in case it has markdown formatting
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        
        # Remove invalid control characters that can break JSON parsing
        import re
        # Remove control characters except newlines, tabs, and carriage returns
        content = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]', '', content)
        
        return content.strip()
