-- Create the Music table
CREATE TABLE Music (
    music_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    album TEXT,
    artist TEXT NOT NULL,
    listen_link VARCHAR(255)
);

-- Create the Users table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    verification_token VARCHAR(255),
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Create the Ratings table
CREATE TABLE Ratings (
    rating_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    music_id INT REFERENCES Music(music_id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 10),
     -- Define a unique constraint on user_id and music_id
    CONSTRAINT unique_user_music_rating UNIQUE (user_id, music_id)
);

-- Create the Mentions table
CREATE TABLE Mentions (
    mention_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    music_id INT REFERENCES Music(music_id),
    mentioned BOOLEAN NOT NULL,
    -- Define a unique constraint on user_id and music_id
    CONSTRAINT unique_user_music_mention UNIQUE (user_id, music_id)
);


-- Create the Listen Clicks table
CREATE TABLE Listen_Clicks (
    click_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    music_id INT REFERENCES Music(music_id),
    click BOOLEAN NOT NULL DEFAULT false,
    click_timestamp TIMESTAMPTZ DEFAULT NOW()
);