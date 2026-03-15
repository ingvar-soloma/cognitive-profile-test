import os
import json
import logging
from typing import Dict, Any

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# Config
DATA_DIR = os.getenv("DATA_DIR", "/app/data/results")

def migrate_answers(flat_answers: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """Migrates old flat answers to keyed answers."""
    if not isinstance(flat_answers, dict):
        return {}
    
    if not flat_answers:
        return {}

    # Check if already migrated
    # Existing keyed structure: { "survey_id": { "q_id": { ... } } }
    # Old structure: { "q_id": { "questionId": "...", "value": ... } }
    
    is_already_keyed = True
    for val in flat_answers.values():
        if not isinstance(val, dict):
            is_already_keyed = False
            break
        if "questionId" in val:
            is_already_keyed = False
            break
            
    if is_already_keyed:
        return flat_answers

    new_answers = {}
    for q_id, ans in flat_answers.items():
        # Determine test type from question ID
        test_type = "full_aphantasia_profile"
        if q_id.startswith("demo_"):
            test_type = "express_demo"
        
        if test_type not in new_answers:
            new_answers[test_type] = {}
        new_answers[test_type][q_id] = ans
    return new_answers

def migrate_scores(flat_scores: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """Migrates old flat scores to keyed scores."""
    if not isinstance(flat_scores, dict):
        return {}
        
    if not flat_scores:
        return {}

    # Check if already migrated
    if any(isinstance(v, dict) for v in flat_scores.values()):
        return flat_scores

    # Since old scores were usually for one test anyway, we'll assign them to the most likely test
    has_demo = any("demo" in k.lower() for k in flat_scores.keys())
    test_type = "express_demo" if has_demo else "full_aphantasia_profile"
    return {test_type: flat_scores}

def migrate_recs(recs: Any, test_type: str = "unknown") -> Dict[str, str]:
    """Migrates old string recommendations to keyed dict."""
    if isinstance(recs, dict):
        return recs
    if isinstance(recs, str) and recs.strip():
        return {test_type: recs}
    return {}

def run_migration():
    if not os.path.exists(DATA_DIR):
        logger.error(f"Data directory {DATA_DIR} does not exist.")
        return

    files = [f for f in os.listdir(DATA_DIR) if f.endswith(".json")]
    logger.info(f"Found {len(files)} result files in {DATA_DIR}")

    migrated_count = 0
    total_files = 0

    for filename in files:
        total_files += 1
        path = os.path.join(DATA_DIR, filename)
        needs_migration = False
        
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # 1. Check Answers
            answers = data.get("answers", {})
            new_answers = migrate_answers(answers)
            if new_answers != answers:
                needs_migration = True
                data["answers"] = new_answers
            
            # 2. Check Scores
            scores = data.get("scores", {})
            new_scores = migrate_scores(scores)
            if new_scores != scores:
                needs_migration = True
                data["scores"] = new_scores
                
            # 3. Check Recommendations
            recs = data.get("gemini_recommendations", {})
            test_type = data.get("test_type", "full_aphantasia_profile")
            new_recs = migrate_recs(recs, test_type)
            if new_recs != recs:
                needs_migration = True
                data["gemini_recommendations"] = new_recs

            if needs_migration:
                # Get some user info for the log
                user_desc = data.get('username') or data.get('first_name') or filename
                logger.info(f"[MIGRATE] {filename} ({user_desc}) - Data was in old format. Migrating...")
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                migrated_count += 1
            else:
                # logger.info(f"[OK] {filename} - Already in new format.")
                pass

        except Exception as e:
            logger.error(f"Failed to process {filename}: {e}")

    logger.info("-" * 40)
    logger.info(f"Migration complete.")
    logger.info(f"Total files checked: {total_files}")
    logger.info(f"Files migrated: {migrated_count}")

if __name__ == "__main__":
    run_migration()
