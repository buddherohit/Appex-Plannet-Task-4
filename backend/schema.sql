CREATE DATABASE IF NOT EXISTS `placement_portal` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `placement_portal`;

-- Drop tables if they exist to allow clean re-installation
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `session_tokens`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `notes`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `jobs`;
DROP TABLE IF EXISTS `users`;

-- 1. Users table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `mobile` VARCHAR(15) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'admin') DEFAULT 'student',
  `profile_image` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Session tokens table
CREATE TABLE `session_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token` VARCHAR(64) UNIQUE NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Password resets table
CREATE TABLE `password_resets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(150) NOT NULL,
  `token` VARCHAR(100) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Courses table
CREATE TABLE `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `thumbnail` VARCHAR(255) NULL,
  `category` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Notes table
CREATE TABLE `notes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `subject` VARCHAR(100) NOT NULL,
  `file_url` VARCHAR(255) NOT NULL,
  `uploaded_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Projects table
CREATE TABLE `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `github_link` VARCHAR(255) NULL,
  `demo_link` VARCHAR(255) NULL,
  `user_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Jobs table
CREATE TABLE `jobs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(150) NOT NULL,
  `role` VARCHAR(150) NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `application_link` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. Activity logs table
CREATE TABLE `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_session_tokens ON session_tokens(token);
CREATE INDEX idx_password_resets ON password_resets(email, token);
CREATE INDEX idx_notes_uploaded_by ON notes(uploaded_by);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);

-- Insert Default Admin User
-- Password: admin123 (bcrypt hash: $2y$10$tMh4zHnLzJj2jZ5L5E5G5exyK9yE47xH4gN6s8Kj2wF8l0oX3uKqy)
INSERT INTO `users` (`full_name`, `email`, `mobile`, `password`, `role`)
VALUES (
  'System Administrator',
  'admin@placement.com',
  '9999999999',
  '$2y$10$wK1rS2w7F8P462n6E04ZSeM3e8l89XfO3J2.4Jly81V/zMh0Kbeoe', -- '$2y$10$wK1...' is hash of 'admin123'
  'admin'
);
