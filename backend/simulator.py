import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List
from .models import MachineData
import random

from .database import db

class Simulator:
    def __init__(self, num_machines=500):
        self.num_machines = 500
        # Simulating all 500 machines now
        self.machines = [f"M-{i:03d}" for i in range(1, 501)]
        # We'll call ensure_history from main.py startup to avoid circular import issues or double init
    
    def ensure_history(self):
        """Check if DB has data. If not, generate 24h of history."""
        try:
            # Check if we have recent data (Optimization: Check DB directly)
            if db.has_any_data():
                 print("Database already has data. Skipping heavy backfill.")
                 # In a real app we'd check for gaps, but for this demo, if DB exists, we assume good.
                 # If user deleted DB file, this would return False and we regen.
                 return

            print("No data found. Initializing DB with 24 hours of history...")
            
            # 1. Backfill 24 Hours (Hourly resolution)
            print("Generating 24h hourly backbone...")
            for i in range(24):
                t = datetime.now() - timedelta(hours=24-i)
                # Only if older than 1h (since next loop handles last hour)
                if t < datetime.now() - timedelta(hours=1):
                        self.generate_tick(t, persist=True)
            
            # 2. Backfill Last 60 Minutes (Minute resolution)
            print("Generating last 60m minutely detail...")
            for i in range(60):
                t = datetime.now() - timedelta(minutes=60-i)
                self.generate_tick(t, persist=True)
                
            print("History initialized.")
        except Exception as e:
            print(f"History init failed: {e}")

    def generate_tick(self, timestamp=None, persist=True) -> List[dict]:
        """Generate a single snapshot of data for all machines"""
        if timestamp is None:
            timestamp = datetime.now()
            
        data = []
        for machine_id in self.machines:
            # Base values
            temp = np.random.normal(70, 5) 
            vib = np.random.normal(50, 10) 
            power = np.random.normal(10, 2) 
            
            # Forced Criticals
            forced_critical = ['M-015', 'M-088', 'M-105', 'M-200', 'M-404']
            if machine_id in forced_critical:
                temp += 45
                vib += 80
            elif random.random() < 0.05: # Random anomalies
                type_anomaly = random.choice(['temp', 'vib', 'both'])
                if type_anomaly == 'temp': temp += 30
                elif type_anomaly == 'vib': vib += 60
                else: temp += 30; vib += 60

            data.append({
                "machine_id": machine_id,
                "timestamp": timestamp.isoformat(),
                "temperature": round(temp, 2),
                "vibration": round(vib, 2),
                "power": round(power, 2),
                "status": "running"
            })
            
        if persist:
            try:
                db.insert_readings(data)
            except Exception as e:
                print(f"Insert failed: {e}")
                
        return data

    def get_latest_readings(self) -> List[MachineData]:
        # Try to fetch from DB first (Last distinct reading per machine)
        try:
             # Fast check for current data
             rows = db.get_latest_readings(limit=500)
             if len(rows) > 400:
                 return [MachineData(**row) for row in rows]
        except Exception as e:
            print(f"Fetch failed: {e}")

        # If no fresh data, generate new tick and persist
        raw_data = self.generate_tick()
        return [MachineData(**row) for row in raw_data]

simulator = Simulator()
