import numpy as np
from typing import Dict, Any, List, Optional, Union

def predict_single(
    model: Any,
    scaler: Any,
    feature_cols: List[str],
    features: Dict[str, float],
    task_type: str = "classification"
) -> Dict[str, Any]:
    """
    Applies fitted preprocessing transforms and generates prediction and class probabilities.
    """
    # Verify and construct feature vector in correct order
    row = []
    missing_keys = []
    for col in feature_cols:
        if col in features:
            try:
                row.append(float(features[col]))
            except (ValueError, TypeError):
                raise ValueError(f"Value for feature '{col}' must be a valid float.")
        else:
            missing_keys.append(col)
            
    if missing_keys:
        raise ValueError(f"Missing required feature values for: {missing_keys}")
        
    X_input = np.array([row])
    
    # Scale if scaler was used during training
    if scaler is not None:
        X_input = scaler.transform(X_input)
        
    pred = model.predict(X_input)[0]
    
    probabilities = None
    if task_type == "classification" and hasattr(model, "predict_proba"):
        try:
            probs = model.predict_proba(X_input)[0]
            classes = model.classes_
            probabilities = {
                str(cls): round(float(prob), 4)
                for cls, prob in zip(classes, probs)
            }
        except Exception:
            pass
            
    # Format output
    if task_type == "classification":
        prediction_val = int(pred) if isinstance(pred, (np.integer, int)) else str(pred)
        explanation = f"Model predicts Wine Quality Class {prediction_val} on the standard discrete scale (range 3-9)."
    else:
        prediction_val = round(float(pred), 2)
        explanation = f"Model estimates continuous Wine Quality Score of {prediction_val}."
        
    return {
        "prediction": prediction_val,
        "probabilities": probabilities,
        "input_values": {col: float(features[col]) for col in feature_cols},
        "explanation": explanation
    }
