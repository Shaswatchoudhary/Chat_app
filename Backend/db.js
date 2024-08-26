const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        minLength: 4,
        maxLength: 15,
        match: /^[a-zA-Z0-9]+$/,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password_hash: {
        type: String,
        required: true,
        minLength: 6,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    last_seen: {
        type: Date,
        default: Date.now,
    }
});

const chatSchema = new mongoose.Schema({
    chat_name: {
        type: String,
        required: false,
        maxLength: 50,
        trim: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    last_message: {
        type: String,
        required: false,
        trim: true,
    }
});

const userGroupSchema = new mongoose.Schema({
    chat_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    joined_at: {
        type: Date,
        default: Date.now,
    }
});

const User = mongoose.model('User', userSchema);
const Chat = mongoose.model('Chat', chatSchema);
const UserGroup = mongoose.model('UserGroup', userGroupSchema);

module.exports = {
    User,
    Chat,
    UserGroup
};
