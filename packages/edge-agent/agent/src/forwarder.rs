use log::{info, error, debug};
use std::time::Duration;
use tokio::time;
use reqwest::Client;
use rusqlite::Connection;

pub async fn run_forwarder(
    collector_endpoint: String,
    db_path: String,
    sync_interval_secs: u64,
) {
    info!("Starting forwarder task every {} seconds to {}", sync_interval_secs, collector_endpoint);
    let mut interval = time::interval(Duration::from_secs(sync_interval_secs));
    let client = Client::new();

    loop {
        interval.tick().await;

        // Since rusqlite is synchronous, we use spawn_blocking to avoid blocking the Tokio thread
        let db_path_clone = db_path.clone();
        let endpoint_clone = collector_endpoint.clone();
        let client_clone = client.clone();

        tokio::task::spawn_blocking(move || {
            let conn = match Connection::open(&db_path_clone) {
                Ok(c) => c,
                Err(e) => {
                    error!("Forwarder: failed to open DB: {}", e);
                    return;
                }
            };

            let mut stmt = match conn.prepare("SELECT id, span_bytes FROM spans WHERE synced = 0 LIMIT 50") {
                Ok(s) => s,
                Err(e) => {
                    error!("Forwarder: failed to prepare statement: {}", e);
                    return;
                }
            };

            let rows = stmt.query_map([], |row| {
                let id: i64 = row.get(0)?;
                let span_bytes: Vec<u8> = row.get(1)?;
                Ok((id, span_bytes))
            });

            match rows {
                Ok(mapped_rows) => {
                    let mut to_mark_synced = Vec::new();
                    
                    for row in mapped_rows {
                        if let Ok((id, span_bytes)) = row {
                            // In a real environment, we'd batch these properly using opentelemetry protobuf structures.
                            // Since each row here is already a full ExportTraceServiceRequest (as saved in receiver),
                            // we just forward it directly.
                            
                            // To actually do async networking inside spawn_blocking, we use block_on
                            // Or better: fetch rows, return them, and do networking in async space!
                            to_mark_synced.push((id, span_bytes));
                        }
                    }

                    if !to_mark_synced.is_empty() {
                        tokio::runtime::Handle::current().block_on(async {
                            debug!("Found {} unsynced spans", to_mark_synced.len());
                            for (id, span_bytes) in to_mark_synced {
                                let res = client_clone.post(format!("{}/v1/traces", endpoint_clone))
                                    .header("Content-Type", "application/x-protobuf")
                                    .body(span_bytes)
                                    .send()
                                    .await;
                                
                                match res {
                                    Ok(response) if response.status().is_success() => {
                                        // Mark synced
                                        let _ = conn.execute("UPDATE spans SET synced = 1 WHERE id = ?1", rusqlite::params![id]);
                                    },
                                    Ok(response) => {
                                        error!("Forwarder: Collector returned error status: {}", response.status());
                                    },
                                    Err(e) => {
                                        error!("Forwarder: Network error sending to collector: {}", e);
                                        // Break on network error, try again next tick
                                        break;
                                    }
                                }
                            }
                        });
                    }
                }
                Err(e) => {
                    error!("Forwarder: failed to query rows: {}", e);
                }
            }
        });
    }
}
