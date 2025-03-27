-- Database schema for Workshop Honolulu BJJ Technique Library

-- Create database
CREATE DATABASE IF NOT EXISTS workshop_bjj;
USE workshop_bjj;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hashed password
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  profile_picture VARCHAR(255),
  role ENUM('member', 'admin') DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  membership_type ENUM('monthly', 'quarterly', 'annual') NOT NULL,
  payment_info JSON, -- Store payment information
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Belt levels
CREATE TABLE IF NOT EXISTS belt_levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL, -- white, blue, purple, brown, black
  order_rank INT NOT NULL, -- For sorting purposes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Techniques table
CREATE TABLE IF NOT EXISTS techniques (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(255) NOT NULL,
  thumbnail_url VARCHAR(255),
  category_id INT,
  belt_level_id INT,
  position VARCHAR(100), -- e.g., "Guard", "Mount", "Side Control"
  instructor VARCHAR(100) DEFAULT 'Larry Hope',
  difficulty_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (belt_level_id) REFERENCES belt_levels(id)
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Technique tags (many-to-many)
CREATE TABLE IF NOT EXISTS technique_tags (
  technique_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (technique_id, tag_id),
  FOREIGN KEY (technique_id) REFERENCES techniques(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- User favorites (many-to-many)
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id INT NOT NULL,
  technique_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, technique_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (technique_id) REFERENCES techniques(id) ON DELETE CASCADE
);

-- User notes on techniques
CREATE TABLE IF NOT EXISTS user_notes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  technique_id INT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (technique_id) REFERENCES techniques(id) ON DELETE CASCADE
);

-- User technique progress
CREATE TABLE IF NOT EXISTS user_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  technique_id INT NOT NULL,
  status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
  last_viewed TIMESTAMP,
  progress_percentage INT DEFAULT 0, -- 0-100
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (technique_id) REFERENCES techniques(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_technique (user_id, technique_id)
);

-- Initial data inserts
INSERT INTO belt_levels (name, order_rank) VALUES 
  ('White', 1),
  ('Blue', 2),
  ('Purple', 3),
  ('Brown', 4),
  ('Black', 5);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('Guard Passes', 'Techniques for passing the guard position'),
  ('Submissions', 'Finishing techniques like chokes and joint locks'),
  ('Sweeps', 'Techniques to reverse positions from bottom to top'),
  ('Escapes', 'Ways to escape from inferior positions'),
  ('Takedowns', 'Techniques to bring opponent to the ground');