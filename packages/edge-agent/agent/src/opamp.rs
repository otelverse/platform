use log::{info, error, debug};
use std::time::Duration;
use tokio::time;
use reqwest::Client;
use edge_common::OpAmpConfigResponse;

pub async fn run_opamp_poller(
    agent_id: String,
    control_plane_url: String,
    poll_interval_secs: u64,
) {
    info!("Starting OpAMP poller for agent {} at {}", agent_id, control_plane_url);
    let mut interval = time::interval(Duration::from_secs(poll_interval_secs));
    let client = Client::new();
    let url = format!("{}/v1/agent/{}/config", control_plane_url, agent_id);

    loop {
        interval.tick().await;
        debug!("Polling control plane for config updates...");
        
        match client.get(&url).send().await {
            Ok(response) => {
                if response.status().is_success() {
                    match response.json::<OpAmpConfigResponse>().await {
                        Ok(config_resp) => {
                            debug!("Received new config: \n{}", config_resp.config_yaml);
                            // In a full implementation, we'd apply this config dynamically
                            // (e.g., restart receivers, update forwarding rules)
                        }
                        Err(e) => error!("Failed to parse OpAMP config response: {}", e),
                    }
                } else {
                    error!("OpAMP poller: control plane returned status {}", response.status());
                }
            }
            Err(e) => {
                error!("OpAMP poller: network error fetching config: {}", e);
            }
        }
    }
}
