module.exports = {
  clientId: "nodeJS-kafka-chat",
  kafka_topic: "kafka-chat",
  brokers: ["localhost:9092"],
  connectionTimeout: 3000,
  authenticationTimeout: 1000,
  reauthenticationThreshold: 10000,
};
