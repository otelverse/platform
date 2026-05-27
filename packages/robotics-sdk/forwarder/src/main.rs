use edge_common::config::AgentConfig;

fn main() {
    println!("Robotics Forwarder initializing...");
    let _config = AgentConfig {
        device_id: "robot-sim-1".to_string(),
        backend_url: "http://localhost:4318".to_string(),
        auth_token: "sim-token".to_string(),
        collection_interval: 10,
    };
    println!("Forwarder running with device_id: {}", _config.device_id);
}
