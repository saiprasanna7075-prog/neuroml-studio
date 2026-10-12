from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.experiments import ExperimentItem, ExperimentListResponse
from app.utils.database import get_all_experiments, get_experiment_by_id

router = APIRouter(prefix="/experiments", tags=["Experiments"])

@router.get("", response_model=ExperimentListResponse)
def list_experiments():
    exps = get_all_experiments()
    return {"experiments": exps, "total": len(exps)}

@router.get("/{experiment_id}", response_model=ExperimentItem)
def get_experiment(experiment_id: str):
    exp = get_experiment_by_id(experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail=f"Experiment '{experiment_id}' not found.")
    return exp
