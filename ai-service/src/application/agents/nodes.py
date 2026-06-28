from typing import Dict, Any
import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from pydantic.v1 import BaseModel, Field

from src.domain.state import AgentState
from src.infrastructure.llms.factory import LLMFactory
from src.infrastructure.vector_store.pinecone_client import PineconeClient
from src.infrastructure.mcp_tools.adapter import MCPToolAdapter

# Define structured output for Router
class RouterDecision(BaseModel):
    decision: str = Field(description="The next step to take: 'retrieve_literature', 'fetch_mcp_stats', or 'synthesize'")

# Define structured output for Critique
class CritiqueDecision(BaseModel):
    is_acceptable: bool = Field(description="True if the report meets quality standards, False otherwise")
    feedback: str = Field(description="Feedback on what needs to be improved")

async def router_node(state: AgentState) -> dict:
    """
    Decides whether we need to retrieve external documents, use MCP tools, or go straight to synthesis.
    """
    llm = LLMFactory.get_llm(model_name="gemini-3.1-flash")
    structured_llm = llm.with_structured_output(RouterDecision)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert cognitive profile analyzer. Based on the user profile, decide the next step. "
                   "If scientific context is needed about aphantasia, output 'retrieve_literature'. "
                   "If aggregate test statistics are needed, output 'fetch_mcp_stats'. "
                   "If you have enough information, output 'synthesize'."),
        ("user", "User Profile Data: {profile}")
    ])
    
    chain = prompt | structured_llm
    decision = await chain.ainvoke({"profile": str(state.get("user_profile", {}))})
    
    # Store the decision in state
    return {"next_action": decision.decision, "messages": [f"Router decided: {decision.decision}"]}

async def mcp_tools_node(state: AgentState) -> dict:
    """
    Uses the MCP Adapter to fetch aggregate stats if needed.
    """
    # Connect to local MCP server
    server_script = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
        "infrastructure", "mcp_tools", "sample_server.py"
    )
    adapter = MCPToolAdapter(server_script_path=server_script)
    
    stats_data = ""
    async with adapter.connect() as tools:
        stats_tool = next((t for t in tools if t.name == "get_user_statistics"), None)
        if stats_tool:
            test_type = state.get("user_profile", {}).get("test_type", "full_aphantasia_profile")
            result = await stats_tool.ainvoke({"test_type": test_type})
            stats_data = f"MCP Stats Result: {result}"
        else:
            stats_data = "MCP Tool not found."
            
    return {"research_notes": [stats_data], "messages": ["Fetched MCP stats"]}

async def retriever_node(state: AgentState) -> dict:
    """
    Calls the vector store to retrieve relevant psychological literature.
    """
    client = PineconeClient()
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    
    # Simple semantic search query based on profile
    query = "Neurological basis of aphantasia and visual imagination"
    query_vector = await embeddings.aembed_query(query)
    
    results = client.search(query_embedding=query_vector, top_k=3)
    docs = [r["text"] for r in results]
    
    return {"retrieved_documents": docs, "messages": ["Retrieved literature from Pinecone"]}

async def synthesizer_node(state: AgentState) -> dict:
    """
    Uses the LLM to generate the initial draft of the report.
    """
    llm = LLMFactory.get_llm(model_name="gemini-3.1-pro-preview")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a clinical psychologist generating a cognitive profile report.\n"
                   "Use the provided user data, research notes, and literature to write a comprehensive draft.\n"
                   "Context: {docs}\nNotes: {notes}"),
        ("user", "User Data: {profile}\n\nGenerate the draft report in Markdown format.")
    ])
    
    chain = prompt | llm
    
    docs_context = "\n".join(state.get("retrieved_documents", []))
    notes_context = "\n".join(state.get("research_notes", []))
    
    response = await chain.ainvoke({
        "docs": docs_context,
        "notes": notes_context,
        "profile": str(state.get("user_profile", {}))
    })
    
    return {"draft_report": response.content, "messages": ["Draft synthesized"]}

async def critique_node(state: AgentState) -> dict:
    """
    Evaluates the draft for hallucinations and scientific accuracy.
    """
    llm = LLMFactory.get_llm(model_name="gemini-3.1-flash")
    structured_llm = llm.with_structured_output(CritiqueDecision)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a strict QA evaluator. Check if the draft report is accurate, empathetic, and uses the provided context without hallucinating.\n"
                   "Context provided: {docs}\nNotes provided: {notes}"),
        ("user", "Draft Report: {draft}\n\nIs this acceptable? Provide feedback.")
    ])
    
    chain = prompt | structured_llm
    
    docs_context = "\n".join(state.get("retrieved_documents", []))
    notes_context = "\n".join(state.get("research_notes", []))
    
    evaluation = await chain.ainvoke({
        "docs": docs_context,
        "notes": notes_context,
        "draft": state.get("draft_report", "")
    })
    
    iteration = state.get("iteration_count", 0) + 1
    
    # If acceptable, we finalize the report (in a real app we'd parse sections)
    final_report = {}
    if evaluation.is_acceptable:
        final_report = {
            "summary": "Generated successfully",
            "sections": [], # Simplified for this demo
            "overall_confidence_score": 0.95
        }
        
    return {
        "critique": evaluation.feedback,
        "iteration_count": iteration,
        "final_report": final_report,
        "messages": [f"Critique: {evaluation.feedback} (Acceptable: {evaluation.is_acceptable})"]
    }
