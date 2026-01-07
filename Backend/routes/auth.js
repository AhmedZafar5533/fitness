// routes/auth.js
require("dotenv").config();
const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");
const generateEmailTemplate = require("../templates/passwordResetemail");

const JWT_RESET_KEY = process.env.JWT_RESET_KEY;


// Check authentication status
router.get("/check-auth", (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ isAuthenticated: true, data: req.user });
  }
  return res.status(401).json({ isAuthenticated: false, user: null });
});

// REGISTER
router.post("/register", async (req, res) => {
  console.log("Registration request body:", req.body);
  const { username, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ username, email, password });
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({ message: "Logged in successfully", user });
    });
  })(req, res, next);
});

// LOGOUT
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const token = jwt.sign({ id: user._id }, JWT_RESET_KEY, {
      expiresIn: "1h",
    });

    const resetLink = `${
      process.env.CLIENT_URL || "http://localhost:5173"
    }/reset-password/${token}`;

    const mailOptions = {
      from: `"FitTrack Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: generateEmailTemplate(resetLink),
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
});

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_RESET_KEY);
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = newPassword; // Use pre-save hook in model to hash
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token has expired" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
