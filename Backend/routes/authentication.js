const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/db");
const { authMiddleware } = require("../middlewares/middlewares");
const { JWT_SECRET } = require("../config")

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: " User already Exists in the database" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password_hash: hashedPassword,
        });
        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "1h" })

        res.status(201).json({ token });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid Credentials" })
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" })

        res.status(200).json({ token })
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message })
    }
})

router.post('/logout', authMiddleware, (req, res) => {
    try{
        const token = req.headers.authorization.split(' ')[1];

        res.status(200).json({message : "Logged out successfully"})
    }catch(err){
        res.status(500).json({message: "Internal server error", error:err.message})
    }
})

module.exports = router;