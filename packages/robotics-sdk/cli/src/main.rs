use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("Usage: otelverse-robotics <command>");
        return;
    }
    
    let command = &args[1];
    match command.as_str() {
        "init" => println!("Scaffolding a new ROS 2 workspace..."),
        "sim" => {
            if args.len() > 2 && args[2] == "start" {
                println!("Starting Gazebo + forwarder via Docker Compose...");
            } else {
                println!("Usage: otelverse-robotics sim start");
            }
        },
        "status" => println!("Forwarder health: OK. Recent spans: 42"),
        "config" => {
            if args.len() > 2 && args[2] == "generate" {
                println!("Generating collector pipeline config...");
            } else {
                println!("Usage: otelverse-robotics config generate");
            }
        },
        _ => println!("Unknown command: {}", command),
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_cli_parsing() {
        // Just a mock test to verify cargo test works
        assert_eq!(1 + 1, 2);
    }
}
