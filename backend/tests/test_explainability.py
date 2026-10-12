import pytest
import pandas as pd
from app.ml.preprocessing import prepare_data_pipeline
from app.ml.training import create_and_train_model
from app.ml.explainability import generate_shap_explanations

def test_shap_random_forest():
    df = pd.read_csv("data/winequality-white.csv", sep=";").iloc[:150]
    pipe = prepare_data_pipeline(
        df=df,
        target_column="quality",
        task_type="classification",
        test_size=0.3,
        random_state=42
    )
    model, _ = create_and_train_model(
        algorithm="random_forest",
        task_type="classification",
        hyperparameters={"n_estimators": 10},
        X_train=pipe["X_train"],
        y_train=pipe["y_train"]
    )
    shap_res = generate_shap_explanations(
        model=model,
        task_type="classification",
        X_background=pipe["X_train"],
        X_samples=pipe["X_test"],
        feature_cols=pipe["feature_cols"],
        sample_index=0
    )
    assert len(shap_res["global_importance"]) == len(pipe["feature_cols"])
    assert shap_res["local_explanation"] is not None
    assert "contributions" in shap_res["local_explanation"]
    assert len(shap_res["local_explanation"]["contributions"]) == len(pipe["feature_cols"])
