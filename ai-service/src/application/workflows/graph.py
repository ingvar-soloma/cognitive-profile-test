from langgraph.graph import StateGraph, END
from src.domain.state import AgentState
from src.application.agents.nodes import router_node, retriever_node, synthesizer_node, critique_node, mcp_tools_node

def create_report_generation_graph():
    """
    Builds the LangGraph workflow for agentic RAG.
    """
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("router", router_node)
    workflow.add_node("retriever", retriever_node)
    workflow.add_node("mcp_tools", mcp_tools_node)
    workflow.add_node("synthesizer", synthesizer_node)
    workflow.add_node("evaluator", critique_node)
    
    # Set entry point
    workflow.set_entry_point("router")
    
    # Conditional routing from router
    def route_after_router(state: AgentState) -> str:
        action = state.get("next_action", "synthesize")
        if action == "retrieve_literature":
            return "retriever"
        elif action == "fetch_mcp_stats":
            return "mcp_tools"
        else:
            return "synthesize"
            
    workflow.add_conditional_edges("router", route_after_router)
    
    # After retrieving data, go to synthesis
    workflow.add_edge("retriever", "synthesizer")
    workflow.add_edge("mcp_tools", "synthesizer")
    
    # After synthesis, critique
    workflow.add_edge("synthesizer", "evaluator")
    
    # Conditional routing from critique
    def route_after_critique(state: AgentState) -> str:
        # Check if the report was finalized (is_acceptable = True)
        if state.get("final_report"):
            return END
            
        # Limit the number of retries to prevent infinite loops
        if state.get("iteration_count", 0) >= 2:
            return END
            
        return "synthesizer" # loops back to improve based on critique
        
    workflow.add_conditional_edges("evaluator", route_after_critique)
    
    return workflow.compile()
