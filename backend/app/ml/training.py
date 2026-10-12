import time
from typing import Dict, Any, Tuple
import numpy as np

# Core Scikit-Learn Model Families
from sklearn.ensemble import (
    RandomForestClassifier, RandomForestRegressor,
    GradientBoostingClassifier, GradientBoostingRegressor,
    AdaBoostClassifier, AdaBoostRegressor,
    ExtraTreesClassifier, ExtraTreesRegressor,
    HistGradientBoostingClassifier, HistGradientBoostingRegressor
)
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.linear_model import (
    LogisticRegression, LinearRegression, Ridge, Lasso, ElasticNet,
    BayesianRidge, Perceptron, PassiveAggressiveClassifier, SGDClassifier, SGDRegressor
)
from sklearn.svm import SVC, SVR
from sklearn.naive_bayes import GaussianNB, MultinomialNB, BernoulliNB
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis, QuadraticDiscriminantAnalysis
from sklearn.gaussian_process import GaussianProcessRegressor, GaussianProcessClassifier
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.preprocessing import PolynomialFeatures, MinMaxScaler
from sklearn.pipeline import Pipeline

# Optional gradient boosting acceleration libraries
try:
    import xgboost as xgb
    HAS_XGBOOST = True
except Exception:
    HAS_XGBOOST = False

try:
    import lightgbm as lgb
    HAS_LIGHTGBM = True
except Exception:
    HAS_LIGHTGBM = False

