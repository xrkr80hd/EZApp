-- =====================================
-- EZBATHS CONSULTANT PORTAL DATABASE SCHEMA
-- =====================================

CREATE DATABASE IF NOT EXISTS ezbaths_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ezbaths_portal;

-- =====================================
-- TABLE: users
-- =====================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('consultant', 'admin') DEFAULT 'consultant',
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- TABLE: schedules
-- =====================================
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    work_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    region VARCHAR(100) NOT NULL,
    notes TEXT DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT DEFAULT NULL,
    approved_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, work_date),
    INDEX idx_status (status),
    INDEX idx_work_date (work_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- TABLE: documents
-- =====================================
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    form_type VARCHAR(100) NOT NULL,
    status ENUM('draft', 'completed', 'submitted') DEFAULT 'draft',
    metadata JSON DEFAULT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_form (user_id, form_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- TABLE: appointments
-- =====================================
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    client_email VARCHAR(150) DEFAULT NULL,
    client_phone VARCHAR(20) DEFAULT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME DEFAULT NULL,
    address TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    questionnaire_data JSON DEFAULT NULL,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, appointment_date),
    INDEX idx_status (status),
    INDEX idx_appointment_date (appointment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- TABLE: appointment_photos
-- =====================================
CREATE TABLE IF NOT EXISTS appointment_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    file_order INT DEFAULT 0,
    caption TEXT DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_appointment_order (appointment_id, file_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- TABLE: exports
-- =====================================
CREATE TABLE IF NOT EXISTS exports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    export_name VARCHAR(255) NOT NULL,
    export_path VARCHAR(500) NOT NULL,
    export_type ENUM('zip', 'pdf') DEFAULT 'zip',
    file_size INT NOT NULL,
    included_items JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- TABLE: sessions (for custom session management)
-- =====================================
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT DEFAULT NULL,
    session_data TEXT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(255) DEFAULT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_last_activity (last_activity),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- TABLE: activity_log (for audit trail)
-- =====================================
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    details TEXT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_action (user_id, action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================
-- INSERT DEFAULT ADMIN USER
-- Password: Admin@123 (Change this after first login!)
-- =====================================
INSERT INTO users (name, email, password_hash, role) VALUES 
('System Administrator', 'admin@ezbaths.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- =====================================
-- STORED PROCEDURES (Optional - for complex operations)
-- =====================================

DELIMITER $$

-- Procedure to get consultant dashboard stats
CREATE PROCEDURE GetConsultantStats(IN p_user_id INT)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM appointments WHERE user_id = p_user_id AND status = 'scheduled') AS scheduled_appointments,
        (SELECT COUNT(*) FROM appointments WHERE user_id = p_user_id AND status = 'completed') AS completed_appointments,
        (SELECT COUNT(*) FROM documents WHERE user_id = p_user_id AND status = 'completed') AS completed_documents,
        (SELECT COUNT(*) FROM schedules WHERE user_id = p_user_id AND status = 'pending') AS pending_schedules;
END$$

-- Procedure to clean up old sessions
CREATE PROCEDURE CleanupOldSessions()
BEGIN
    DELETE FROM sessions WHERE last_activity < DATE_SUB(NOW(), INTERVAL 24 HOUR);
END$$

DELIMITER ;

-- =====================================
-- VIEWS (Optional - for simplified queries)
-- =====================================

-- View for pending approvals (Admin)
CREATE VIEW pending_approvals AS
SELECT 
    s.id,
    s.user_id,
    u.name AS consultant_name,
    s.work_date,
    s.start_time,
    s.end_time,
    s.region,
    s.notes,
    s.created_at
FROM schedules s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'pending'
ORDER BY s.work_date DESC, s.created_at DESC;

-- View for appointment summary
CREATE VIEW appointment_summary AS
SELECT 
    a.id,
    a.user_id,
    u.name AS consultant_name,
    a.client_name,
    a.appointment_date,
    a.appointment_time,
    a.status,
    COUNT(ap.id) AS photo_count,
    a.created_at
FROM appointments a
JOIN users u ON a.user_id = u.id
LEFT JOIN appointment_photos ap ON a.id = ap.appointment_id
GROUP BY a.id, a.user_id, u.name, a.client_name, a.appointment_date, a.appointment_time, a.status, a.created_at;

-- =====================================
-- GRANTS (Adjust for your security needs)
-- =====================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ezbaths_portal.* TO 'ezbaths_user'@'localhost' IDENTIFIED BY 'secure_password_here';
-- FLUSH PRIVILEGES;
