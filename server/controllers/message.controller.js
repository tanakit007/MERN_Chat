const MessageModel = require("../models/Message.js");
const UserModel = require("../models/User");
const cloudinary = require("../configs/cloudinary");
require("dotenv").config();

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.file({
      _id: { $ne: loggedInUserId },
    }).select("paassword");
    res.status(200).json(filteredUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve users for sidebar" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { id: recipientId } = req.params;
    if (!recipientId) {
      return res.status(400).json({ message: "Recipient ID is required" });
    }
    const senderId = req.user._id;
    const { text, file } = req.body;
    if (text === "" && file === "") {
      return res
        .status(400)
        .json({ message: "Message text or file is required" });
    }
    const fileUrl = "";
    if (file) {
      const uploadResponse = await cloudinary.uploader.upload(file);
      fileUrl = uploadResponse.secure_url;
    }
    const newMessage = new MessageModel({
      sender: senderId,
      recipient: recipientId,
      text,
      file: fileUrl,
    });
    await newMessage.save();
    res.json({ data: newMessage, message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};
const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChat } = req.params;
    const messages = await MessageModel.find({
      $or: [
        { senderId: myId, recipient: userToChat },
        { senderId: userToChat, recipient: myId },
      ],
    });
    res.json({ data: messages });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
};

const messageController = {
  getUsersForSidebar,
};

module.exports = {
  getUsersForSidebar,
  getMessages,
  sendMessage,
};
