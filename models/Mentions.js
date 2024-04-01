const db = require("../db"); // Import the PostgreSQL connection pool

const Mentions = {
  // Add mention to the database
  addMention: async (user_id, music_id, mentioned) => {
    try {
      const query = `
        INSERT INTO Mentions (user_id, music_id, mentioned)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, music_id)
        DO UPDATE SET mentioned = EXCLUDED.mentioned
        RETURNING *;
      `;

      const values = [user_id, music_id, mentioned];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Error adding or updating mention:", error);
      throw error;
    }
  },

  // Check if user has already mentioned a music
  checkMention: async (user_id, music_id) => {
    try {
      const query = `
        SELECT mentioned FROM Mentions
        WHERE user_id = $1 AND music_id = $2;
      `;

      const values = [user_id, music_id];
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return null; // No mention found
      }

      return result.rows[0].mentioned;
    } catch (error) {
      console.error("Failed to check mention:", error);
      throw error;
    }
  },

  // Retrieve mentions for user
  getMentionsForUser: async (user_id) => {
    try {
      const query = `
        SELECT * FROM Mentions
        WHERE user_id = $1;
      `;

      const result = await db.query(query, [user_id]);

      return result.rows;
    } catch (error) {
      console.error("Failed to fetch mentions for user:", error);
      throw error;
    }
  },

  // Retrieve not mentioned music for user
  getNotMentionedMusic: async (userId) => {
    try {
      const query = `
        SELECT music.*
        FROM music
        LEFT JOIN mentions ON music.music_id = mentions.music_id AND mentions.user_id = $1
        WHERE mentions.mentioned IS NULL;
      `;
      const values = [userId];

      const { rows } = await db.query(query, values);
      return rows;
    } catch (error) {
      console.error("Error fetching music not mentioned by the user:", error);
      throw error;
    }
  },

  // Retrieve not heard before music for user
  getNotHeardBeforeMusic: async (userId) => {
    try {
      const query = `
        SELECT music.*
        FROM music
        LEFT JOIN mentions ON music.music_id = mentions.music_id AND mentions.user_id = $1
        WHERE mentions.mentioned IS false;
      `;
      const values = [userId];

      const { rows } = await db.query(query, values);
      return rows;
    } catch (error) {
      console.error(
        "Error fetching music not heard before by the user:",
        error
      );
      throw error;
    }
  },

  // Retrieve not heard before count for the user
  getNotHeardBeforeCount: async (music_id) => {
    try {
      const query = `
        SELECT COUNT(DISTINCT user_id) AS count
        FROM mentions
        WHERE music_id = $1 AND mentioned = false;
      `;

      const result = await db.query(query, [music_id]);
      return result.rows[0].count;
    } catch (error) {
      throw error;
    }
  },

  // Retrieve heard but not rated count
  getHeardNotRatedCount: async (music_id) => {
    try {
      const query = `
        SELECT COUNT(DISTINCT m.user_id) AS count
        FROM mentions m
        LEFT JOIN ratings r ON m.user_id = r.user_id AND m.music_id = r.music_id
        WHERE m.music_id = $1 AND r.rating IS NULL;
      `;

      const values = [music_id];
      const result = await db.query(query, values);
      return result.rows[0].count;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Mentions;
