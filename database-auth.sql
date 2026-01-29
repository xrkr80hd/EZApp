-- =====================================
-- EZBATHS CONSULTANT PORTAL - AUTH SYSTEM
-- Add to existing database.sql
-- =====================================

-- CREATE CONSULTANTS TABLE
CREATE TABLE IF NOT EXISTS consultants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT NULL,
    INDEX idx_username (username),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NOTE: No default user credentials are included.
-- To create an initial admin, generate a hash with: password_hash('YourInitialPasswordHere', PASSWORD_BCRYPT)
INSERT INTO consultants (username, password_hash, first_name, last_name, is_admin, active) VALUES
('<YOUR_USERNAME>', '$2y$10$YourHashWillGoHere', 'First', 'Last', 1, 1);

-- Note: The actual password hash for '@EZBath2025!' will be generated when you run this SQL
-- You can generate it in PHP with: echo password_hash('@EZBath2025!', PASSWORD_BCRYPT);

-- CREATE SESSIONS TABLE (optional, for tracking active sessions)
CREATE TABLE IF NOT EXISTS consultant_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consultant_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_consultant (consultant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
