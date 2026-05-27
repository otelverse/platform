use clap::Parser;
use edge_common::AgentConfig;
use log::{info, warn, error};
use std::fs;
use tokio::sync::mpsc;

mod db;
mod receiver;
mod forwarder;
mod opamp;
mod mqtt;

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

    // Start forwarder task
    let fwd_endpoint = agent_config.collector_endpoint.clone();
    let fwd_db_path = agent_config.buffer_path.clone();
    let sync_interval = agent_config.sync_interval_secs;
    tokio::spawn(async move {
        forwarder::run_forwarder(fwd_endpoint, fwd_db_path, sync_interval).await;
    });

    // Start OpAMP poller
    // Assuming the control plane is at http://localhost:8082 for now
    let control_plane_url = "http://localhost:8082".to_string();
    let agent_id = "agent-123".to_string();
    tokio::spawn(async move {
        opamp::run_opamp_poller(agent_id, control_plane_url, 60).await;
    });

    // Start MQTT Receiver if enabled
    if let Some(mqtt_config) = agent_config.mqtt {
        if mqtt_config.enabled {
            let broker = mqtt_config.broker;
            let mqtt_db_tx = db_tx.clone();
            tokio::spawn(async move {
                mqtt::start_mqtt_receiver(broker, mqtt_db_tx).await;
            });
        }
    }

    // Start OTLP Receiver
    let port = agent_config.local_listen_port;
    let receiver_db_tx = db_tx.clone();
    tokio::spawn(async move {
        receiver::start_receiver(port, receiver_db_tx).await;
    });

    // Keep the main thread alive
    tokio::signal::ctrl_c().await?;
    info!("Shutting down agent.");
    Ok(())
}
