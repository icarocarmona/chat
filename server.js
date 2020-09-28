const { Socket } = require("dgram");
const express = require("express");
const path = require("path");

const { Kafka } = require("kafkajs");
const config = require("./config");
const kafka = new Kafka(config);

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);


async function push(data) {
  const producer = kafka.producer();

  await producer.connect();
  await producer.send({
    topic: config.kafka_topic,
    messages: [
      {
        key: new Date().valueOf().toString(),
        value: JSON.stringify(data),
      },
    ],
  });

  await producer.disconnect();
}

//  consumer
async function consumerMessages() {
  const consumer = kafka.consumer({ groupId: "chat-test" });

  await consumer.connect();
  await consumer.subscribe({ topic: config.kafka_topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      var payload = JSON.parse(message.value.toString());
      console.log(payload.author.toString());
      console.log(payload.message.toString());
      console.log({
        value: message.value.toString(),
      });
      io.emit("receivedMessage", payload);
    },
  });
}

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use("/", (req, res) => {
  res.render("index.html");
});

let messsages = [];

io.on("connection", (socket) => {
  console.log(`Connection: ${socket.id}`);

  socket.emit("previousMessages", messsages);
  socket.on("sendMessage", (data) => {
    messsages.push(data);
    push(data).then();
    // socket.broadcast.emit("receivedMessage", data);
  });
});

server.listen(3000, () => {
  console.log(`> Server listening on port: 3000`)
})

consumerMessages();
