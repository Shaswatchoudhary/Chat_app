const express = require('express');
const { Chat, Message, UserGroup } = require('../models/db');
const { authMiddleware } = require("../middlewares/middlewares");

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { chat_name, participants } = req.body;

        const newChat = new Chat({
            chat_name: chat_name || null
        });
        await newChat.save();

        if (participants && participants.length > 0) {
            const participantDocs = participants.map(participantId => ({
                chat_id: newChat._id,
                user_id: participantId,
            }))
            await UserGroup.insertMany(participantDocs)
        }
        res.status(201).json({ newChat })
    } catch (err) {
        res.status(500).json({ message: "Internal Server error", error: err.message })
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id).populate('participants.user_id', 'username email')
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        res.json(chat)
    } catch (err) {
        res.status(500).json({ message: "Imternal Server error", error: err.message })
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userChats = await UserGroup.find({ user_id: req.user_id }).populate('chat_id').exec();
        const chats = userChats.map(userChats => userChats.chat_id);

        res.json({ chats })
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message })
    }
})

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { chat_name } = req.body;

        const updateChat = await Chat.findByIdAndUpdate(
            req.params.id,
            { chat_name },
            { new: true, runValidators: true }
        );

        if (!updateChat) {
            return res.status(404).json({ message: "Chat not found" })
        }

        res.json(updateChat);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error ", error: err.message })
    }
})

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deletedChat = await Chat.findByIdAndDelete(req.params.id);
        if (!deletedChat) {
            return res.status(404).json({ message: "Chat not found" })
        }

       await Message.deleteMany({chat_id : req.params.id})
        await UserGroup.deleteMany({ chat_id: req.params.id });

        res.json({ message: "Chat Deleted Successfully" })
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message })
    }
})

module.exports = router