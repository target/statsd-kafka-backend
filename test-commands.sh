curl -X POST -H "Content-Type: application/vnd.kafka.json.v1+json" -H "Accept: application/json" \
 --data '{"records":[{"value":{"gauges":{}}}]}' "http://localhost:8082/topics/test-metrics-api"
