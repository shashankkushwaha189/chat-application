const { io } = require("socket.io-client");
const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to server...");

  socket.emit("setup", { _id: "user123" });

  const dummyMessage = {
    _id: "msg1",
    content: "how are you today?",
    chat: {
      _id: "chat123",
      users: [
        { _id: "user123" },
        { _id: "user456" }
      ]
    },
    sender: { _id: "user456" }
  };

  console.log("Sending new message...");
  socket.emit("new message", dummyMessage);
});

socket.on("message recieved", (msg) => {
  console.log("RECEIVED:", JSON.stringify(msg, null, 2));
  process.exit(0);
});

setTimeout(() => {
  console.log("Timeout");
  process.exit(1);
}, 10000);
