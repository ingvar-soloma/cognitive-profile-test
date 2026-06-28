from langchain_core.language_models.chat_models import BaseChatModel
import os

class LLMFactory:
    """
    Factory for instantiating LLMs.
    Defaults to Gemini (since the main project uses it), but is designed
    to easily swap to OpenAI or Anthropic in the future.
    """
    
    @staticmethod
    def get_llm(provider: str = "gemini", model_name: str = "gemini-3.1-flash", temperature: float = 0.2) -> BaseChatModel:
        if provider == "gemini":
            from langchain_google_genai import ChatGoogleGenerativeAI
            return ChatGoogleGenerativeAI(
                model=model_name,
                temperature=temperature,
                google_api_key=os.getenv("GEMINI_API_KEY")
            )
        elif provider == "openai":
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                model=model_name,
                temperature=temperature,
                api_key=os.getenv("OPENAI_API_KEY")
            )
        elif provider == "anthropic":
            from langchain_anthropic import ChatAnthropic
            return ChatAnthropic(
                model=model_name,
                temperature=temperature,
                api_key=os.getenv("ANTHROPIC_API_KEY")
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
