import os
from typing import Dict, Any
from langchain_anthropic import ChatAnthropic
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain


class LangChainConfig:
    """Configuration for LangChain LLMs and chains."""
    
    def __init__(self):
        self.anthropic_llm = ChatAnthropic(
            model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest"),
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
            temperature=float(os.getenv("TEMPERATURE", 0.7)),
            max_tokens=int(os.getenv("MAX_TOKENS", 2000))
        )
        
        # For now, use Claude for all content types
        # We can later add OpenAI when tiktoken dependency is resolved
        self.conclusion_llm = self.anthropic_llm
    
    def get_anthropic_llm(self):
        """Get Anthropic LLM for intro and sections."""
        return self.anthropic_llm
    
    def get_conclusion_llm(self):
        """Get LLM for conclusions (currently also Claude)."""
        return self.conclusion_llm