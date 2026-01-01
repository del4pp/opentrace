CREATE TABLE IF NOT EXISTS events (
    event_id String,
    bot_id String,
    user_id String,
    event_type String,
    payload String,
    timestamp DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY (bot_id, timestamp, event_id);

-- New table for high-performance web telemetry
CREATE TABLE IF NOT EXISTS telemetry (
    resource_id String,
    event_type String,
    url String,
    referrer String,
    user_agent String,
    ip String,
    screen_res String,
    lang String,
    utm_source String,
    utm_medium String,
    utm_campaign String,
    session_id String,
    payload String,
    timestamp DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY (resource_id, timestamp);

-- Dedicated logging table for system events
CREATE TABLE IF NOT EXISTS system_logs (
    level String,
    module String,
    message String,
    details String,
    timestamp DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY (timestamp, level);
