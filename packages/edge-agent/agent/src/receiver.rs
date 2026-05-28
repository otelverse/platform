use axum::{
    routing::post,
    Router,
    extract::State,
    body::Bytes,
    http::StatusCode,
};
use log::{info, error};
use tokio::sync::mpsc;
use std::net::SocketAddr;
use prost::Message;
use opentelemetry_proto::tonic::collector::trace::v1::ExportTraceServiceRequest;

use crate::db::DbCommand;

#[derive(Clone)]
struct AppState {
    db_tx: mpsc::Sender<DbCommand>,
}

pub async fn start_receiver(port: u16, db_tx: mpsc::Sender<DbCommand>) {
    let state = AppState { db_tx };

    let app = Router::new()
        .route("/v1/traces", post(handle_traces))
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("Starting OTLP receiver on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn handle_traces(
    State(state): State<AppState>,
    body: Bytes,
) -> Result<StatusCode, StatusCode> {
    // Decode the incoming OTLP Protobuf request
    match ExportTraceServiceRequest::decode(body.clone()) {
        Ok(req) => {
            // For each resource span, we can store it.
            // But to simplify the offline buffer, we can just store the raw ExportTraceServiceRequest bytes
            // as a single "batch" to forward later.
            // We'll generate a random UUID for this batch to act as the trace_id/batch_id.
            let batch_id = uuid::Uuid::new_v4().to_string();
            
            if let Err(e) = state.db_tx.send(DbCommand::WriteSpan {
                trace_id: batch_id,
                span_bytes: body,
            }).await {
                error!("Failed to send span batch to DB task: {}", e);
                return Err(StatusCode::INTERNAL_SERVER_ERROR);
            }
            
            Ok(StatusCode::OK)
        }
        Err(e) => {
            error!("Failed to decode OTLP trace request: {}", e);
            Err(StatusCode::BAD_REQUEST)
        }
    }
}
