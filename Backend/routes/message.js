const express = require("express");
const { Message, Chat } = require("../models/db");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/:chatId/messages", authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        const { chatId } = req.params;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const newMessage = new Message({
            chat_id: chatId,
            sender_id: req.userId,
            content,
        });

        await newMessage.save();

        // Update the chat's last_message field
        chat.last_message = content;
        await chat.save();

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});


router.get("/:chatId/messages", authMiddleware, async (req, res) => {
    try {
        const { chatId } = req.params;

        const messages = await Message.find({ chat_id: chatId }).sort({ created_at: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});


router.get("/:chatId/messages/:messageId", authMiddleware, async (req, res) => {
    try {
        const { chatId, messageId } = req.params;

        const message = await Message.findOne({ _id: messageId, chat_id: chatId });
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.json(message);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});


router.delete("/:chatId/messages/:messageId", authMiddleware, async (req, res) => {
    try {
        const { chatId, messageId } = req.params;

        const message = await Message.findOneAndDelete({ _id: messageId, chat_id: chatId });
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        res.json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;
