import requests
import json
import time

API_URL = "http://localhost:8002/api/v1/generate-report"

payload = {
    "profile": {
        "user_id": "test_user_123",
        "survey_id": "aphantasia_v1",
        "answers": {
            "vviq_score": 16,
            "q1": "No image at all, I only 'know' that I am thinking of the object",
            "q2": "Vague and dim"
        },
        "history": []
    },
    "include_scientific_references": True
}

print(f"🚀 Sending request to {API_URL}...")
start_time = time.time()

try:
    response = requests.post(API_URL, json=payload, timeout=60)
    response.raise_for_status()
    result = response.json()
    
    print(f"\n✅ Success! (Took {time.time() - start_time:.2f}s)")
    print("\n--- Generated Report Summary ---")
    print(result.get("summary"))
    print("\n--- Confidence Score ---")
    print(result.get("overall_confidence_score"))
    
except requests.exceptions.RequestException as e:
    print(f"\n❌ Error: {e}")
