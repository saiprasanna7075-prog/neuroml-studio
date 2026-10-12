import os
import uuid
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from app.ml.preprocessing import (
    load_dataset_from_text,
    get_dataset_summary,
    prepare_data_pipeline
)

class DatasetService:
    def __init__(self):
        self._datasets: Dict[str, Dict[str, Any]] = {}
        self._preprocessed_cache: Dict[str, Dict[str, Any]] = {}

    def preload_builtin_datasets(self, data_dir: str):
        """Loads default wine datasets if available."""
        white_content = None
        white_path = os.path.join(data_dir, "winequality-white.csv")
        if os.path.exists(white_path):
            with open(white_path, "r", encoding="utf-8") as f:
                white_content = f.read()
            self.register_dataset(
                dataset_id="wine_white",
                name="Wine Quality (White)",
                filename="winequality-white.csv",
                content=white_content
            )

        red_content = None
        red_path = os.path.join(data_dir, "winequality-red.csv")
        if os.path.exists(red_path):
            with open(red_path, "r", encoding="utf-8") as f:
                red_content = f.read()
            self.register_dataset(
                dataset_id="wine_red",
                name="Wine Quality (Red)",
                filename="winequality-red.csv",
                content=red_content
            )

        # Preload Combined Wine (White + Red)
        if white_content and red_content:
            try:
                df_white = load_dataset_from_text(white_content)
                df_red = load_dataset_from_text(red_content)
                df_combined = pd.concat([df_white, df_red], ignore_index=True)
                combined_csv = df_combined.to_csv(index=False, sep=";")
                self.register_dataset(
                    dataset_id="wine_combined",
                    name="Wine Quality (Combined Red & White)",
                    filename="winequality-combined.csv",
                    content=combined_csv
                )
            except Exception as e:
                print(f"[DatasetService] Failed to create combined wine dataset: {e}")

    def combine_datasets(self, dataset_ids: List[str], name: Optional[str] = None) -> Dict[str, Any]:
        """Combines multiple datasets into one unified dataset."""
        dfs = []
        for did in dataset_ids:
            if did not in self._datasets:
                raise ValueError(f"Dataset '{did}' not found.")
            dfs.append(self._datasets[did]["df"])

        combined_df = pd.concat(dfs, ignore_index=True)
        new_id = str(uuid.uuid4())[:8]
        combined_name = name or f"Combined Dataset ({' + '.join(self._datasets[did]['summary']['name'] for did in dataset_ids)})"
        combined_filename = f"combined_{new_id}.csv"
        csv_content = combined_df.to_csv(index=False, sep=";")
        return self.register_dataset(new_id, combined_name, combined_filename, csv_content)

    def register_dataset(self, dataset_id: str, name: str, filename: str, content: str) -> Dict[str, Any]:
        """Parses CSV content and stores DataFrame and summary in memory."""
        df = load_dataset_from_text(content)
        summary = get_dataset_summary(df, dataset_id, name, filename, len(content.encode("utf-8")))
        self._datasets[dataset_id] = {
            "df": df,
            "summary": summary,
            "raw_content": content
        }
        return summary

    def upload_dataset(self, filename: str, content: str, name: Optional[str] = None) -> Dict[str, Any]:
        dataset_id = str(uuid.uuid4())[:8]
        dataset_name = name or filename.rsplit(".", 1)[0].replace("-", " ").replace("_", " ").title()
        return self.register_dataset(dataset_id, dataset_name, filename, content)

    def list_datasets(self) -> List[Dict[str, Any]]:
        return [data["summary"] for data in self._datasets.values()]

    def get_summary(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        if dataset_id not in self._datasets:
            return None
        return self._datasets[dataset_id]["summary"]

    def get_preview(self, dataset_id: str, page: int = 1, page_size: int = 100) -> Optional[Dict[str, Any]]:
        if dataset_id not in self._datasets:
            return None
        df = self._datasets[dataset_id]["df"]
        total_rows = len(df)
        start_idx = (page - 1) * page_size
        end_idx = min(start_idx + page_size, total_rows)
        slice_df = df.iloc[start_idx:end_idx]
        
        # Replace NaN with None for clean JSON serialization
        clean_slice = slice_df.replace({np.nan: None})
        rows = clean_slice.to_dict(orient="records")
        return {
            "id": dataset_id,
            "columns": list(df.columns),
            "rows": rows,
            "total_rows": total_rows,
            "page": page,
            "page_size": page_size
        }

    def get_correlations(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        if dataset_id not in self._datasets:
            return None
        df = self._datasets[dataset_id]["df"]
        num_df = df.select_dtypes(include=[np.number])
        if num_df.empty:
            return None
        corr = num_df.corr().round(3)
        features = list(corr.columns)
        matrix = corr.values.tolist()
        return {
            "features": features,
            "matrix": matrix
        }

    def get_dataframe(self, dataset_id: str) -> Optional[pd.DataFrame]:
        if dataset_id not in self._datasets:
            return None
        return self._datasets[dataset_id]["df"].copy()

dataset_service = DatasetService()
