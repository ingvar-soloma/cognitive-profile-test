import os
import json
import argparse
from datetime import datetime

# Path inside the container (Matches DATA_DIR in main.py)
DATA_DIR = os.getenv("DATA_DIR", "/app/data/results")
subscribers_path = os.path.join(DATA_DIR, "subscribers.json")

def list_subscribers(source_filter=None):
    if not os.path.exists(subscribers_path):
        print(f"\nNo subscribers found yet (checked {subscribers_path}).\n")
        return

    try:
        with open(subscribers_path, 'r', encoding='utf-8') as f:
            subscribers = json.load(f)
        
        if source_filter:
            subscribers = [s for s in subscribers if s.get('source') == source_filter]
        
        # Sort by date (newest first)
        def get_date(s):
            d = s.get('subscribed_at', '')
            # If Z or timezone info is missing, just use string comparison
            return d
            
        subscribers.sort(key=get_date, reverse=True)

        print(f"\n{'Email':<50} | {'Source':<15} | {'Date (UTC)':<20}")
        print("-" * 90)
        for s in subscribers:
            email = s.get('email', 'N/A')
            source = s.get('source', 'N/A')
            date_raw = s.get('subscribed_at', 'N/A')
            try:
                # Format: 2026-03-21T03:39:25.123456+00:00 or 2026-03-21T03:39:25.123456Z
                dt = datetime.fromisoformat(date_raw.replace('Z', '+00:00'))
                dateStr = dt.strftime('%Y-%m-%d %H:%M')
            except:
                dateStr = date_raw
            
            print(f"{email:<50} | {source:<15} | {dateStr:<20}")
        print(f"\nTotal subscribers: {len(subscribers)}\n")
        
    except Exception as e:
        print(f"Error reading subscribers: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="List newsletter subscribers")
    parser.add_argument("--source", help="Filter by source (e.g. news_page)")
    args = parser.parse_args()
    list_subscribers(args.source)
