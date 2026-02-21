const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessage,
  clearChat,
} = require("../controllers/messageControllers");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/:messageId").delete(protect, deleteMessage);
router.route("/clear/:chatId").delete(protect, clearChat);

module.exports = router;