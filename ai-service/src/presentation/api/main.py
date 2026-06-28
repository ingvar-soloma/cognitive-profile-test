from fastapi import FastAPI, HTTPException
from src.domain.models import GenerationRequest, GeneratedReport
# Import workflow once it's implemented

app = FastAPI(
    title="AI Agentic Service",
    description="Microservice for running LangGraph agentic workflows for Cognitive Profiles",
    version="0.1.0"
)

from src.application.workflows.graph import create_report_generation_graph

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai-service"}

@app.post("/api/v1/generate-report", response_model=GeneratedReport)
async def generate_report(request: GenerationRequest):
    """
    Triggers the LangGraph workflow to generate a personalized cognitive profile report.
    """
    graph = create_report_generation_graph()
    
    # Initial state
    initial_state = {
        "user_profile": request.profile.dict(),
        "retrieved_documents": [],
        "research_notes": [],
        "draft_report": "",
        "critique": "",
        "next_action": "",
        "final_report": {},
        "iteration_count": 0,
        "messages": ["Started report generation"]
    }
    
    # Run the graph
    result = await graph.ainvoke(initial_state)
    
    final_data = result.get("final_report", {})
    if not final_data:
        # Fallback if somehow it failed to finalize
        final_data = {
            "summary": "Report generation did not complete properly.",
            "sections": [],
            "overall_confidence_score": 0.0
        }
        
    return GeneratedReport(
        user_id=request.profile.user_id,
        summary=final_data.get("summary", ""),
        sections=final_data.get("sections", []),
        overall_confidence_score=final_data.get("overall_confidence_score", 0.0)
    )

import json
from fastapi.responses import StreamingResponse

@app.post("/api/v1/generate-report/stream")
async def generate_report_stream(request: GenerationRequest):
    """
    Streams the LangGraph execution events via Server-Sent Events (SSE).
    """
    graph = create_report_generation_graph()
    
    initial_state = {
        "user_profile": request.profile.dict(),
        "retrieved_documents": [],
        "research_notes": [],
        "draft_report": "",
        "critique": "",
        "next_action": "",
        "final_report": {},
        "iteration_count": 0,
        "messages": ["Started report generation"]
    }

    async def event_stream():
        try:
            # LangGraph's astream yields (node_name, node_state)
            async for output in graph.astream(initial_state):
                for node_name, state_update in output.items():
                    # Send an event with the node name
                    event_data = json.dumps({
                        "node": node_name,
                        "messages": state_update.get("messages", []),
                        "status": "processing"
                    })
                    yield f"data: {event_data}\n\n"
                    
                    # If this is the final report
                    if state_update.get("final_report"):
                        final_data = state_update.get("final_report")
                        final_payload = json.dumps({
                            "node": "END",
                            "status": "complete",
                            "report": final_data
                        })
                        yield f"data: {final_payload}\n\n"
                        break
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
