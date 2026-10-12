import numpy as np
import shap
from typing import Dict, Any, List, Optional, Union

def generate_shap_explanations(
    model: Any,
    task_type: str,
    X_background: np.ndarray,
    X_samples: np.ndarray,
    feature_cols: List[str],
    sample_index: Optional[int] = None,
    custom_features: Optional[Dict[str, float]] = None,
    y_actuals: Optional[np.ndarray] = None,
    max_display_features: int = 11
) -> Dict[str, Any]:
    """
    Computes genuine SHAP values using TreeExplainer for tree models.
    Supports both classification (multiclass or binary) and regression.
    Produces global rankings, beeswarm data, and local sample waterfall contributions.
    """
    is_tree_model = hasattr(model, "estimators_") or "Tree" in type(model).__name__ or "Forest" in type(model).__name__
    
    if not is_tree_model:
        # Fallback for non-tree models (e.g. KNN) using small KernelExplainer
        try:
            background_summary = shap.kmeans(X_background, min(10, len(X_background)))
            explainer = shap.KernelExplainer(model.predict, background_summary)
            # Bound samples to 20 to keep response fast
            eval_subset = X_samples[:20]
            shap_vals = explainer.shap_values(eval_subset, nsamples=50)
            base_val = float(explainer.expected_value) if np.isscalar(explainer.expected_value) else float(explainer.expected_value[0])
            is_kernel = True
        except Exception as e:
            return {
                "message": f"SHAP TreeExplainer requires tree-based models (Random Forest, Decision Tree, Gradient Boosting). Model-agnostic KernelExplainer note: {str(e)}",
                "base_value": 0.0,
                "global_importance": [],
                "beeswarm_sample": [],
                "local_explanation": None
            }
    else:
        explainer = shap.TreeExplainer(model)
        # Limit evaluation samples to max 100 for fast, responsive calculation
        eval_subset = X_samples[:min(100, len(X_samples))]
        shap_vals = explainer.shap_values(eval_subset)
        is_kernel = False
        
        # Base expected value
        if hasattr(explainer, "expected_value"):
            exp_val = explainer.expected_value
            if isinstance(exp_val, (list, np.ndarray)):
                base_val = float(exp_val[0]) if len(exp_val) > 0 else 0.0
            else:
                base_val = float(exp_val)
        else:
            base_val = 0.0

    # Determine shapes for classification vs regression
    # In SHAP 0.51:
    # RFC shap_vals is (n_samples, n_features, n_classes) or list of arrays [(n_samples, n_features)]
    # RFR shap_vals is (n_samples, n_features)
    is_multiclass = False
    class_idx_for_local = 0
    explained_class_label = None

    if isinstance(shap_vals, list):
        # List of arrays per class
        is_multiclass = True
        # shap_vals[c] has shape (n_samples, n_features)
        # Mean absolute SHAP across all classes and samples
        mean_abs_per_feature = np.mean([np.mean(np.abs(sv), axis=0) for sv in shap_vals], axis=0)
        eval_shap_matrix = shap_vals[0] # default to class 0
    elif isinstance(shap_vals, np.ndarray) and len(shap_vals.shape) == 3:
        # Shape: (n_samples, n_features, n_classes)
        is_multiclass = True
        mean_abs_per_feature = np.mean(np.abs(shap_vals), axis=(0, 2))
        eval_shap_matrix = shap_vals[:, :, 0]
    else:
        # Regression or single output
        mean_abs_per_feature = np.mean(np.abs(shap_vals), axis=0)
        eval_shap_matrix = shap_vals

    # Global Feature Importance Rankings
    sorted_feat_indices = np.argsort(mean_abs_per_feature)[::-1]
    global_importance = []
    for rank, idx in enumerate(sorted_feat_indices, 1):
        global_importance.append({
            "feature": feature_cols[idx],
            "mean_abs_shap": round(float(mean_abs_per_feature[idx]), 4),
            "rank": rank
        })

    # Beeswarm points for charting
    # Take a sample of points to visualize distribution
    beeswarm_sample = []
    n_pts = min(40, len(eval_subset))
    for f_idx in sorted_feat_indices[:max_display_features]:
        col_vals = eval_subset[:n_pts, f_idx]
        c_min = float(np.min(col_vals))
        c_max = float(np.max(col_vals))
        denom = (c_max - c_min) if (c_max - c_min) > 0 else 1.0
        
        for p_idx in range(n_pts):
            f_val = float(col_vals[p_idx])
            norm_val = round((f_val - c_min) / denom, 3)
            
            if is_multiclass:
                if isinstance(shap_vals, list):
                    sv = float(shap_vals[0][p_idx, f_idx])
                else:
                    sv = float(shap_vals[p_idx, f_idx, 0])
            else:
                sv = float(shap_vals[p_idx, f_idx])
                
            beeswarm_sample.append({
                "feature": feature_cols[f_idx],
                "feature_value": round(f_val, 3),
                "normalized_value": norm_val,
                "shap_value": round(sv, 4)
            })

    # Local Explanation
    local_explanation = None
    target_sample = None
    actual_val = None
    
    if custom_features is not None:
        # Explain user-provided features
        target_sample = np.array([[custom_features.get(c, 0.0) for c in feature_cols]])
        actual_val = None
    elif sample_index is not None and 0 <= sample_index < len(X_samples):
        target_sample = X_samples[sample_index:sample_index+1]
        if y_actuals is not None and sample_index < len(y_actuals):
            actual_val = y_actuals[sample_index]
            actual_val = int(actual_val) if isinstance(actual_val, (np.integer, int)) else float(actual_val)
    else:
        # Default to first test sample
        target_sample = X_samples[0:1]
        if y_actuals is not None and len(y_actuals) > 0:
            actual_val = y_actuals[0]
            actual_val = int(actual_val) if isinstance(actual_val, (np.integer, int)) else float(actual_val)

    if target_sample is not None:
        pred = model.predict(target_sample)[0]
        pred_val = int(pred) if isinstance(pred, (np.integer, int)) else round(float(pred), 3)
        
        # Calculate local shap values for target sample
        if is_tree_model:
            sample_shap = explainer.shap_values(target_sample)
        else:
            sample_shap = explainer.shap_values(target_sample, nsamples=50)
            
        if task_type == "classification" and hasattr(model, "classes_"):
            classes_list = list(model.classes_)
            if pred in classes_list:
                class_idx_for_local = classes_list.index(pred)
            explained_class_label = pred
            
            if hasattr(explainer, "expected_value"):
                if isinstance(explainer.expected_value, (list, np.ndarray)) and len(explainer.expected_value) > class_idx_for_local:
                    base_val = float(explainer.expected_value[class_idx_for_local])
                    
            if isinstance(sample_shap, list):
                feature_shaps = sample_shap[class_idx_for_local][0]
            elif isinstance(sample_shap, np.ndarray) and len(sample_shap.shape) == 3:
                feature_shaps = sample_shap[0, :, class_idx_for_local]
            else:
                feature_shaps = sample_shap[0]
        else:
            if isinstance(sample_shap, list):
                feature_shaps = sample_shap[0][0]
            elif isinstance(sample_shap, np.ndarray) and len(sample_shap.shape) == 2:
                feature_shaps = sample_shap[0]
            else:
                feature_shaps = sample_shap[0]
                
        contributions = []
        for i, col in enumerate(feature_cols):
            val = float(target_sample[0, i])
            sv = float(feature_shaps[i])
            contributions.append({
                "feature": col,
                "feature_value": round(val, 3),
                "shap_value": round(sv, 4),
                "direction": "positive" if sv >= 0 else "negative"
            })
            
        # Sort contributions by absolute magnitude
        contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        
        total_shap_sum = round(float(np.sum(feature_shaps)), 4)
        
        local_explanation = {
            "sample_index": sample_index,
            "actual_value": actual_val,
            "predicted_value": pred_val,
            "base_value": round(base_val, 4),
            "contributions": contributions,
            "total_shap_sum": total_shap_sum
        }

    return {
        "model_id": getattr(model, "model_id", "unknown"),
        "algorithm": type(model).__name__,
        "task_type": task_type,
        "base_value": round(base_val, 4),
        "global_importance": global_importance,
        "beeswarm_sample": beeswarm_sample,
        "local_explanation": local_explanation,
        "explained_class": explained_class_label,
        "message": "SHAP TreeExplainer calculation completed successfully."
    }
