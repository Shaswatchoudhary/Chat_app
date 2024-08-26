const express = require(express);
const { User } = require("../models/db");
const { authMiddleware } = require("../middlewares/middlewares")

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = User.findById(req.userId).select("-password_hash");
        if (!user) {
            return req.status(404).json({ message: "User not found" })
        }
        res.json({ user })
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password_hash");
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.json({ user })
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message })
    }
})

router.put('/me', authMiddleware, async (req, res) => {
    try {
        const { username, email, firstName, lastName } = req.body;

        const user = await User.findByIdAndUpdate(
            req.userId,
            { username, email, firstName, lastName },
            { new: true, runValidators: true }
        ).select("-password_hash");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user })
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message })
    }
})

router.delete('/me', authMiddleware, async (req, res) => {
    try {
        const user = User.findByIdAndDelete(req.userId);

        if (!user) {
            return res.status(404).json({message : "User not found"});
        }

        res.json({message: "User deleted Successfully"})
    }catch(err){
        res.status(500).json({message:"Internal Server error", error:err.message})
    }
});

module.export = router;