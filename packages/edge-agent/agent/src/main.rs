use clap::Parser;
use edge_common::AgentConfig;
use log::{info, warn, error};
use std::fs;
use tokio::sync::mpsc;

mod db;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    #[arg(short, long, default_value = "config.yaml")]
    config: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();
    info!("Starting OTel Edge Agent...");

    let args = Args::parse();
    
    // Read configuration
    let config_contents = fs::read_to_string(&args.config).unwrap_or_else(|_| {
        warn!("Config file {} not found. Using defaults.", args.config);
        String::from("agent:\n  collector_endpoint: \"http://localhost:4317\"\n  local_listen_port: 4317\n  buffer_path: \"./otel_buffer.db\"\n  sync_interval_secs: 30\n")
    });
    
    // Parse YAML using an ad-hoc struct then extract AgentConfig
    #[derive(serde::Deserialize)]
    struct ConfigWrapper {
        agent: AgentConfig,
    }
    
    let config: ConfigWrapper = serde_yaml::from_str(&config_contents).expect("Failed to parse config");
    let agent_config = config.agent;

    info!("Agent started with config: {:?}", agent_config);

    // Setup SQLite database and channels
    let (db_tx, db_rx) = mpsc::channel(1000);
    
    let db_path = agent_config.buffer_path.clone();
    tokio::spawn(async move {
        db::run_db_task(db_path, db_rx).await;
    });

    // TODO: Setup OTLP Receiver, Forwarder, and MQTT ingestion

    // Keep the main thread alive
    tokio::signal::ctrl_c().await?;
    info!("Shutting down agent.");
    Ok(())
}
