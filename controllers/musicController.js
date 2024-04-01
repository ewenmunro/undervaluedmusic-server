const Music = require("../models/Music");

// Create a new music
async function createMusic(req, res) {
  try {
    const { title, rating, heardOfBefore } = req.body;

    const music = new Music({
      title,
      rating,
      heardOfBefore,
    });

    await music.save();

    res.status(201).json({ message: "Music created successfully", music });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create music" });
  }
}

// Get a list of music
async function getMusic(req, res) {
  try {
    const music = await Music.find().sort({ rating: -1, heardOfBefore: -1 });

    res.status(200).json({ music });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch music" });
  }
}

// Rate a music
async function rateMusic(req, res) {
  try {
    const { musicId } = req.params;
    const { rating } = req.body;

    const updatedMusic = await Music.findByIdAndUpdate(
      musicId,
      { $set: { rating } },
      { new: true }
    );

    res.status(200).json({
      message: "Music rating updated successfully",
      music: updatedMusic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update music rating" });
  }
}

module.exports = {
  createMusic,
  getMusic,
  rateMusic,
};
