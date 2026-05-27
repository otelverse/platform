use log::{info, error};
use rumqttc::{AsyncClient, MqttOptions, QoS, Event, Incoming};
use tokio::sync::mpsc;
use std::time::Duration;
use uuid::Uuid;
use bytes::Bytes;

use crate::db::DbCommand;

pub async fn start_mqtt_receiver(broker: String, db_tx: mpsc::Sender<DbCommand>) {
    info!("Starting MQTT receiver on broker: {}", broker);
    
    let mut mqttoptions = MqttOptions::new("otel-edge-agent", broker.clone(), 1883);
    mqttoptions.set_keep_alive(Duration::from_secs(5));

    let (client, mut eventloop) = AsyncClient::new(mqttoptions, 10);
    
    // Subscribe to telemetry topic
    client.subscribe("telemetry/traces", QoS::AtMostOnce).await.unwrap();

    loop {
        match eventloop.poll().await {
            Ok(notification) => {
                if let Event::Incoming(Incoming::Publish(publish)) = notification {
                    // Convert incoming MQTT payload to span bytes and send to DB.
                    // Assuming payload is OTLP protobuf.
                    let batch_id = Uuid::new_v4().to_string();
                    let span_bytes = Bytes::copy_from_slice(&publish.payload);
                    
                    if let Err(e) = db_tx.send(DbCommand::WriteSpan {
                        trace_id: batch_id,
                        span_bytes,
                    }).await {
                        error!("Failed to send MQTT span batch to DB task: {}", e);
                    }
                }
            }
            Err(e) => {
                error!("MQTT Eventloop error: {:?}", e);
                tokio::time::sleep(Duration::from_secs(3)).await;
            }
        }
    }
}
