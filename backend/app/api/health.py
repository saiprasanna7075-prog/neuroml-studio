from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NeuroML Studio AI Engine",
        "version": "1.0.0",
        "message": "Connected to NeuroML backend with Scikit-Learn & SHAP."
    }
