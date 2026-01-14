from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import pandas as pd
import numpy as np
from datetime import datetime
from datetime import timedelta
from pydantic import BaseModel

from .models import MachineData, Diagnosis, SimulationRequest, SimulationResult
from .simulator import simulator
from .dss_engine import dss_engine
from .es_engine import es_engine
from .database import db

app = FastAPI(title="Smart Manufacturing Hybrid System")

@app.on_event("startup")
def startup_event():
    print("--- BACKEND STARTUP: Initializing Local DB ---")
    db.init_db()
    # Check if we need to seed history
    simulator.ensure_history()
    print("--- BACKEND SERVER RUNNING ON PORT 8000 (LOCAL SQLITE) ---")

# CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# New Models for Requests
class MaintenanceLogRequest(BaseModel):
    machine_id: str
    diagnosis_id: Optional[int] = None
    technician_action: str
    notes: str
    resolved: bool = True

class SearchQuery(BaseModel):
    query: str

@app.get("/")
def read_root():
    return {"status": "System Online", "modules": ["Simulator", "DSS", "ES", "LocalDB"]}

@app.post("/api/refresh")
def force_refresh():
    """Force data generation step into DB"""
    new_data = simulator.get_latest_readings()
    return {"status": "Refreshed and Synced to DB", "machines_monitored": len(new_data)}

@app.get("/api/es/rules")
def get_all_rules():
    """Get all rules"""
    try:
        return db.get_all_rules()
    except Exception as e:
        print(f"Rules Error: {e}")
        return []

@app.get("/api/dashboard/overview")
def get_overview():
    """Combined view for the dashboard"""
    try:
        current_readings = simulator.get_latest_readings()
        active_machines = 490 # Fixed: 10 machines OFF as requested
        
        active_diagnoses = es_engine.diagnose_all(current_readings)
        alert_count = len(active_diagnoses)
        critical_count = len([d for d in active_diagnoses if "Critical" in d.reasoning or d.confidence > 0.9])

        # Calculated Business Metrics
        production = 98.4 - (alert_count * 0.1)
        avg_power = sum([r.power for r in current_readings]) / len(current_readings) if current_readings else 10
        efficiency = 100 - ((avg_power - 10) * 5) if avg_power > 10 else 98.5

        return {
            "active_machines": active_machines,
            "total_machines": 500,
            "active_alerts": alert_count,
            "critical_alerts": critical_count,
            "production_output": round(production, 1),
            "energy_efficiency": round(efficiency, 1),
            "system_health": "Optimal" if alert_count < 10 else "Attention Required"
        }
    except Exception as e:
        print(f"Overview Error: {e}")
        return {
            "active_machines": 0, "total_machines": 500, "active_alerts": 0, "critical_alerts": 0,
            "production_output": 0, "energy_efficiency": 0, "system_health": "Error"
        }

@app.get("/api/dss/forecast")
def get_efficiency_forecast():
    return {
        "current_efficiency": 94.0,
        "projected_efficiency": 92.5,
        "degradation": 1.5,
        "reason": "Thermal throttling in Sector 7 detected",
        "timeframe": "4 hours"
    }

@app.get("/api/dss/trends")
def get_trends():
    """Get trend analysis from DSS using latest data"""
    try:
        # Use history fetch for trends
        history = db.get_history(period="60m")
        if not history: return {}
        df = pd.DataFrame(history)
        return dss_engine.analyze_trends(df)
    except:
        return {}

@app.get("/api/es/diagnoses", response_model=List[Diagnosis])
def get_diagnoses():
    """Get current active diagnoses"""
    latest = simulator.get_latest_readings()
    return es_engine.diagnose_all(latest)

@app.get("/api/es/search")
def search_knowledge_base(q: str):
    """Search the 'fault_rules' table"""
    if not q: return []
    try:
        return db.search_rules(q)
    except Exception as e:
        print(f"Search Error: {e}")
        return []

@app.post("/api/maintenance/log")
def log_maintenance(log: MaintenanceLogRequest):
    """Log technician action"""
    # Skipping implementation for speed, but DB has table
    return {"status": "Logged (Stub)"}

@app.post("/api/dss/simulate", response_model=SimulationResult)
def run_simulation(req: SimulationRequest):
    """Run a what-if scenario"""
    latest = simulator.get_latest_readings()
    machine = next((m for m in latest if m.machine_id == req.machine_id), None)
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
        
    result = dss_engine.run_simulation(req.machine_id, req.parameter, req.value, machine)
    if not result:
        raise HTTPException(status_code=400, detail="Simulation failed")
    return result

@app.get("/api/dashboard/history")
def get_dashboard_history(period: str = "24h"):
    """
    Get simulated history for charts.
    period: '24h' (Hourly agg), '60m' (Minute agg), 'current' (Last 10m distinct)
    """
    try:
        # Use specialized DB method for aggregation
        return db.get_history(period)
    except Exception as e:
        print(f"History Endpoint Fail: {e}")
        return []

@app.get("/api/machines", response_model=List[MachineData])
def get_machines(limit: int = 50):
    """Raw machine data"""
    try:
        # Convert dicts back to Pydantic models
        raw = db.get_latest_readings(limit)
        return [MachineData(**r) for r in raw]
    except:
        return simulator.get_latest_readings()[:limit]
