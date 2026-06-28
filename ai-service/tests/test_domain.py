import pytest
from src.domain.models import UserProfile, GenerationRequest

def test_user_profile_creation():
    profile = UserProfile(
        user_id="test_123",
        survey_id="full_aphantasia_profile",
        answers={"q1": "yes"}
    )
    assert profile.user_id == "test_123"
    assert profile.survey_id == "full_aphantasia_profile"
    assert profile.answers["q1"] == "yes"

def test_generation_request_creation():
    profile = UserProfile(
        user_id="test_456",
        survey_id="demo",
        answers={}
    )
    req = GenerationRequest(profile=profile, include_scientific_references=False)
    assert not req.include_scientific_references
    assert req.profile.user_id == "test_456"