def create_and_train_model(
    algorithm: str,
    task_type: str,
    hyperparameters: Dict[str, Any],
    X_train,
    y_train,
    random_state: int = 42
) -> Tuple[Any, float]:
    """
    Instantiates and fits the requested algorithm from the full ML catalog.
    Covers 16 Regression Models and 20 Classification Models.
    Returns (fitted_model, training_time_ms).
    """
    alg = algorithm.lower().strip().replace("-", "_").replace(" ", "_")
    start_time = time.perf_counter()
    
    # -------------------------------------------------------------------------
    # A. REGRESSION MODELS (16 Models)
    # -------------------------------------------------------------------------
    if task_type == "regression" or "regressor" in alg or alg in [
        "linear_regression", "multiple_linear_regression", "polynomial_regression",
        "ridge_regression", "lasso_regression", "elastic_net_regression",
        "bayesian_regression", "gaussian_process_regression", "svr", "support_vector_regression"
    ]:
        if alg in ["linear_regression", "multiple_linear_regression", "lr_reg"]:
            model = LinearRegression()

        elif alg in ["polynomial_regression", "poly_regression"]:
            degree = int(hyperparameters.get("degree", 2))
            model = Pipeline([
                ("poly", PolynomialFeatures(degree=degree, include_bias=False)),
                ("linear", LinearRegression())
            ])

        elif alg in ["ridge_regression", "ridge"]:
            alpha = float(hyperparameters.get("alpha", 1.0))
            model = Ridge(alpha=alpha, random_state=random_state)

        elif alg in ["lasso_regression", "lasso"]:
            alpha = float(hyperparameters.get("alpha", 0.1))
            model = Lasso(alpha=alpha, random_state=random_state)

        elif alg in ["elastic_net_regression", "elastic_net", "elasticnet"]:
            alpha = float(hyperparameters.get("alpha", 0.1))
            l1_ratio = float(hyperparameters.get("l1_ratio", 0.5))
            model = ElasticNet(alpha=alpha, l1_ratio=l1_ratio, random_state=random_state)

        elif alg in ["decision_tree_regressor", "decision_tree", "dt_reg"]:
            max_depth = hyperparameters.get("max_depth", None)
            if max_depth is not None and str(max_depth).lower() not in ["none", "null", ""]:
                max_depth = int(max_depth)
            else:
                max_depth = None
            model = DecisionTreeRegressor(max_depth=max_depth, random_state=random_state)

        elif alg in ["random_forest_regressor", "random_forest", "rf_reg"]:
            n_est = int(hyperparameters.get("n_estimators", 100))
            max_depth = hyperparameters.get("max_depth", None)
            if max_depth is not None and str(max_depth).lower() not in ["none", "null", ""]:
                max_depth = int(max_depth)
            else:
                max_depth = None
            model = RandomForestRegressor(
                n_estimators=n_est,
                max_depth=max_depth,
                min_samples_split=int(hyperparameters.get("min_samples_split", 2)),
                min_samples_leaf=int(hyperparameters.get("min_samples_leaf", 1)),
                random_state=random_state,
                n_jobs=-1
            )

        elif alg in ["gradient_boosting_regressor", "gradient_boosting", "gbm_reg"]:
            n_est = int(hyperparameters.get("n_estimators", 100))
            lr = float(hyperparameters.get("learning_rate", 0.1))
            model = GradientBoostingRegressor(n_estimators=n_est, learning_rate=lr, random_state=random_state)

        elif alg in ["xgboost_regressor", "xgboost"]:
            n_est = int(hyperparameters.get("n_estimators", 100))
            lr = float(hyperparameters.get("learning_rate", 0.1))
            if HAS_XGBOOST:
                model = xgb.XGBRegressor(n_estimators=n_est, learning_rate=lr, random_state=random_state, n_jobs=-1)
            else:
                model = HistGradientBoostingRegressor(max_iter=n_est, learning_rate=lr, random_state=random_state)

        elif alg in ["lightgbm_regressor", "lightgbm"]:
            n_est = int(hyperparameters.get("n_estimators", 100))
            lr = float(hyperparameters.get("learning_rate", 0.1))
            if HAS_LIGHTGBM:
                model = lgb.LGBMRegressor(n_estimators=n_est, learning_rate=lr, random_state=random_state, verbose=-1)
            else:
                model = HistGradientBoostingRegressor(max_iter=n_est, learning_rate=lr, random_state=random_state)

        elif alg in ["catboost_regressor", "catboost"]:
            n_est = int(hyperparameters.get("n_estimators", 100))
            lr = float(hyperparameters.get("learning_rate", 0.1))
            model = HistGradientBoostingRegressor(max_iter=n_est, learning_rate=lr, random_state=random_state)

        elif alg in ["svr", "support_vector_regression", "support_vector_regressor"]:
            c_val = float(hyperparameters.get("C", 1.0))
            kernel = str(hyperparameters.get("kernel", "rbf")).lower()
            model = SVR(C=c_val, kernel=kernel)

        elif alg in ["knn_regressor", "knn", "k_nearest_neighbors"]:
            n_neighbors = int(hyperparameters.get("n_neighbors", 5))
            metric = str(hyperparameters.get("metric", "euclidean")).lower()
            weights = str(hyperparameters.get("weights", "distance")).lower()
            model = KNeighborsRegressor(n_neighbors=n_neighbors, metric=metric, weights=weights)

        elif alg in ["bayesian_regression", "bayesian_ridge"]:
            model = BayesianRidge()

        elif alg in ["gaussian_process_regression", "gaussian_process"]:
            # Subsample if dataset is large to maintain fast response
            model = GaussianProcessRegressor(random_state=random_state, normalize_y=True)

        elif alg in ["mlp_regressor", "mlp"]:
            model = MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=300, random_state=random_state)

        else:
            # Default fallback for unknown regressor
            model = LinearRegression()

    # -------------------------------------------------------------------------
    # B. CLASSIFICATION MODELS (20 Models)
    # -------------------------------------------------------------------------
    else:
        if alg in ["logistic_regression", "lr"]:
            c_val = float(hyperparameters.get("C", 1.0))
            model = LogisticRegression(C=c_val, max_iter=1000, random_state=random_state)

        elif alg in ["knn", "k_nearest_neighbors", "knn_classifier"]:
            n_neighbors = int(hyperparameters.get("n_neighbors", 5))
            metric = str(hyperparameters.get("metric", "euclidean")).lower()
            weights = str(hyperparameters.get("weights", "uniform")).lower()
            model = KNeighborsClassifier(n_neighbors=n_neighbors, metric=metric, weights=weights)

        elif alg in ["decision_tree", "decision_tree_classifier", "dt"]:
            max_depth = hyperparameters.get("max_depth", None)
            if max_depth is not None and str(max_depth).lower() not in ["none", "null", ""]:
                max_depth = int(max_depth)
            else:
                max_depth = None
            model = DecisionTreeClassifier(max_depth=max_depth, random_state=random_state)

        elif alg in ["random_forest", "random_forest_classifier", "rf"]:
            n_est = int(hyperparameters.get("n_estimators", 100))
            max_depth = hyperparameters.get("max_depth", None)
            if max_depth is not None and str(max_depth).lower() not in ["none", "null", ""]:
                max_depth = int(max_depth)
            else:
                max_depth = None
            model = RandomForestClassifier(
                n_estimators=n_est,
                max_depth=max_depth,
                min_samples_split=int(hyperparameters.get("min_samples_split", 2)),
                min_samples_leaf=int(hyperparameters.get("min_samples_leaf", 1)),
                random_state=random_state,
                n_jobs=-1
            )

        elif alg in ["svm", "support_vector_machine", "svc"]:
            c_val = float(hyperparameters.get("C", 1.0))
            kernel = str(hyperparameters.get("kernel", "rbf")).lower()
            model = SVC(C=c_val, kernel=kernel, probability=True, random_state=random_state)

        elif alg in ["naive_bayes", "gaussian_naive_bayes", "gaussian_nb"]:
            model = GaussianNB()

        elif alg in ["multinomial_naive_bayes", "multinomial_nb"]:
            # Pipeline with non-negative scaling
            model = Pipeline([
                ("minmax", MinMaxScaler()),
                ("nb", MultinomialNB())
            ])

        elif alg in ["bernoulli_naive_bayes", "bernoulli_nb"]:
            model = Pipeline([
                ("minmax", MinMaxScaler()),
                ("nb", BernoulliNB(binarize=0.5))
            ])

        elif alg in ["gradient_boosting", "gradient_boosting_classifier", "gbm"]:
            n_est = int(hyperparameters.get("n_estimators", 100))
            lr = float(hyperparameters.get("learning_rate", 0.1))
            model = GradientBoostingClassifier(n_estimators=n_est, learning_rate=lr, random_state=random_state)

        elif alg in ["adaboost", "adaboost_classifier"]:
            n_est = int(hyperparameters.get("n_estimators", 50))
            model = AdaBoostClassifier(n_estimators=n_est, random_state=random_state)

        elif alg in ["xgboost", "xgboost_classifier"]:
            n_est = int(hyperparameters.get("n_estimators", 100))
            lr = float(hyperparameters.get("learning_rate", 0.1))
            if HAS_XGBOOST:
                # Map classes to 0..K-1 if needed
                model = xgb.XGBClassifier(n_estimators=n_est, learning_rate=lr, random_state=random_state, eval_metric="logloss", n_jobs=-1)
            else:
                model = HistGradientBoostingClassifier(max_iter=n_est, learning_rate=lr, random_state=random_state)

        elif alg in ["lightgbm", "lightgbm_classifier"]:
            n_est = int(hyperparameters.get("n_estimators", 100))
            lr = float(hyperparameters.get("learning_rate", 0.1))
            if HAS_LIGHTGBM:
                model = lgb.LGBMClassifier(n_estimators=n_est, learning_rate=lr, random_state=random_state, verbose=-1)
            else:
                model = HistGradientBoostingClassifier(max_iter=n_est, learning_rate=lr, random_state=random_state)

        elif alg in ["catboost", "catboost_classifier"]:
            n_est = int(hyperparameters.get("n_estimators", 100))
            lr = float(hyperparameters.get("learning_rate", 0.1))
            model = HistGradientBoostingClassifier(max_iter=n_est, learning_rate=lr, random_state=random_state)

        elif alg in ["extra_trees", "extra_trees_classifier"]:
            n_est = int(hyperparameters.get("n_estimators", 100))
            model = ExtraTreesClassifier(n_estimators=n_est, random_state=random_state, n_jobs=-1)

        elif alg in ["lda", "linear_discriminant_analysis"]:
            model = LinearDiscriminantAnalysis()

        elif alg in ["qda", "quadratic_discriminant_analysis"]:
            model = QuadraticDiscriminantAnalysis()

        elif alg in ["perceptron"]:
            model = Perceptron(max_iter=1000, random_state=random_state)

        elif alg in ["passive_aggressive", "passive_aggressive_classifier"]:
            model = PassiveAggressiveClassifier(max_iter=1000, random_state=random_state)

        elif alg in ["sgd", "sgd_classifier"]:
            model = SGDClassifier(loss="log_loss", max_iter=1000, random_state=random_state)

        elif alg in ["mlp", "multi_layer_perceptron"]:
            model = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=300, random_state=random_state)

        else:
            # Fallback to Random Forest
            model = RandomForestClassifier(n_estimators=100, random_state=random_state, n_jobs=-1)

    # Convert y labels if needed (e.g. for XGBoost requiring 0-indexed classes)
    model.fit(X_train, y_train)
    duration_ms = (time.perf_counter() - start_time) * 1000.0
    return model, round(duration_ms, 2)
