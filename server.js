const express = require("express");
const path = require("path");
const config = require("./config");

const { Kafka } = require("kafkajs");
const kafka = new Kafka(config);

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

var clients = {};

async function consumerMessages() {
  const consumer = kafka.consumer({ groupId: "queue-chat" });

  await consumer.connect();
  await consumer.subscribe({ topic: config.kafka_topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(JSON.parse(message.value.toString()));

      var payload = JSON.parse(message.value.toString());
      console.log(payload.author.toString());
      console.log(payload.message.toString());

      io.emit("chat", payload.author, payload.message);
    },
  });
}

async function producerMessage(client, msg) {
  const producer = kafka.producer();
  var data = {
    author: client,
    message: msg,
  };
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

io.on("connection", function (client) {
  client.on("join", function (name) {
    console.log("Joined: " + name);
    clients[client.id] = name;
    client.emit("update", "You have connected to the server.");
    client.broadcast.emit("update", name + " has joined the server.");
  });

  client.on("send", function (msg) {
    console.log("Message: " + msg);
    //client.broadcast.emit("chat", clients[client.id], msg);
    producerMessage(clients[client.id], msg);
  });

  client.on("disconnect", function () {
    console.log("Disconnect");
    io.emit("update", clients[client.id] + " has left the server.");
    delete clients[client.id];
  });
});

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use("/", (req, res) => {
  res.render("index.html");
});

server.listen(3000, () => {
  console.log(`> Server listening on port: 3000`);
});

consumerMessages();
