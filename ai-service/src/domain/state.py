from typing import TypedDict, Annotated, List, Dict, Any
import operator

class AgentState(TypedDict):
    """
    State for the LangGraph agent workflow.
    """
    user_profile: Dict[str, Any]
    retrieved_documents: Annotated[List[str], operator.add]
    research_notes: Annotated[List[str], operator.add]
    draft_report: str
    critique: str
    next_action: str
    final_report: Dict[str, Any]
    iteration_count: int
    messages: Annotated[list, operator.add]
