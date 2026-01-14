from typing import List
from .models import MachineData, Diagnosis
from datetime import datetime

class ESEngine:
    def __init__(self):
        # Sample Rule Base (subset of 200+)
        self.rules = [
            {
                "condition": lambda d: d.vibration > 90 and d.temperature > 80,
                "diagnosis": "Likely Bearing Failure",
                "action": "Immediate shutdown recommended. Replace bearing assembly.",
                "reasoning": "Simultaneous high vibration (>90Hz) and temperature (>80C) indicates mechanical friction consistent with bearing seizure.",
                "confidence": 0.94
            },
            {
                "condition": lambda d: d.vibration > 80 and d.power > 13,
                "diagnosis": "Motor Misalignment",
                "action": "Schedule realignment during next shift.",
                "reasoning": "High vibration with increased power draw suggests motor shaft misalignment.",
                "confidence": 0.87
            },
            {
                "condition": lambda d: d.temperature > 95,
                "diagnosis": "Coolant System Degradation",
                "action": "Check coolant levels and pump function.",
                "reasoning": "Temperature critical (>95C) without corresponding vibration spike points to thermal management failure.",
                "confidence": 0.92
            }
        ]

    def diagnose(self, reading: MachineData) -> List[Diagnosis]:
        diagnoses = []
        
        for rule in self.rules:
            if rule["condition"](reading):
                diagnoses.append(Diagnosis(
                    machine_id=reading.machine_id,
                    timestamp=reading.timestamp,
                    condition=rule["diagnosis"],
                    action=rule["action"],
                    reasoning=rule["reasoning"],
                    confidence=rule["confidence"]
                ))
                
        return diagnoses

    def diagnose_all(self, readings: List[MachineData]) -> List[Diagnosis]:
        all_diagnoses = []
        for reading in readings:
            all_diagnoses.extend(self.diagnose(reading))
        return all_diagnoses

es_engine = ESEngine()
