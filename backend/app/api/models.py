from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.schemas.models import (
    TrainModelRequest,
    ModelMetricsResponse,
    PredictRequest,
    PredictResponse,
    ExplainRequest,
    ExplainResponse,
    ModelComparisonRequest,
    ModelComparisonResponse
)
from app.services.model_service import model_service

router = APIRouter(prefix="/models", tags=["Models"])

@router.post("/train", response_model=ModelMetricsResponse)
def train_model(req: TrainModelRequest):
    try:
        results = model_service.train_model(
            dataset_id=req.dataset_id,
            algorithm=req.algorithm,
            task_type=req.task_type,
            target_column=req.target_column,
            selected_features=req.selected_features,
            test_size=req.test_size,
            random_state=req.random_state,
            scale_features=req.scale_features,
            remove_duplicates=req.remove_duplicates,
            hyperparameters=req.hyperparameters,
            experiment_name=req.experiment_name,
            classification_mode=req.classification_mode or "multiclass"
        )
        return results
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.get("/{model_id}/status")
def get_model_status(model_id: str):
    entry = model_service.get_model_entry(model_id)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found.")
    return {"model_id": model_id, "status": "READY", "metadata": entry.get("metadata")}

@router.get("/{model_id}/metrics", response_model=ModelMetricsResponse)
def get_model_metrics(model_id: str):
    metrics = model_service.get_metrics(model_id)
    if not metrics:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found.")
    return metrics

@router.post("/{model_id}/predict", response_model=PredictResponse)
def run_prediction(model_id: str, req: PredictRequest):
    try:
        return model_service.predict(model_id=model_id, features=req.features)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/{model_id}/explain", response_model=ExplainResponse)
def explain_model(model_id: str, req: ExplainRequest):
    try:
        return model_service.explain(
            model_id=model_id,
            sample_index=req.sample_index,
            custom_features=req.custom_features,
            max_display_features=req.max_display_features
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SHAP explanation error: {str(e)}")

@router.post("/compare", response_model=ModelComparisonResponse)
def compare_models(req: ModelComparisonRequest):
    try:
        return model_service.compare_models(req.model_ids)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")
