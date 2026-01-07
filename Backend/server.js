const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const sessionStore = require("connect-mongo");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const mealRoutes = require("./routes/mealRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
require("./config/local_auth")(passport);
dotenv.config();

const app = express();

// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: sessionStore.MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 7 * 24 * 60 * 60,
      autoRemove: "interval",
      autoRemoveInterval: 10,
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Passport
require("./config/local_auth")(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/profile", userRoutes);

// Protected Route Example
app.get("/api/dashboard", (req, res) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ message: "Unauthorized" });
  res.json({ message: `Welcome ${req.user.username}` });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
