import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.datasets import router as datasets_router
from app.api.models import router as models_router
from app.api.experiments import router as experiments_router
from app.services.dataset_service import dataset_service
from app.utils.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and load built-in datasets
    init_db()
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
    dataset_service.preload_builtin_datasets(data_dir)
    print(f"[NeuroML Studio] AI Engine initialized. Preloaded {len(dataset_service.list_datasets())} datasets.")
    yield
    # Shutdown

app = FastAPI(
    title="NeuroML Studio — 3D Machine Learning Laboratory API",
    description="Backend AI API powering interactive model training, SHAP explainability, and Wine Quality intelligence.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health_router, prefix="/api")
app.include_router(datasets_router, prefix="/api")
app.include_router(models_router, prefix="/api")
app.include_router(experiments_router, prefix="/api")

@app.get("/")
def root():
    return {
        "title": "NeuroML Studio AI Engine",
        "status": "online",
        "docs_url": "/docs",
        "features": [
            "Random Forest & KNN Classification & Regression",
            "SHAP TreeExplainer & Global/Local Explanations",
            "UCI Wine Quality Physicochemical Intelligence",
            "Automated Delimiter & Preprocessing Pipeline (70:30 Split)",
            "Model Comparison Arena",
            "Experiment Persistence in SQLite"
        ]
    }
