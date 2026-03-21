import json
import asyncio
import asyncpg
import os
import sys

# Add backend to path for local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from db import get_db_url

async def seed_tests():
    database_url = await get_db_url()
    conn = await asyncpg.connect(database_url)
    
    try:
        seed_path = os.path.join(os.path.dirname(__file__), "tests_seed.json")
        with open(seed_path, "r", encoding="utf-8") as f:
            tests_data = json.load(f)
            
        print(f"Found {len(tests_data)} tests in seed file.")
        
        for test in tests_data:
            print(f"Propagating test: {test['id']}...")
            
            # 1. Insert Test
            await conn.execute('''
                INSERT INTO tests (id, title, description)
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    description = EXCLUDED.description
            ''', test['id'], json.dumps(test['title']), json.dumps(test.get('description')))
            
            categories = test.get('categories', [])
            for idx, cat in enumerate(categories):
                cat_id = cat.get('id') or f"{test['id']}_cat_{idx}"
                
                # 2. Insert Category
                await conn.execute('''
                    INSERT INTO test_categories (id, test_id, title, description, order_index)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        description = EXCLUDED.description,
                        order_index = EXCLUDED.order_index
                ''', cat_id, test['id'], json.dumps(cat['title']), json.dumps(cat.get('description')), idx)
                
                questions = cat.get('questions', [])
                for q_idx, q in enumerate(questions):
                    q_id = q['id']
                    
                    # Store extra fields in metadata
                    metadata = {
                        "category": q.get("category"),
                        "subCategory": q.get("subCategory")
                    }
                    
                    # 3. Insert Question
                    await conn.execute('''
                        INSERT INTO questions (id, category_id, text, hint, placeholder, type, options, metadata, order_index)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        ON CONFLICT (id) DO UPDATE SET
                            category_id = EXCLUDED.category_id,
                            text = EXCLUDED.text,
                            hint = EXCLUDED.hint,
                            placeholder = EXCLUDED.placeholder,
                            type = EXCLUDED.type,
                            options = EXCLUDED.options,
                            metadata = EXCLUDED.metadata,
                            order_index = EXCLUDED.order_index
                    ''', 
                    q_id, 
                    cat_id, 
                    json.dumps(q['text']), 
                    json.dumps(q.get('hint')), 
                    json.dumps(q.get('placeholder')),
                    q['type'],
                    json.dumps(q.get('options')),
                    json.dumps(metadata),
                    q_idx)
                    
        print("Test seeding complete.")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(seed_tests())
