use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgentConfig {
    pub collector_endpoint: String,
    pub local_listen_port: u16,
    pub buffer_path: String,
    pub sync_interval_secs: u64,
    pub mqtt: Option<MqttConfig>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MqttConfig {
    pub enabled: bool,
    pub broker: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OpAmpConfigResponse {
    pub config_yaml: String,
}
