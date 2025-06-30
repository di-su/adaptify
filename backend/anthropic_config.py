import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class AnthropicConfig:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.model = os.getenv("ANTHROPIC_MODEL", "claude-3-sonnet-20240229")
        self.max_tokens = int(os.getenv("MAX_TOKENS", "4000"))
        self.temperature = float(os.getenv("TEMPERATURE", "0.7"))
    
    def validate(self) -> None:
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY is required")
        if self.max_tokens <= 0:
            raise ValueError("MAX_TOKENS must be positive")
        if not 0 <= self.temperature <= 1:
            raise ValueError("TEMPERATURE must be between 0 and 1")
