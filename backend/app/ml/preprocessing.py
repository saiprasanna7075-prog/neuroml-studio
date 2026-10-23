import io
import csv
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List, Optional
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

def detect_delimiter(file_content: str) -> str:
    """Automatically detect whether CSV delimiter is semicolon, comma, tab, or pipe."""
    sample = file_content[:4096]
    sniffer = csv.Sniffer()
    try:
        dialect = sniffer.sniff(sample, delimiters=";,\t|")
        return dialect.delimiter
    except Exception:
        # Fallback heuristic: count semicolons vs commas in first 5 lines
        lines = sample.splitlines()[:5]
        semicolons = sum(line.count(';') for line in lines)
        commas = sum(line.count(',') for line in lines)
        tabs = sum(line.count('\t') for line in lines)
        if semicolons > commas and semicolons > tabs:
            return ';'
        elif tabs > commas and tabs > semicolons:
            return '\t'
        return ','

def load_dataset_from_text(content: str, delimiter: Optional[str] = None) -> pd.DataFrame:
    """Load dataframe from raw text with automatic or specified delimiter."""
    if not delimiter:
        delimiter = detect_delimiter(content)
    df = pd.read_csv(io.StringIO(content), sep=delimiter)
    # Strip whitespace and quotes from column names
    df.columns = [c.strip().strip('"').strip("'") for c in df.columns]
    return df

def get_dataset_summary(df: pd.DataFrame, dataset_id: str, name: str, filename: str, file_size: int) -> Dict[str, Any]:
    """Generate comprehensive dataset statistics and summary."""
    total_rows, total_columns = df.shape
    columns = list(df.columns)
    
    missing_dict = df.isnull().sum().to_dict()
    total_missing = int(sum(missing_dict.values()))
    duplicates = int(df.duplicated().sum())
    
    dtypes_dict = {col: str(df[col].dtype) for col in columns}
    num_cols = list(df.select_dtypes(include=[np.number]).columns)
    
    target_dist = None
    target_stats = None
    
    # Check if 'quality' is present
    target_col = "quality" if "quality" in df.columns else (columns[-1] if len(columns) > 0 else "")
    if target_col in df.columns:
        if pd.api.types.is_numeric_dtype(df[target_col]):
            target_stats = {
                "min": float(df[target_col].min()),
                "max": float(df[target_col].max()),
                "mean": float(round(df[target_col].mean(), 3)),
                "std": float(round(df[target_col].std(), 3))
            }
            # Also get distribution of discrete scores
            val_counts = df[target_col].value_counts().sort_index().to_dict()
            target_dist = {str(k): int(v) for k, v in val_counts.items()}
        else:
            val_counts = df[target_col].value_counts().to_dict()
            target_dist = {str(k): int(v) for k, v in val_counts.items()}
            
    return {
        "id": dataset_id,
        "name": name,
        "filename": filename,
        "total_rows": total_rows,
        "total_columns": total_columns,
        "feature_names": [c for c in columns if c != target_col],
        "suggested_target": target_col,
        "missing_values": {k: int(v) for k, v in missing_dict.items()},
        "total_missing": total_missing,
        "duplicate_rows": duplicates,
        "data_types": dtypes_dict,
        "numerical_columns": num_cols,
        "target_distribution": target_dist,
        "target_stats": target_stats,
        "file_size_bytes": file_size
    }

