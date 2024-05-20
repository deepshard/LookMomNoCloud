import sqlite3
from schemas import ModelInfo


def connect_db():
    """Connect to the Truffle SQLite database."""

    return sqlite3.connect("truffle.db")


def create_models_table():
    """Create the running_models table if it doesn't exist."""

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS running_models (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            size INTEGER NOT NULL,
            status TEXT NOT NULL,
            pid INTEGER,
            port INTEGER,
            quantization TEXT,
            progress REAL
        )               
    """)
    conn.commit()
    conn.close()


def insert_model(model_info: ModelInfo):
    """Insert a new model into the running_models table."""

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO running_models (id, name, size, status, pid, port, quantization, progress)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (model_info.id, model_info.name, model_info.size, model_info.status.value, model_info.pid, model_info.port,
          model_info.quantization.value, model_info.progress))
    conn.commit()
    conn.close()


def update_model(model_info: ModelInfo):
    """Update an existing model in the running_models table."""

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE running_models
        SET name = ?, size = ?, status = ?, pid = ?, port = ?, quantization = ?, progress = ?
        WHERE id = ?
    """, (model_info.name, model_info.size, model_info.status.value, model_info.pid, model_info.port,
          model_info.quantization.value, model_info.progress, model_info.id))
    conn.commit()
    conn.close()


def delete_model(model_id: str):
    """Delete a model from the running_models table."""

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        DELETE FROM running_models
        WHERE id = ?
    """, (model_id,))
    conn.commit()
    conn.close()


def get_model(model_id: str):
    """Get a model from the running_models table."""

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, size, status, pid, port, quantization, progress
        FROM running_models
        WHERE id = ?
    """, (model_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return None

    return ModelInfo(
        id=row[0],
        name=row[1],
        size=row[2],
        status=row[3],
        pid=row[4],
        port=row[5],
        quantization=row[6],
        progress=row[7]
    )


def get_models():
    """Get all models from the running_models table."""

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, size, status, pid, port, quantization, progress
        FROM running_models
    """)
    rows = cursor.fetchall()
    conn.close()

    return [
        ModelInfo(
            id=row[0],
            name=row[1],
            size=row[2],
            status=row[3],
            pid=row[4],
            port=row[5],
            quantization=row[6],
            progress=row[7]
        )
        for row in rows
    ]
