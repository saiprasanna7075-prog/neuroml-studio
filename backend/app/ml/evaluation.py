import numpy as np
from typing import Dict, Any, List, Optional, Union
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
    mean_absolute_error, mean_squared_error, r2_score, explained_variance_score
)

def evaluate_model(
    model: Any,
    task_type: str,
    X_test,
    y_test,
    feature_cols: List[str],
    classes: Optional[List[Union[int, str]]] = None,
    max_scatter_points: int = 150
) -> Dict[str, Any]:
    """
    Evaluates the fitted model on the test partition.
    Produces comprehensive classification or regression metrics.
    """
    y_pred = model.predict(X_test)
    
    results: Dict[str, Any] = {
        "task_type": task_type,
        "feature_importances": None,
        "classification_metrics": None,
        "regression_metrics": None,
        "actual_vs_predicted": []
    }
    
    # Extract Feature Importances if available
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        sorted_indices = np.argsort(importances)[::-1]
        results["feature_importances"] = [
            {"feature": feature_cols[i], "importance": round(float(importances[i]), 4)}
            for i in sorted_indices
        ]
    elif hasattr(model, "coef_"):
        coefs = np.abs(model.coef_).flatten() if hasattr(model.coef_, "flatten") else np.abs(model.coef_)
        if len(coefs) == len(feature_cols):
            # Normalize to 0-1
            total = np.sum(coefs)
            normalized = coefs / total if total > 0 else coefs
            sorted_indices = np.argsort(normalized)[::-1]
            results["feature_importances"] = [
                {"feature": feature_cols[i], "importance": round(float(normalized[i]), 4)}
                for i in sorted_indices
            ]
            
    if task_type == "classification":
        # Labels for confusion matrix
        if classes is None:
            classes = sorted(list(np.unique(np.concatenate([y_test, y_pred]))))
            
        cm = confusion_matrix(y_test, y_pred, labels=classes)
        report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
        
        results["classification_metrics"] = {
            "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
            "precision_macro": round(float(precision_score(y_test, y_pred, average="macro", zero_division=0)), 4),
            "recall_macro": round(float(recall_score(y_test, y_pred, average="macro", zero_division=0)), 4),
            "f1_macro": round(float(f1_score(y_test, y_pred, average="macro", zero_division=0)), 4),
            "precision_weighted": round(float(precision_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
            "recall_weighted": round(float(recall_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
            "f1_weighted": round(float(f1_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
            "confusion_matrix": cm.tolist(),
            "labels": [int(c) if isinstance(c, (np.integer, int)) else str(c) for c in classes],
            "class_report": report
        }
        
        # Actual vs predicted samples
        n_samples = min(len(y_test), max_scatter_points)
        indices = np.random.RandomState(42).choice(len(y_test), n_samples, replace=False) if len(y_test) > n_samples else range(len(y_test))
        results["actual_vs_predicted"] = [
            {
                "sample_index": int(i),
                "actual": int(y_test[i]) if isinstance(y_test[i], (np.integer, int)) else str(y_test[i]),
                "predicted": int(y_pred[i]) if isinstance(y_pred[i], (np.integer, int)) else str(y_pred[i]),
                "error": 0.0 if y_test[i] == y_pred[i] else 1.0
            }
            for i in indices
        ]
        
    else: # Regression
        mse = float(mean_squared_error(y_test, y_pred))
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, y_pred))
        ev = float(explained_variance_score(y_test, y_pred))
        
        results["regression_metrics"] = {
            "mae": round(mae, 4),
            "mse": round(mse, 4),
            "rmse": round(rmse, 4),
            "r2_score": round(r2, 4),
            "explained_variance": round(ev, 4)
        }
        
        n_samples = min(len(y_test), max_scatter_points)
        indices = np.random.RandomState(42).choice(len(y_test), n_samples, replace=False) if len(y_test) > n_samples else range(len(y_test))
        results["actual_vs_predicted"] = [
            {
                "sample_index": int(i),
                "actual": round(float(y_test[i]), 3),
                "predicted": round(float(y_pred[i]), 3),
                "error": round(float(abs(y_test[i] - y_pred[i])), 3)
            }
            for i in indices
        ]
        
    return results
