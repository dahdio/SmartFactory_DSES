import sqlite3
import pandas as pd
from datetime import datetime
from backend.database import db

print(f"--- DB Debug ---")
conn = sqlite3.connect("smartfactory.db")
c = conn.cursor()

# 1. Check Row Count
count = c.execute("SELECT count(*) FROM machine_readings").fetchone()[0]
print(f"Total Rows: {count}")

# 2. Check Latest Data
print("\n--- Latest 5 Rows ---")
rows = c.execute("SELECT id, timestamp FROM machine_readings ORDER BY id DESC LIMIT 5").fetchall()
for r in rows:
    print(r)

# 3. Check 'Current' Window Logic
print("\n--- Testing Current Window Query ---")
try:
    history = db.get_history("current")
    print(f"History 'current' count: {len(history)}")
    if len(history) > 0:
        print(f"Sample: {history[0]}")
except Exception as e:
    print(f"Error in get_history: {e}")

# 4. Check '60m' Window Logic
print("\n--- Testing 60m Window Query ---")
try:
    history_60 = db.get_history("60m")
    print(f"History '60m' count: {len(history_60)}")
except Exception as e:
    print(f"Error in get_history 60m: {e}")

conn.close()
