const db = require("../db"); // Import the PostgreSQL connection pool

const Music = {
  // Find a music by title and artist
  findByTitleAndArtist: async (title, artist) => {
    try {
      const query = `
      SELECT * FROM music
      WHERE title = $1 AND artist = $2;
    `;

      const values = [title, artist];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to find music by title and artist:", error);
      throw error;
    }
  },

  // Add music to the database
  create: async (title, album, artist, listen) => {
    try {
      const query = `
        INSERT INTO music (title, album, artist, listen_link)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;

      const values = [title, album, artist, listen];
      const result = await db.query(query, values);

      return result.rows[0];
    } catch (error) {
      console.error("Failed to create music:", error);
      throw error;
    }
  },

  // Retrieve all music
  getAll: async () => {
    try {
      const query = `
        SELECT * FROM music;
      `;

      const result = await db.query(query);

      return result.rows;
    } catch (error) {
      console.error("Failed to fetch music:", error);
      throw error;
    }
  },

  // Get music details by title
  getByTitle: async (title) => {
    try {
      const query = {
        text: "SELECT * FROM music WHERE title = $1",
        values: [title],
      };

      const result = await db.query(query);

      // Return the first row if a music is found, otherwise return null
      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error("Error fetching music details:", error);
      throw error;
    }
  },
};

module.exports = Music;
