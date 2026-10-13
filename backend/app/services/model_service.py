import os
import uuid
import joblib
from datetime import datetime
from typing import Dict, Any, List, Optional, Union
import numpy as np

from app.ml.preprocessing import prepare_data_pipeline
from app.ml.training import create_and_train_model
from app.ml.evaluation import evaluate_model
from app.ml.prediction import predict_single
from app.ml.explainability import generate_shap_explanations
from app.services.dataset_service import dataset_service
from app.utils.database import save_experiment

MODEL_SAVE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "saved_models")
os.makedirs(MODEL_SAVE_DIR, exist_ok=True)

class ModelService:
    def __init__(self):
        self._models: Dict[str, Dict[str, Any]] = {}

    def train_model(
        self,
        dataset_id: str,
        algorithm: str,
        task_type: str = "classification",
        target_column: str = "quality",
        selected_features: Optional[List[str]] = None,
        test_size: float = 0.3,
        random_state: int = 42,
        scale_features: Optional[bool] = None,
        remove_duplicates: bool = False,
        hyperparameters: Optional[Dict[str, Any]] = None,
        experiment_name: Optional[str] = None,
        classification_mode: str = "multiclass"
    ) -> Dict[str, Any]:
        """Executes full training pipeline, evaluation, artifact persistence, and experiment logging."""
        df = dataset_service.get_dataframe(dataset_id)
        if df is None:
            raise ValueError(f"Dataset with ID '{dataset_id}' not found.")
            
        summary = dataset_service.get_summary(dataset_id)
        dataset_name = summary["name"] if summary else dataset_id
        
        hyperparameters = hyperparameters or {}
        
        # Determine feature scaling rule:
        # Distance, linear, gradient descent, and kernel models benefit greatly from scaling.
        # Tree-based ensembles (Random Forest, Decision Tree, Extra Trees, XGBoost, LightGBM, CatBoost) are scale-invariant.
        alg_lower = algorithm.lower().strip().replace("-", "_").replace(" ", "_")
        models_needing_scale = [
            "knn", "k_nearest_neighbors", "knn_regressor", "knn_classifier",
            "svm", "svc", "svr", "support_vector_regression", "support_vector_machine",
            "sgd", "sgd_classifier", "perceptron", "passive_aggressive", "passive_aggressive_classifier",
            "mlp", "mlp_regressor", "neural_network", "multi_layer_perceptron",
            "linear_regression", "multiple_linear_regression", "polynomial_regression",
            "ridge_regression", "ridge", "lasso_regression", "lasso", "elastic_net_regression", "elastic_net",
            "bayesian_regression", "bayesian_ridge", "gaussian_process_regression", "gaussian_process",
            "logistic_regression", "lda", "linear_discriminant_analysis", "qda", "quadratic_discriminant_analysis"
        ]
        if scale_features is None:
            if any(k in alg_lower for k in models_needing_scale):
                apply_scaling = True
            else:
                apply_scaling = False
        else:
            apply_scaling = bool(scale_features)
            
        # 1. Preprocessing pipeline (70:30 split, scaler fitted ONLY on training)
        pipeline = prepare_data_pipeline(
            df=df,
            target_column=target_column,
            selected_features=selected_features,
            task_type=task_type,
            handle_missing="mean",
            remove_duplicates=remove_duplicates,
            test_size=test_size,
            random_state=random_state,
            scale_features=apply_scaling,
            classification_mode=classification_mode
        )
        
        X_train = pipeline["X_train"]
        X_test = pipeline["X_test"]
        y_train = pipeline["y_train"]
        y_test = pipeline["y_test"]
        feature_cols = pipeline["feature_cols"]
        scaler = pipeline["scaler"]
        classes = pipeline["classes"]
        
        # 2. Train Model
        model, training_time_ms = create_and_train_model(
            algorithm=algorithm,
            task_type=task_type,
            hyperparameters=hyperparameters,
            X_train=X_train,
            y_train=y_train,
            random_state=random_state
        )
        
        # 3. Evaluate Model
        eval_results = evaluate_model(
            model=model,
            task_type=task_type,
            X_test=X_test,
            y_test=y_test,
            feature_cols=feature_cols,
            classes=classes
        )
        
        model_id = str(uuid.uuid4())[:8]
        setattr(model, "model_id", model_id)
        
        # Comprehensive Display Names for All 36 Models
        name_map = {
            # Regression Models (16)
            "linear_regression": "Linear Regression",
            "multiple_linear_regression": "Multiple Linear Regression",
            "polynomial_regression": "Polynomial Regression",
            "ridge_regression": "Ridge Regression",
            "lasso_regression": "Lasso Regression",
            "elastic_net_regression": "Elastic Net Regression",
            "decision_tree_regressor": "Decision Tree Regressor",
            "random_forest_regressor": "Random Forest Regressor",
            "gradient_boosting_regressor": "Gradient Boosting Regressor",
            "xgboost_regressor": "XGBoost Regressor",
            "lightgbm_regressor": "LightGBM Regressor",
            "catboost_regressor": "CatBoost Regressor",
            "svr": "Support Vector Regression (SVR)",
            "support_vector_regression": "Support Vector Regression (SVR)",
            "knn_regressor": "KNN Regressor",
            "bayesian_regression": "Bayesian Regression",
            "gaussian_process_regression": "Gaussian Process Regression",
            
            # Classification Models (20)
            "logistic_regression": "Logistic Regression",
            "knn": "K-Nearest Neighbors (KNN)",
            "k_nearest_neighbors": "K-Nearest Neighbors (KNN)",
            "decision_tree": "Decision Tree Classifier",
            "decision_tree_classifier": "Decision Tree Classifier",
            "random_forest": "Random Forest Classifier",
            "random_forest_classifier": "Random Forest Classifier",
            "svm": "Support Vector Machine (SVM)",
            "support_vector_machine": "Support Vector Machine (SVM)",
            "naive_bayes": "Naive Bayes",
            "gaussian_naive_bayes": "Gaussian Naive Bayes",
            "multinomial_naive_bayes": "Multinomial Naive Bayes",
            "bernoulli_naive_bayes": "Bernoulli Naive Bayes",
            "gradient_boosting": "Gradient Boosting Classifier",
            "gradient_boosting_classifier": "Gradient Boosting Classifier",
            "adaboost": "AdaBoost Classifier",
            "adaboost_classifier": "AdaBoost Classifier",
            "xgboost": "XGBoost Classifier",
            "xgboost_classifier": "XGBoost Classifier",
            "lightgbm": "LightGBM Classifier",
            "lightgbm_classifier": "LightGBM Classifier",
            "catboost": "CatBoost Classifier",
            "catboost_classifier": "CatBoost Classifier",
            "extra_trees": "Extra Trees Classifier",
            "extra_trees_classifier": "Extra Trees Classifier",
            "lda": "Linear Discriminant Analysis (LDA)",
            "linear_discriminant_analysis": "Linear Discriminant Analysis (LDA)",
            "qda": "Quadratic Discriminant Analysis (QDA)",
            "quadratic_discriminant_analysis": "Quadratic Discriminant Analysis (QDA)",
            "perceptron": "Perceptron",
            "passive_aggressive": "Passive-Aggressive Classifier",
            "passive_aggressive_classifier": "Passive-Aggressive Classifier",
            "sgd": "SGD Classifier",
            "sgd_classifier": "SGD Classifier",
            "mlp": "Multi-Layer Perceptron (MLP)"
        }
        display_name = name_map.get(alg_lower, algorithm.replace("_", " ").title())
        
        artifact_path = os.path.join(MODEL_SAVE_DIR, f"{model_id}.joblib")
        # Save pipeline and metadata safely
        joblib.dump({
            "model": model,
            "scaler": scaler,
            "feature_cols": feature_cols,
            "target_col": target_column,
            "task_type": task_type,
            "algorithm": algorithm,
            "classes": classes
        }, artifact_path)
        
        created_at = datetime.utcnow().isoformat()
        
        response_data = {
            "model_id": model_id,
            "experiment_id": model_id,
            "algorithm": algorithm,
            "algorithm_name": display_name,
            "task_type": task_type,
            "dataset_id": dataset_id,
            "dataset_name": dataset_name,
            "target_column": target_column,
            "features": feature_cols,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "test_size": test_size,
            "random_state": random_state,
            "scaling_applied": apply_scaling,
            "training_time_ms": training_time_ms,
            "classification_metrics": eval_results["classification_metrics"],
            "regression_metrics": eval_results["regression_metrics"],
            "feature_importances": eval_results["feature_importances"],
            "actual_vs_predicted": eval_results["actual_vs_predicted"],
            "hyperparameters": hyperparameters,
            "created_at": created_at
        }
        
        # Store in memory cache
        self._models[model_id] = {
            "model": model,
            "scaler": scaler,
            "metadata": response_data,
            "X_train": X_train,
            "X_test": X_test,
            "y_test": y_test,
            "artifact_path": artifact_path
        }
        
        # Save experiment to SQLite
        exp_name = experiment_name or f"{display_name} on {dataset_name}"
        metrics_dict = (eval_results["classification_metrics"] if task_type == "classification" else eval_results["regression_metrics"]) or {}
        save_experiment(
            exp_id=model_id,
            name=exp_name,
            algorithm=display_name,
            dataset_name=dataset_name,
            task_type=task_type,
            target_column=target_column,
            hyperparameters=hyperparameters,
            metrics=metrics_dict,
            status="COMPLETED",
            model_artifact_path=artifact_path
        )
        
        return response_data

    def get_model_entry(self, model_id: str) -> Optional[Dict[str, Any]]:
        # Check cache
        if model_id in self._models:
            return self._models[model_id]
        # Check disk artifact
        artifact_path = os.path.join(MODEL_SAVE_DIR, f"{model_id}.joblib")
        if os.path.exists(artifact_path):
            try:
                saved = joblib.load(artifact_path)
                entry = {
                    "model": saved["model"],
                    "scaler": saved["scaler"],
                    "artifact_path": artifact_path,
                    "metadata": {
                        "model_id": model_id,
                        "algorithm": saved["algorithm"],
                        "task_type": saved["task_type"],
                        "features": saved["feature_cols"],
                        "target_column": saved["target_col"]
                    }
                }
                self._models[model_id] = entry
                return entry
            except Exception:
                return None
        return None

    def get_metrics(self, model_id: str) -> Optional[Dict[str, Any]]:
        entry = self.get_model_entry(model_id)
        if not entry:
            return None
        return entry.get("metadata")

    def predict(self, model_id: str, features: Dict[str, float]) -> Dict[str, Any]:
        entry = self.get_model_entry(model_id)
        if not entry:
            raise ValueError(f"Model '{model_id}' not found.")
        model = entry["model"]
        scaler = entry.get("scaler")
        meta = entry.get("metadata", {})
        feature_cols = meta.get("features", [])
        task_type = meta.get("task_type", "classification")
        
        result = predict_single(
            model=model,
            scaler=scaler,
            feature_cols=feature_cols,
            features=features,
            task_type=task_type
        )
        result["model_id"] = model_id
        result["algorithm"] = meta.get("algorithm_name", meta.get("algorithm", "Model"))
        result["task_type"] = task_type
        return result

    def explain(
        self,
        model_id: str,
        sample_index: Optional[int] = None,
        custom_features: Optional[Dict[str, float]] = None,
        max_display_features: int = 11
    ) -> Dict[str, Any]:
        entry = self.get_model_entry(model_id)
        if not entry:
            raise ValueError(f"Model '{model_id}' not found.")
            
        model = entry["model"]
        meta = entry.get("metadata", {})
        feature_cols = meta.get("features", [])
        task_type = meta.get("task_type", "classification")
        
        # Background / evaluation test samples
        X_train = entry.get("X_train")
        X_test = entry.get("X_test")
        y_test = entry.get("y_test")
        
        if X_train is None or X_test is None:
            # Reconstruct from dataset if possible
            ds_id = meta.get("dataset_id", "wine_white")
            df = dataset_service.get_dataframe(ds_id)
            if df is not None:
                pipe = prepare_data_pipeline(
                    df=df,
                    target_column=meta.get("target_column", "quality"),
                    selected_features=feature_cols,
                    task_type=task_type,
                    scale_features=meta.get("scaling_applied", False)
                )
                X_train = pipe["X_train"]
                X_test = pipe["X_test"]
                y_test = pipe["y_test"]
            else:
                raise ValueError("Dataset partition for SHAP explanation not found in memory.")
                
        # Scale custom features if scaler is present
        scaler = entry.get("scaler")
        custom_arr = None
        if custom_features is not None:
            row = [custom_features.get(c, 0.0) for c in feature_cols]
            c_input = np.array([row])
            if scaler is not None:
                c_input = scaler.transform(c_input)
            custom_arr = {c: float(c_input[0, i]) for i, c in enumerate(feature_cols)}
            
        return generate_shap_explanations(
            model=model,
            task_type=task_type,
            X_background=X_train,
            X_samples=X_test,
            feature_cols=feature_cols,
            sample_index=sample_index,
            custom_features=custom_arr,
            y_actuals=y_test,
            max_display_features=max_display_features
        )

    def compare_models(self, model_ids: List[str]) -> Dict[str, Any]:
        entries = []
        for mid in model_ids:
            entry = self.get_model_entry(mid)
            if entry and "metadata" in entry:
                entries.append(entry["metadata"])
                
        if len(entries) < 2:
            raise ValueError("Select at least 2 trained models to compare.")
            
        task_type = entries[0]["task_type"]
        
        # Check winner per metric
        winner = {}
        if task_type == "classification":
            best_acc_m = max(entries, key=lambda m: m["classification_metrics"]["accuracy"] if m.get("classification_metrics") else 0)
            best_f1_m = max(entries, key=lambda m: m["classification_metrics"]["f1_macro"] if m.get("classification_metrics") else 0)
            winner["by_accuracy"] = {
                "model_id": best_acc_m["model_id"],
                "algorithm": best_acc_m["algorithm_name"],
                "value": best_acc_m["classification_metrics"]["accuracy"]
            }
            winner["by_f1_score"] = {
                "model_id": best_f1_m["model_id"],
                "algorithm": best_f1_m["algorithm_name"],
                "value": best_f1_m["classification_metrics"]["f1_macro"]
            }
            summary = (
                f"{best_acc_m['algorithm_name']} achieved the highest accuracy of "
                f"{round(best_acc_m['classification_metrics']['accuracy']*100, 2)}%."
            )
        else:
            best_r2_m = max(entries, key=lambda m: m["regression_metrics"]["r2_score"] if m.get("regression_metrics") else -999)
            best_rmse_m = min(entries, key=lambda m: m["regression_metrics"]["rmse"] if m.get("regression_metrics") else 999)
            winner["by_r2_score"] = {
                "model_id": best_r2_m["model_id"],
                "algorithm": best_r2_m["algorithm_name"],
                "value": best_r2_m["regression_metrics"]["r2_score"]
            }
            winner["by_rmse"] = {
                "model_id": best_rmse_m["model_id"],
                "algorithm": best_rmse_m["algorithm_name"],
                "value": best_rmse_m["regression_metrics"]["rmse"]
            }
            summary = (
                f"{best_r2_m['algorithm_name']} achieved the highest R² score of "
                f"{best_r2_m['regression_metrics']['r2_score']}."
            )
            
        return {
            "task_type": task_type,
            "models": entries,
            "winning_model": winner,
            "comparison_summary": summary
        }

model_service = ModelService()
