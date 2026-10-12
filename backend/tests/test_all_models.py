import pytest
import numpy as np
import pandas as pd
from app.ml.preprocessing import prepare_data_pipeline
from app.ml.training import create_and_train_model
from app.ml.evaluation import evaluate_model

def test_diverse_regression_models():
    # Synthetic dataset
    np.random.seed(42)
    X = np.random.randn(80, 5)
    y = X[:, 0] * 2.5 + X[:, 1] * -1.2 + np.random.randn(80) * 0.1
    
    regression_models = [
        "linear_regression",
        "multiple_linear_regression",
        "polynomial_regression",
        "ridge_regression",
        "lasso_regression",
        "elastic_net_regression",
        "decision_tree_regressor",
        "random_forest_regressor",
        "gradient_boosting_regressor",
        "svr",
        "knn_regressor",
        "bayesian_regression",
        "xgboost_regressor",
        "lightgbm_regressor"
    ]
    
    for alg in regression_models:
        model, dur = create_and_train_model(
            algorithm=alg,
            task_type="regression",
            hyperparameters={"n_estimators": 5, "degree": 2},
            X_train=X[:60],
            y_train=y[:60]
        )
        assert model is not None
        assert dur >= 0
        preds = model.predict(X[60:])
        assert len(preds) == 20

def test_diverse_classification_models():
    np.random.seed(42)
    X = np.random.randn(80, 5)
    y = np.random.choice([0, 1, 2], size=80)
    
    classification_models = [
        "logistic_regression",
        "knn",
        "decision_tree",
        "random_forest",
        "svm",
        "gaussian_naive_bayes",
        "multinomial_naive_bayes",
        "bernoulli_naive_bayes",
        "gradient_boosting",
        "adaboost",
        "extra_trees",
        "lda",
        "perceptron",
        "sgd",
        "xgboost",
        "lightgbm"
    ]
    
    for alg in classification_models:
        model, dur = create_and_train_model(
            algorithm=alg,
            task_type="classification",
            hyperparameters={"n_estimators": 5, "n_neighbors": 3},
            X_train=X[:60],
            y_train=y[:60]
        )
        assert model is not None
        assert dur >= 0
        preds = model.predict(X[60:])
        assert len(preds) == 20
