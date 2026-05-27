#[cfg(test)]
mod tests {
    use crate::AppState;
    use std::sync::Mutex;

    #[test]
    fn test_app_state_defaults() {
        let state = AppState {
            platform_port: Mutex::new(8080),
            platform_process: Mutex::new(None),
            collector_process: Mutex::new(None),
            sample_app_process: Mutex::new(None),
        };
        let port = state.platform_port.lock().unwrap();
        assert_eq!(*port, 8080);
    }

    #[test]
    fn test_get_data_dir() {
        let dir = crate::get_data_dir();
        assert!(!dir.is_empty());
        assert!(dir.contains("otelverse"));
    }
}
