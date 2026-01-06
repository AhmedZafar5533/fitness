const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

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
    console.log("Authenticated User:", user);
    req.logIn(user, (err) => {
      if (err) return next(err);
      console.log(req.user);
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

module.exports = router;
