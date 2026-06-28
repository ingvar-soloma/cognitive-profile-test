from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class UserProfile(BaseModel):
    user_id: str
    survey_id: str
    answers: Dict[str, Any]
    history: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class GenerationRequest(BaseModel):
    profile: UserProfile
    include_scientific_references: bool = True

class ReportSection(BaseModel):
    title: str
    content: str
    references: List[str] = Field(default_factory=list)

class GeneratedReport(BaseModel):
    user_id: str
    summary: str
    sections: List[ReportSection]
    overall_confidence_score: float = Field(ge=0.0, le=1.0)
