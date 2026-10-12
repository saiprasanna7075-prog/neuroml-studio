import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_health_endpoint():
    with TestClient(app) as client:
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"

def test_list_datasets():
    with TestClient(app) as client:
        res = client.get("/api/datasets")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # wine_white was preloaded by lifespan

def test_train_rf_and_predict_flow():
    with TestClient(app) as client:
        # Train Random Forest on wine_white
        train_payload = {
            "dataset_id": "wine_white",
            "algorithm": "random_forest",
            "task_type": "classification",
            "target_column": "quality",
            "test_size": 0.3,
            "random_state": 42,
            "hyperparameters": {
                "n_estimators": 10,
                "max_depth": 5
            }
        }
        train_res = client.post("/api/models/train", json=train_payload)
        assert train_res.status_code == 200
        data = train_res.json()
        model_id = data["model_id"]
        assert model_id is not None
        assert "classification_metrics" in data
        assert data["classification_metrics"]["accuracy"] > 0
        
        # Predict using the trained model
        features = {
            "fixed acidity": 7.0,
            "volatile acidity": 0.27,
            "citric acid": 0.36,
            "residual sugar": 20.7,
            "chlorides": 0.045,
            "free sulfur dioxide": 45.0,
            "total sulfur dioxide": 170.0,
            "density": 1.001,
            "pH": 3.0,
            "sulphates": 0.45,
            "alcohol": 8.8
        }
        pred_res = client.post(f"/api/models/{model_id}/predict", json={"model_id": model_id, "features": features})
        assert pred_res.status_code == 200
        pred_data = pred_res.json()
        assert "prediction" in pred_data
        assert pred_data["prediction"] in [3, 4, 5, 6, 7, 8, 9]

        # Explain using SHAP
        explain_res = client.post(f"/api/models/{model_id}/explain", json={"model_id": model_id, "sample_index": 0})
        assert explain_res.status_code == 200
        exp_data = explain_res.json()
        assert len(exp_data["global_importance"]) > 0
        assert exp_data["local_explanation"] is not None

def test_combine_datasets_endpoint():
    with TestClient(app) as client:
        # Verify wine_combined is preloaded (4898 white + 1599 red = 6497 rows)
        res = client.get("/api/datasets/wine_combined/summary")
        assert res.status_code == 200
        data = res.json()
        assert data["total_rows"] == 6497
        assert data["total_columns"] == 12

        # Test explicit combine endpoint
        combine_res = client.post("/api/datasets/combine", json={
            "dataset_ids": ["wine_white", "wine_red"],
            "name": "Custom Merged Wine"
        })
        assert combine_res.status_code == 200
        comb_data = combine_res.json()
        assert comb_data["total_rows"] == 6497
        assert comb_data["name"] == "Custom Merged Wine"

