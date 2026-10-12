import pytest
import numpy as np
import pandas as pd
from app.ml.training import create_and_train_model
from app.ml.evaluation import evaluate_model
from app.ml.preprocessing import prepare_data_pipeline

def test_rf_and_knn_classification():
    # Load white wine dataset from data folder
    df = pd.read_csv("data/winequality-white.csv", sep=";")
    # Subset 200 rows for rapid test
    df_sample = df.iloc[:200].copy()
    
    # 1. Random Forest
    pipe_rf = prepare_data_pipeline(
        df=df_sample,
        target_column="quality",
        task_type="classification",
        test_size=0.3,
        random_state=42,
        scale_features=False
    )
    model_rf, _ = create_and_train_model(
        algorithm="random_forest",
        task_type="classification",
        hyperparameters={"n_estimators": 10},
        X_train=pipe_rf["X_train"],
        y_train=pipe_rf["y_train"]
    )
    res_rf = evaluate_model(
        model=model_rf,
        task_type="classification",
        X_test=pipe_rf["X_test"],
        y_test=pipe_rf["y_test"],
        feature_cols=pipe_rf["feature_cols"],
        classes=pipe_rf["classes"]
    )
    assert "accuracy" in res_rf["classification_metrics"]
    assert res_rf["classification_metrics"]["accuracy"] > 0
    assert len(res_rf["feature_importances"]) == len(pipe_rf["feature_cols"])
    
    # 2. KNN with scaling
    pipe_knn = prepare_data_pipeline(
        df=df_sample,
        target_column="quality",
        task_type="classification",
        test_size=0.3,
        random_state=42,
        scale_features=True
    )
    model_knn, _ = create_and_train_model(
        algorithm="knn",
        task_type="classification",
        hyperparameters={"n_neighbors": 3},
        X_train=pipe_knn["X_train"],
        y_train=pipe_knn["y_train"]
    )
    res_knn = evaluate_model(
        model=model_knn,
        task_type="classification",
        X_test=pipe_knn["X_test"],
        y_test=pipe_knn["y_test"],
        feature_cols=pipe_knn["feature_cols"],
        classes=pipe_knn["classes"]
    )
    assert res_knn["classification_metrics"]["accuracy"] > 0

def test_rf_regression():
    df = pd.read_csv("data/winequality-white.csv", sep=";").iloc[:200]
    pipe = prepare_data_pipeline(
        df=df,
        target_column="quality",
        task_type="regression",
        test_size=0.3,
        random_state=42,
        scale_features=False
    )
    model, _ = create_and_train_model(
        algorithm="random_forest",
        task_type="regression",
        hyperparameters={"n_estimators": 10},
        X_train=pipe["X_train"],
        y_train=pipe["y_train"]
    )
    eval_res = evaluate_model(
        model=model,
        task_type="regression",
        X_test=pipe["X_test"],
        y_test=pipe["y_test"],
        feature_cols=pipe["feature_cols"]
    )
    assert "mae" in eval_res["regression_metrics"]
    assert "r2_score" in eval_res["regression_metrics"]
    assert eval_res["regression_metrics"]["mae"] >= 0
