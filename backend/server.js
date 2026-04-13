const {notFound, errorHandler } = require('./middlewares/errorMiddleware');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const { chats } = require('./data/data');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectDB = require('./config/db');
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
dotenv.config();
connectDB();
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://chat-application-smoky-seven.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const path = require("path");

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.join(__dirname, "..");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "frontend", "build")));

  app.get(/.*/, (req, res) =>
    res.sendFile(path.join(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

async function generateSmartReplies(incomingMessage) {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Generate 3 short, conversational, and natural replies to the following message. 
    Strictly format the output as a JSON array of strings. Do not include markdown formatting.
    Message: "${incomingMessage}"`;
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(text); 
  } catch (err) {
    console.error("Error generating smart replies:", err.message);
    return [];
  }
}

const io = require("socket.io")(server, {
  pingInterval: 60000,
  cors: {
    origin: allowedOrigins,
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

  socket.on("new message", async (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;
    if (!chat.users) {
      console.log("chat.users not defined");
      return;
    }

    let suggestions = [];
    if (newMessageRecieved.content && newMessageRecieved.content.trim().length > 0) {
      chat.users.forEach((user) => {
        if (user._id === newMessageRecieved.sender._id) return;
        io.to(user._id).emit("typing");
      });

      suggestions = await generateSmartReplies(newMessageRecieved.content);

      chat.users.forEach((user) => {
        if (user._id === newMessageRecieved.sender._id) return;
        io.to(user._id).emit("stop typing");
      });
    }

    const messageWithSuggestions = {
      ...newMessageRecieved,
      suggestedReplies: suggestions
    };

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      io.to(user._id).emit("message recieved", messageWithSuggestions);
    });
  });

  socket.on("delete message", (messageData) => {
    const chat = messageData.chat;
    if (!chat.users) return;
    chat.users.forEach((user) => {
      if (user._id === messageData.senderId) return;
      io.to(user._id).emit("message deleted", messageData.messageId);
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
