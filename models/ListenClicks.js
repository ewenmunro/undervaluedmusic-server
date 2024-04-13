const db = require("../db"); // Import your database connection

const ListenClicks = {
  // Count listen clicks
  create: (user_id, music_id) => {
    return db.query(
      "INSERT INTO Listen_Clicks (user_id, music_id, click) VALUES ($1, $2, true) RETURNING *",
      [user_id, music_id]
    );
  },

  // Delete watch link clicks associate with user
  delete: async (userId) => {
    try {
      const query = "DELETE FROM listen_clicks WHERE user_id = $1";
      const values = [userId];
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = ListenClicks;
