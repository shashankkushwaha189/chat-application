const mongoose = require('mongoose');

const messageModel = mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, trim: true },
        chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
        messageType: {
            type: String,
            enum: ["text", "audio", "video", "voice", "image"],
            default: "text",
        },
        fileUrl: { type: String },
    },
    {
        timestamps: true,
    }
);
const Message = mongoose.model("Message", messageModel);
module.exports = Message;