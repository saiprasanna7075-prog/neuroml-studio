import pytest
import pandas as pd
import numpy as np
from app.ml.preprocessing import detect_delimiter, load_dataset_from_text, prepare_data_pipeline

def test_detect_delimiter():
    csv_comma = "a,b,c\n1,2,3\n4,5,6"
    csv_semi = "a;b;c\n1;2;3\n4;5;6"
    assert detect_delimiter(csv_comma) == ","
    assert detect_delimiter(csv_semi) == ";"

def test_prepare_data_pipeline_70_30_split():
    # Synthetic dataset
    np.random.seed(42)
    n = 100
    df = pd.DataFrame({
        "f1": np.random.randn(n),
        "f2": np.random.randn(n),
        "f3": np.random.randn(n),
        "quality": np.random.choice([5, 6, 7], size=n)
    })
    
    pipe = prepare_data_pipeline(
        df=df,
        target_column="quality",
        task_type="classification",
        test_size=0.3,
        random_state=42,
        scale_features=True
    )
    
    assert pipe["train_samples"] == 70
    assert pipe["test_samples"] == 30
    assert pipe["scaler"] is not None
    assert len(pipe["feature_cols"]) == 3
    # Check that X_train mean is close to 0 (scaled)
    assert np.allclose(np.mean(pipe["X_train"], axis=0), 0.0, atol=1e-7)

def test_no_data_leakage_in_scaling():
    # If scaler is fitted only on train, test mean won't be strictly zero
    np.random.seed(42)
    df = pd.DataFrame({
        "f1": np.concatenate([np.zeros(70), np.ones(30) * 100]), # extreme test difference
        "quality": [5]*50 + [6]*50
    })
    pipe = prepare_data_pipeline(
        df=df,
        target_column="quality",
        task_type="classification",
        test_size=0.3,
        random_state=42,
        scale_features=True
    )
    # Scaler was fitted strictly on train:
    assert pipe["scaler"].mean_[0] != np.mean(df["f1"])
