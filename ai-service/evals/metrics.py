from src.infrastructure.llms.factory import LLMFactory
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

class EvaluationResult(BaseModel):
    score: int = Field(ge=1, le=5, description="Score from 1 to 5")
    reasoning: str = Field(description="Explanation for the score")

class LLMJudge:
    """
    Implements an LLM-as-a-judge pattern to evaluate the generated report
    against the retrieved context and user profile.
    """
    def __init__(self, provider: str = "gemini", model_name: str = "gemini-3.1-pro"):
        # We use a more capable model (Pro) for judging by default
        self.llm = LLMFactory.get_llm(provider, model_name).with_structured_output(EvaluationResult)

    def evaluate_faithfulness(self, context: str, generated_report: str) -> EvaluationResult:
        """
        Evaluates whether the generated report is faithful to the retrieved scientific context
        (i.e., it doesn't hallucinate).
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert AI evaluator. Your task is to grade the faithfulness of a generated report against the provided context. Give a score from 1 (hallucinates entirely) to 5 (completely faithful)."),
            ("human", "Context: {context}\n\nGenerated Report: {report}")
        ])
        
        chain = prompt | self.llm
        return chain.invoke({"context": context, "report": generated_report})

    def evaluate_relevance(self, user_profile: str, generated_report: str) -> EvaluationResult:
        """
        Evaluates how relevant and personalized the report is to the user's specific test results.
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert AI evaluator. Grade how well the generated report addresses the specific traits in the user's profile. Give a score from 1 (generic/irrelevant) to 5 (highly personalized)."),
            ("human", "User Profile: {profile}\n\nGenerated Report: {report}")
        ])
        
        chain = prompt | self.llm
        return chain.invoke({"profile": user_profile, "report": generated_report})
