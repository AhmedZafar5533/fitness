const express = require("express");
const router = express.Router();
const { upload } = require("../config/multer");
const UserProfile = require("../models/profile.");
const User = require("../models/user");

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      name,
      age,
      weight,
      height,
      gender,
      dietType,
      dietaryRestrictions,
      allergies,
    } = req.body;

    const profileData = {
      userId,
      name,
      age,
      weight,
      height,
      gender,
      dietType,
      dietaryRestrictions: dietaryRestrictions
        ? dietaryRestrictions.split(",")
        : [],
      allergies: allergies ? allergies.split(",") : [],
    };

    if (req.file) {
      profileData.imageUrl = "http://localhost:3000/" + req.file.path;
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );
    await User.updateOne({ _id: userId }, { profileDone: true });
    res.status(200).json({
      message: "Profile saved successfully",
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to save profile",
      error: error.message,
    });
  }
});

// GET profile
router.get("/", async (req, res) => {
  try {
    const profile = await UserProfile.findOne({
      userId: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ data: profile });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/", async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      age,
      weight,
      height,
      gender,
      dietType,
      dietaryRestrictions,
      allergies,
    } = req.body;
    console.log(req.body);
    const profileData = {
      userId,
      name,
      age,
      weight,
      height,
      gender,
      dietType,
      dietaryRestrictions: dietaryRestrictions,
      allergies: allergies ,
    };

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );
    await User.updateOne({ _id: userId }, { profileDone: true });
    res.status(200).json({
      message: "Profile saved successfully",
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to save profile",
      error: error.message,
    });
  }
});

module.exports = router;
