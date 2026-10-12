from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from typing import Optional, List
from app.schemas.datasets import DatasetSummary, DatasetPreview, PreprocessRequest, PreprocessResponse, CombineDatasetRequest
from app.services.dataset_service import dataset_service
from app.ml.preprocessing import prepare_data_pipeline

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.post("/combine", response_model=DatasetSummary)
def combine_datasets(req: CombineDatasetRequest):
    if len(req.dataset_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 dataset IDs are required to combine.")
    try:
        summary = dataset_service.combine_datasets(req.dataset_ids, name=req.name)
        return summary
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to combine datasets: {str(e)}")


@router.post("/upload", response_model=DatasetSummary)
async def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None)
):
    # Validate extension
    if not (file.filename.endswith(".csv") or file.filename.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only CSV or plaintext tabular files are supported.")
        
    # Read content with limit 20MB
    content_bytes = await file.read()
    if len(content_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 20MB.")
        
    try:
        content_text = content_bytes.decode("utf-8", errors="replace")
        summary = dataset_service.upload_dataset(file.filename, content_text, name=name)
        return summary
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV file: {str(e)}")

@router.get("", response_model=List[DatasetSummary])
def list_datasets():
    return dataset_service.list_datasets()

@router.get("/{dataset_id}/summary", response_model=DatasetSummary)
def get_dataset_summary(dataset_id: str):
    summary = dataset_service.get_summary(dataset_id)
    if not summary:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    return summary

@router.get("/{dataset_id}/preview", response_model=DatasetPreview)
def get_dataset_preview(
    dataset_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500)
):
    preview = dataset_service.get_preview(dataset_id, page=page, page_size=page_size)
    if not preview:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    return preview

@router.get("/{dataset_id}/correlations")
def get_dataset_correlations(dataset_id: str):
    corr = dataset_service.get_correlations(dataset_id)
    if not corr:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' has no numerical features for correlation.")
    return corr

@router.post("/{dataset_id}/preprocess", response_model=PreprocessResponse)
def test_preprocess(dataset_id: str, req: PreprocessRequest):
    df = dataset_service.get_dataframe(dataset_id)
    if df is None:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
        
    try:
        pipe = prepare_data_pipeline(
            df=df,
            target_column=req.target_column,
            selected_features=req.selected_features,
            task_type=req.task_type,
            handle_missing=req.handle_missing,
            remove_duplicates=req.remove_duplicates,
            test_size=req.test_size,
            random_state=req.random_state,
            scale_features=req.scale_features
        )
        return {
            "dataset_id": dataset_id,
            "target_column": req.target_column,
            "task_type": req.task_type,
            "train_samples": pipe["train_samples"],
            "test_samples": pipe["test_samples"],
            "features": pipe["feature_cols"],
            "train_test_split_ratio": f"{int((1-req.test_size)*100)}:{int(req.test_size*100)}",
            "has_scaling": pipe["has_scaling"],
            "removed_duplicates_count": pipe["removed_duplicates_count"],
            "missing_imputed_count": pipe["missing_imputed_count"],
            "classes": pipe["classes"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
