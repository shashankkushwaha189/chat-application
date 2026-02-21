const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const chatId = req.params.chatId;
    
    // Authorization check: verify user is a member of the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    const isUserMember = chat.users.some(userId => userId.toString() === req.user._id.toString());
    if (!isUserMember) {
      return res.status(403).json({ message: "Not authorized to view messages in this chat" });
    }

    // Pagination parameters with defaults and validation
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize) || 50));
    const skip = (page - 1) * pageSize;

    // Get total count and paginated messages with deterministic sorting
    const total = await Message.countDocuments({ chat: chatId });
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name pic email")
      .populate("chat")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(skip);

    res.json({
      messages: messages.reverse(),
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    // Authorization check: verify user is a member of the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isUserMember = chat.users.some(userId => userId.toString() === req.user._id.toString());
    if (!isUserMember) {
      return res.status(403).json({ message: "Not authorized to send message to this chat" });
    }

    var newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic email");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = { allMessages, sendMessage };