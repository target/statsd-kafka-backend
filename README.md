# kafka-backend
[Etsy Statsd backend](https://github.com/etsy/statsd/blob/master/docs/backend_interface.md) for sending metrics to kafka.
This relies on posting stats data to a kafka rest proxy endpoint.

This is based on [statsd-http-backend](https://github.com/bmhatfield/statsd-http-backend), and made specific to kafka.

## Install
```
cd <your statsd install dir>
npm install git+ssh://git@github.com:target/statsd-kafka-backend.git
```

## Configuration (maybe ... config.js?)
```
{
  restProxyUrl: "http://localhost:8082/topics",
  kafkaTopic: "test-metrics-api",
  backends: [ "./node_modules/statsd-kafka-backend/kafka-backend" ]
}
```

## Run
```
bin/statsd config.js
```

## Data format

### Data posted to kafka - Example
```
{
  "records": [
    {
      "value": {
        "gauges": {
          "stats_counts.statsd.bad_lines_seen": 0,
          "stats_counts.statsd.packets_received": 63,
          "stats_counts.statsd.metrics_received": 63,
          "stats.gauges.not-configured-app.v0.api.ratios.internal_server_error": 0,
          "stats.gauges.not-configured-app.v0.gauge.response.app.v1.user.name": 504,
          "stats.gauges.not-configured-app.v0.counter.status.200.app.v1.user.name": 43479,
          "stats.gauges.not-configured-app.v0.api.all.max": 528.84,
          "stats.gauges.not-configured-app.v0.api.all.mean": 504.02,
          "stats.gauges.not-configured-app.v0.api.all.min": 500.47,
          "stats.gauges.not-configured-app.v0.api.all.stddev": 2.44,
          "stats.gauges.not-configured-app.v0.api.all.p50": 504.08,
          "stats.gauges.not-configured-app.v0.api.all.p75": 505.19,
          "stats.gauges.not-configured-app.v0.api.all.p95": 506.81,
          "stats.gauges.not-configured-app.v0.api.all.p98": 508.55,
          "stats.gauges.not-configured-app.v0.api.all.p99": 510.8,
          "stats.gauges.not-configured-app.v0.api.all.p999": 527.09,
          "stats.gauges.not-configured-app.v0.api.all.samples": 43479,
          "stats.gauges.not-configured-app.v0.api.all.m1_rate": 0,
          "stats.gauges.not-configured-app.v0.api.all.m5_rate": 0,
          "stats.gauges.not-configured-app.v0.api.all.m15_rate": 0,
          "stats.gauges.not-configured-app.v0.api.all.mean_rate": 3.28,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.max": 562.92,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.mean": 504.07,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.min": 500.44,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.stddev": 2.49,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.p50": 504.07,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.p75": 505.25,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.p95": 506.97,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.p98": 508.37,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.p99": 510.6,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.p999": 534.69,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.samples": 43479,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.m1_rate": 0,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.m5_rate": 0,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.m15_rate": 0,
          "stats.gauges.not-configured-app.v0.api.get.response-code.200.mean_rate": 3.28,
          "stats.gauges.not-configured-app.v0.api.response-code.200.max": 526.17,
          "stats.gauges.not-configured-app.v0.api.response-code.200.mean": 503.9,
          "stats.gauges.not-configured-app.v0.api.response-code.200.min": 500.43,
          "stats.gauges.not-configured-app.v0.api.response-code.200.stddev": 2.02,
          "stats.gauges.not-configured-app.v0.api.response-code.200.p50": 503.99,
          "stats.gauges.not-configured-app.v0.api.response-code.200.p75": 505.13,
          "stats.gauges.not-configured-app.v0.api.response-code.200.p95": 506.81,
          "stats.gauges.not-configured-app.v0.api.response-code.200.p98": 507.81,
          "stats.gauges.not-configured-app.v0.api.response-code.200.p99": 509.54,
          "stats.gauges.not-configured-app.v0.api.response-code.200.p999": 517.5,
          "stats.gauges.not-configured-app.v0.api.response-code.200.samples": 43479,
          "stats.gauges.not-configured-app.v0.api.response-code.200.m1_rate": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.200.m5_rate": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.200.m15_rate": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.200.mean_rate": 3.28,
          "stats.gauges.not-configured-app.v0.api.response-code.500.max": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.mean": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.min": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.stddev": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.p50": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.p75": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.p95": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.p98": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.p99": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.p999": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.samples": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.m1_rate": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.m5_rate": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.m15_rate": 0,
          "stats.gauges.not-configured-app.v0.api.response-code.500.mean_rate": 0,
          "stats.gauges.statsd.timestamp_lag": 0,
          "statsd.numStats": 0,
          "stats.statsd.kafkaStats.calculationtime": 0,
          "stats.statsd.processing_time": 0,
          "stats.statsd.kafkaStats.last_exception": 1462375567,
          "stats.statsd.kafkaStats.last_flush": 1462375587,
          "stats.statsd.kafkaStats.flush_time": 59,
          "stats.statsd.kafkaStats.flush_length": 4793
        },
        "durationUnit": "milliseconds",
        "clock": 1462375597,
        "rateUnit": "seconds"
      }
    }
  ]
}
```

### Response Format - Example
```
{
  "offsets": [
    {
      "partition": 11,
      "offset": 15,
      "error_code": null,
      "error": null
    }
  ],
  "key_schema_id": null,
  "value_schema_id": null
}
```
