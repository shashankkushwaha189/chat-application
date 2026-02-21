const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessage,
  clearChat,
} = require("../controllers/messageControllers");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

const upload = require("../middlewares/uploadMiddleware");

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/upload").post(protect, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({
    fileUrl: `/uploads/${req.file.filename}`,
  });
});
router.route("/:messageId").delete(protect, deleteMessage);
router.route("/clear/:chatId").delete(protect, clearChat);

module.exports = router;