def prepare_data_pipeline(
    df: pd.DataFrame,
    target_column: str,
    selected_features: Optional[List[str]] = None,
    task_type: str = "classification",
    handle_missing: str = "mean",
    remove_duplicates: bool = False,
    test_size: float = 0.3,
    random_state: int = 42,
    scale_features: bool = False,
    classification_mode: str = "multiclass"
) -> Dict[str, Any]:
    """
    Cleans, validates, splits (default 70:30), and optionally scales dataset.
    Ensures zero data leakage: scaler is fitted strictly on training partition.
    Supports multiclass (exact 3-9 ratings) and binary (quality >= 6 good vs < 6 standard).
    """
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset. Available columns: {list(df.columns)}")
    
    cleaned_df = df.copy()
    
    initial_rows = len(cleaned_df)
    if remove_duplicates:
        cleaned_df = cleaned_df.drop_duplicates().reset_index(drop=True)
    removed_duplicates_count = initial_rows - len(cleaned_df)
    
    # Missing values
    missing_count = int(cleaned_df.isnull().sum().sum())
    if missing_count > 0:
        if handle_missing == "drop":
            cleaned_df = cleaned_df.dropna().reset_index(drop=True)
        elif handle_missing == "median":
            for col in cleaned_df.select_dtypes(include=[np.number]).columns:
                cleaned_df[col] = cleaned_df[col].fillna(cleaned_df[col].median())
        else: # mean
            for col in cleaned_df.select_dtypes(include=[np.number]).columns:
                cleaned_df[col] = cleaned_df[col].fillna(cleaned_df[col].mean())
    
    # Feature columns
    if not selected_features:
        feature_cols = [c for c in cleaned_df.columns if c != target_column]
    else:
        feature_cols = [c for c in selected_features if c in cleaned_df.columns and c != target_column]
    
    if len(feature_cols) == 0:
        raise ValueError("At least one feature column must be selected.")
        
    # Verify features are numerical
    non_numeric = [c for c in feature_cols if not pd.api.types.is_numeric_dtype(cleaned_df[c])]
    if non_numeric:
        raise ValueError(f"Non-numeric features detected: {non_numeric}. NeuroML Studio currently trains on numerical physicochemical features.")
        
    X = cleaned_df[feature_cols].values
    
    if task_type == "classification":
        if classification_mode == "binary" and target_column == "quality":
            # Binary classification: 1 for Good (>=6), 0 for Standard/Bad (<6)
            y = (cleaned_df[target_column] >= 6).astype(int).values
            stratify = None
        elif classification_mode in ("three_tier", "ternary", "3tier", "3-tier") and target_column == "quality":
            # 3-Tier Quality: Low (<=5), Medium (6), High (>=7)
            conditions = [
                cleaned_df[target_column] <= 5,
                cleaned_df[target_column] == 6,
                cleaned_df[target_column] >= 7
            ]
            choices = ["Low (≤5)", "Medium (6)", "High (≥7)"]
            y = np.select(conditions, choices, default="Medium (6)").astype(str)
            stratify = y if len(np.unique(y)) > 1 and min(pd.Series(y).value_counts()) >= 2 else None
        else:
            # Multi-class classification: exact discrete ratings (3-9)
            if pd.api.types.is_numeric_dtype(cleaned_df[target_column]):
                y = cleaned_df[target_column].astype(int).values
            else:
                y = cleaned_df[target_column].astype(str).values
            stratify = y if len(np.unique(y)) > 1 and min(pd.Series(y).value_counts()) >= 2 else None
    else:
        y = cleaned_df[target_column].astype(float).values
        stratify = None
        
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=stratify
    )
    
    scaler = None
    if scale_features:
        # Prevent data leakage: fit on train only!
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)
        
    if task_type == "classification":
        if classification_mode in ("three_tier", "ternary", "3tier", "3-tier") and target_column == "quality":
            unique_classes = ["Low (≤5)", "Medium (6)", "High (≥7)"]
        elif classification_mode == "binary" and target_column == "quality":
            unique_classes = [0, 1]
        else:
            unique_classes = sorted(list(np.unique(y)))
    else:
        unique_classes = None
    
    return {
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "feature_cols": feature_cols,
        "target_col": target_column,
        "scaler": scaler,
        "cleaned_df": cleaned_df,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "classes": unique_classes,
        "removed_duplicates_count": removed_duplicates_count,
        "missing_imputed_count": missing_count,
        "task_type": task_type,
        "has_scaling": scale_features
    }
