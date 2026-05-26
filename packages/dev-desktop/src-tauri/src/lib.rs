mod process_manager;
mod tests;

use process_manager::ProcessManager;
use serde::{Deserialize, Serialize};
use std::fs;
use std::sync::Mutex;
use tauri::{Manager, State};

pub struct AppState {
    pub platform_port: Mutex<u16>,
    pub process_manager: ProcessManager,
}

#[derive(Serialize)]
pub struct PlatformStatus {
    pub port: u16,
    pub healthy: bool,
}

#[derive(Serialize)]
pub struct CommandResponse {
    pub status: String,
    pub error: Option<String>,
}

#[tauri::command]
pub fn get_platform_status(state: State<AppState>) -> PlatformStatus {
    let port = *state.platform_port.lock().unwrap();
    let has_process = state.process_manager.platform.lock().unwrap().is_some();
    PlatformStatus {
        port,
        healthy: has_process,
    }
}

#[tauri::command]
pub fn get_data_dir() -> String {
    dirs::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("otelverse")
        .to_string_lossy()
        .to_string()
}

#[tauri::command]
pub fn deploy_pipeline(yaml: String, state: State<AppState>, app_handle: tauri::AppHandle) -> CommandResponse {
    // Stop existing collector
    let _ = state.process_manager.stop_collector();

    // Write config to temp file
    let tmp_dir = std::env::temp_dir().join("otelverse-dev");
    if let Err(e) = fs::create_dir_all(&tmp_dir) {
        return CommandResponse { status: "error".into(), error: Some(e.to_string()) };
    }
    
    let config_path = tmp_dir.join("collector.yaml");
    if let Err(e) = fs::write(&config_path, yaml) {
        return CommandResponse { status: "error".into(), error: Some(e.to_string()) };
    }

    // Try to find otelcol-contrib
    // In dev desktop, we'll assume it's in PATH or at a specific bundle location.
    let collector_bin = "otelcol-contrib";
    
    match state.process_manager.start_collector(collector_bin, &config_path.to_string_lossy()) {
        Ok(_) => CommandResponse { status: "ok".into(), error: None },
        Err(e) => CommandResponse { status: "error".into(), error: Some(e) },
    }
}

#[tauri::command]
pub fn start_sample_app(state: State<AppState>, app_handle: tauri::AppHandle) -> CommandResponse {
    let resource_dir = app_handle.path().resource_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
    // The sample app should be in resources or next to execution dir.
    // Since it's in the repo at packages/dev-desktop/sample-app:
    // Actually wait, during dev it's in ../sample-app. We'll use an absolute path for dev if needed, or relative to current dir.
    let script_path = std::env::current_dir().unwrap().parent().unwrap().join("sample-app").join("index.js");
    
    let script = if script_path.exists() {
        script_path.to_string_lossy().to_string()
    } else {
        // Fallback for bundled version if we put it in resources
        resource_dir.join("sample-app").join("index.js").to_string_lossy().to_string()
    };

    match state.process_manager.start_sample_app(&script, "node", "http://localhost:4317") {
        Ok(_) => CommandResponse { status: "ok".into(), error: None },
        Err(e) => CommandResponse { status: "error".into(), error: Some(e) },
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            platform_port: Mutex::new(8080),
            process_manager: ProcessManager::new(),
        })
        .setup(|app| {
            let state = app.state::<AppState>();
            
            // Try to find the platform binary
            let platform_bin = std::env::current_dir().unwrap().parent().unwrap().join("dist").join("platform");
            let bin_path = if platform_bin.exists() {
                platform_bin.to_string_lossy().to_string()
            } else {
                "platform".to_string() // Fallback to PATH
            };

            let data_dir = get_data_dir();
            
            // Start the platform process
            let _ = state.process_manager.start_platform(&bin_path, 8080, &data_dir);
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_platform_status,
            get_data_dir,
            deploy_pipeline,
            start_sample_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
