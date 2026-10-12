import sqlite3
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "experiments.db")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS experiments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        algorithm TEXT NOT NULL,
        dataset_name TEXT NOT NULL,
        task_type TEXT NOT NULL,
        target_column TEXT NOT NULL,
        hyperparameters TEXT NOT NULL,
        metrics TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        model_artifact_path TEXT
    )
    """)
    conn.commit()
    conn.close()

def save_experiment(
    exp_id: str,
    name: str,
    algorithm: str,
    dataset_name: str,
    task_type: str,
    target_column: str,
    hyperparameters: Dict[str, Any],
    metrics: Dict[str, Any],
    status: str = "COMPLETED",
    model_artifact_path: Optional[str] = None
):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO experiments (
        id, name, algorithm, dataset_name, task_type, target_column,
        hyperparameters, metrics, status, created_at, model_artifact_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        exp_id,
        name,
        algorithm,
        dataset_name,
        task_type,
        target_column,
        json.dumps(hyperparameters),
        json.dumps(metrics),
        status,
        datetime.utcnow().isoformat(),
        model_artifact_path
    ))
    conn.commit()
    conn.close()

def get_all_experiments() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM experiments ORDER BY created_at DESC")
    rows = cursor.fetchall()
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "name": r["name"],
            "algorithm": r["algorithm"],
            "dataset_name": r["dataset_name"],
            "task_type": r["task_type"],
            "target_column": r["target_column"],
            "hyperparameters": json.loads(r["hyperparameters"]),
            "metrics": json.loads(r["metrics"]),
            "status": r["status"],
            "created_at": r["created_at"],
            "model_artifact_path": r["model_artifact_path"]
        })
    conn.close()
    return results

def get_experiment_by_id(exp_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM experiments WHERE id = ?", (exp_id,))
    r = cursor.fetchone()
    conn.close()
    if not r:
        return None
    return {
        "id": r["id"],
        "name": r["name"],
        "algorithm": r["algorithm"],
        "dataset_name": r["dataset_name"],
        "task_type": r["task_type"],
        "target_column": r["target_column"],
        "hyperparameters": json.loads(r["hyperparameters"]),
        "metrics": json.loads(r["metrics"]),
        "status": r["status"],
        "created_at": r["created_at"],
        "model_artifact_path": r["model_artifact_path"]
    }
