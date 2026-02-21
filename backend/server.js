const {notFound, errorHandler } = require('./middlewares/errorMiddleware');
const express = require('express');
const dotenv = require('dotenv');

const { chats } = require('./data/data');
const connectDB = require('./config/db');
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
dotenv.config();
connectDB();
const app = express();

app.use(express.json());

app.get('/',(req,res)=>{
    res.send("API is running...");
});

app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = require("socket.io")(server, {
  pingInterval: 60000,
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.emit("connected");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(`User ${userData._id} connected`);
    onlineUsers.set(socket.id, userData);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;
    if (!chat.users) {
      console.log("chat.users not defined");
      return;
    }
    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      io.to(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
    const disconnectedUser = onlineUsers.get(socket.id);
    if (disconnectedUser) {
      console.log(`User ${disconnectedUser._id} disconnected`);
      onlineUsers.delete(socket.id);
      socket.emit("user disconnected");
    }
  });
});
