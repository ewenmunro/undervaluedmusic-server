const db = require("../db"); // Import your database connection

const ListenClicks = {
  // Count listen clicks
  create: (user_id, music_id) => {
    return db.query(
      "INSERT INTO Listen_Clicks (user_id, music_id, click) VALUES ($1, $2, true) RETURNING *",
      [user_id, music_id]
    );
  },
};

module.exports = ListenClicks;
