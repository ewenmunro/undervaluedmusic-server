const express = require("express");
const router = express.Router();
const Music = require("../models/Music");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");
const config = require("../config");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email,
    pass: config.password,
  },
});

// Route to check if a music already exists
router.get("/checkmusic", async (req, res) => {
  try {
    const { title, artist } = req.query;

    // Find a music with the same title and artist in the database
    const existingMusic = await Music.findByTitleAndArtist(title, artist);

    if (existingMusic) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to check if the music exists" });
  }
});

// Route to create a new music and send email for review
router.post("/reviewmusic", authMiddleware, async (req, res) => {
  try {
    const { title, album, artist } = req.body;
    const user = req.user;

    // Create a new music object
    const music = { title, album, artist };

    // Send email for review with user's email address
    await sendReviewEmail(music, user);

    res.status(201).json({ message: "Music details sent for review" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send music details for review" });
  }
});

// Function to send review email
async function sendReviewEmail(music, user) {
  try {
    // Convert title and album to lowercase, and replace spaces with dashes
    const formattedTitle = encodeURIComponent(
      music.title.toLowerCase().replace(/\s+/g, "-")
    );

    const formattedAlbum = encodeURIComponent(
      music.album.toLowerCase().replace(/\s+/g, "-")
    );

    const formattedArtist = encodeURIComponent(
      music.artist.toLowerCase().replace(/\s+/g, "-")
    );

    // Email content
    const emailContent = `
      User Details:
      User ID: ${user.user_id}

      Music Details:
      Title: ${music.title}
      Album: ${music.album}
      Artist: ${music.artist}

      Master Add Music:
      https://www.undervaluedmusic.com/master/addmusic/${formattedTitle}/${formattedAlbum}/${formattedArtist}/${user.user_id}
    `;

    // Email options
    const mailOptions = {
      from: config.email,
      to: config.email,
      subject: "Music Review Request",
      text: emailContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending review email:", error);
    throw new Error("Failed to send review email");
  }
}

// Route to reject music details submitted by a user
router.post("/reject", authMiddleware, async (req, res) => {
  try {
    const { title, artist, userId } = req.body;

    // Retrieving Master User's details
    const masterUser = req.user;

    // Format the title: make the first letter of each word uppercase and replace dashes with spaces
    const formattedTitle = title
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Making sure the userId from the input form is an integer
    const user_id = parseInt(userId, 10);

    // Fetch user details from the database using user_id
    const user = await User.findByUserId(user_id);

    // Throw error if user is not found
    if (!user) {
      throw new Error("User not found for the given user_id.");
    }

    if (masterUser.user_id === 1) {
      // Send rejection email to the user
      await sendRejectionEmail(
        user.email,
        user.username,
        formattedTitle,
        artist
      );

      res
        .status(200)
        .json({ message: `${formattedTitle} rejected successfully` });
    } else {
      console.error("Not Master User!");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reject music" });
  }
});

// Function to send rejection email to the user
async function sendRejectionEmail(userEmail, username, musicTitle, artist) {
  try {
    // Email content
    const emailContent = `
      Hi ${username},

      Your music submission for "${musicTitle} by ${artist}" has been rejected.

      If you have any questions or concerns, please contact us.

      Sincerely,
      Undervalued Music
    `;

    // Email options
    const mailOptions = {
      from: config.email,
      to: userEmail,
      subject: "Music Submission Rejected",
      text: emailContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw new Error("Failed to send rejection email");
  }
}

// Route to approve music details
router.post("/addmusic", authMiddleware, async (req, res) => {
  try {
    const { title, album, artist, listen, userId } = req.body;

    // Retrieving Master User's details
    const masterUser = req.user;

    // Convert title to lowercase, and replace spaces with dashes
    const formattedTitle = encodeURIComponent(
      title.toLowerCase().replace(/\s+/g, "-")
    );

    // Making sure the userId from the input form is an integer
    const user_id = parseInt(userId, 10);

    // Fetch user details from the database using user_id
    const user = await User.findByUserId(user_id);

    if (!user) {
      throw new Error("User not found for the given user_id.");
    }

    if (masterUser.user_id === 1) {
      // Add music to the database
      await Music.create(title, album, artist, listen);

      // Send approval email to the user
      await sendApprovalEmail(
        user.email,
        user.username,
        title,
        formattedTitle,
        artist
      );

      res.status(200).json({
        message: `Music "${title}" approved and added to the database`,
      });
    } else {
      console.error("Not Master User!");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Function to send approval email to the user
async function sendApprovalEmail(
  userEmail,
  username,
  musicTitle,
  formattedMusicTitle,
  artist
) {
  try {
    // Email content
    const emailContent = `
      Dear ${username},

      Your music submission for "${musicTitle} by ${artist}" has been approved. You can view your submission here: https://www.undervaluedmusic.com/music/${formattedMusicTitle}

      Thank you for your contribution!

      Sincerely,
      Undervalued Music
    `;

    // Email options
    const mailOptions = {
      from: config.email,
      to: userEmail,
      subject: "Music Submission Approved",
      text: emailContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending approval email:", error);
    throw new Error("Failed to send approval email");
  }
}

// Route to get a list of music
router.get("/allmusic", async (req, res) => {
  try {
    // Fetch all music from the database
    const music = await Music.getAll();

    res.status(200).json({ music });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch music" });
  }
});

router.get("/musicdetails", async (req, res) => {
  try {
    const { title } = req.query;

    // Fetch music details from the database based on title
    const music = await Music.getByTitle(title);

    if (music) {
      res.status(200).json({ music });
    } else {
      res.status(404).json({ error: "Music not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch music details" });
  }
});

module.exports = router;
