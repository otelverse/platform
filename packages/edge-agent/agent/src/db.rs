use log::{info, error};
use rusqlite::{params, Connection};
use tokio::sync::mpsc;
use bytes::Bytes;

pub enum DbCommand {
    WriteSpan { trace_id: String, span_bytes: Bytes },
    // Will add commands for reading and updating synced status
}

pub async fn run_db_task(db_path: String, mut rx: mpsc::Receiver<DbCommand>) {
    info!("Initializing SQLite database at {}", db_path);
    
    // Using rusqlite in a blocking thread or directly? 
    // Since this is a dedicated Tokio task, we shouldn't do heavy blocking operations,
    // but SQLite writes are usually fast. For true non-blocking, we could use spawn_blocking.
    // For simplicity in the edge agent, we'll open it here.
    let conn = Connection::open(&db_path).expect("Failed to open SQLite database");
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS spans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trace_id TEXT NOT NULL,
            span_bytes BLOB NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            synced BOOLEAN NOT NULL DEFAULT 0
        )",
        [],
    ).expect("Failed to create table");

    info!("SQLite database ready.");

    while let Some(cmd) = rx.recv().await {
        match cmd {
            DbCommand::WriteSpan { trace_id, span_bytes } => {
                let res = conn.execute(
                    "INSERT INTO spans (trace_id, span_bytes, synced) VALUES (?1, ?2, 0)",
                    params![trace_id, span_bytes.to_vec()],
                );
                if let Err(e) = res {
                    error!("Failed to write span to DB: {}", e);
                }
            }
        }
    }
}
