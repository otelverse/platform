use serde::{Deserialize, Serialize};
use std::process::{Child, Command};
use std::sync::Mutex;

pub struct ProcessManager {
    pub platform: Mutex<Option<Child>>,
    pub collector: Mutex<Option<Child>>,
    pub sample_app: Mutex<Option<Child>>,
}

impl ProcessManager {
    pub fn new() -> Self {
        ProcessManager {
            platform: Mutex::new(None),
            collector: Mutex::new(None),
            sample_app: Mutex::new(None),
        }
    }

    pub fn start_platform(&self, binary: &str, port: u16, data_dir: &str) -> Result<u32, String> {
        let child = Command::new(binary)
            .args(["--port", &port.to_string(), "--data-dir", data_dir])
            .spawn()
            .map_err(|e| format!("Failed to start platform: {}", e))?;

        let pid = child.id();
        *self.platform.lock().unwrap() = Some(child);
        Ok(pid)
    }

    pub fn start_collector(&self, binary: &str, config: &str) -> Result<u32, String> {
        let child = Command::new(binary)
            .args(["--config", config])
            .spawn()
            .map_err(|e| format!("Failed to start collector: {}", e))?;

        let pid = child.id();
        *self.collector.lock().unwrap() = Some(child);
        Ok(pid)
    }

    pub fn stop_collector(&self) -> Result<(), String> {
        if let Some(mut child) = self.collector.lock().unwrap().take() {
            let _ = child.kill();
            let _ = child.wait();
        }
        Ok(())
    }

    pub fn start_sample_app(&self, script: &str, node_bin: &str, collector_url: &str) -> Result<u32, String> {
        self.stop_sample_app()?;
        let child = Command::new(node_bin)
            .arg(script)
            .env("OTEL_EXPORTER_OTLP_ENDPOINT", collector_url)
            .spawn()
            .map_err(|e| format!("Failed to start sample app: {}", e))?;

        let pid = child.id();
        *self.sample_app.lock().unwrap() = Some(child);
        Ok(pid)
    }

    pub fn stop_sample_app(&self) -> Result<(), String> {
        if let Some(mut child) = self.sample_app.lock().unwrap().take() {
            let _ = child.kill();
            let _ = child.wait();
        }
        Ok(())
    }

    pub fn stop_all(&self) {
        for process in [&self.collector, &self.platform, &self.sample_app] {
            if let Some(mut child) = process.lock().unwrap().take() {
                let _ = child.kill();
                let _ = child.wait();
            }
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct ProcessStatus {
    pub pid: Option<u32>,
    pub running: bool,
}

impl Drop for ProcessManager {
    fn drop(&mut self) {
        self.stop_all();
    }
}
