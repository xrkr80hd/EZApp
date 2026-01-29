<?php

/**
 * EZBaths Portal - Configuration File
 * 
 * Contains database connection settings and application configuration
 * 
 * IMPORTANT: Rename config.example.php to config.php and update with your settings
 */

// =====================================
// DATABASE CONFIGURATION
// =====================================
define('DB_HOST', 'localhost');
define('DB_NAME', 'xrkr80hd_ezbaths');
define('DB_USER', 'xrkr80hd_ezapp');
define('DB_PASS', 'EZBaths2025!');
define('DB_CHARSET', 'utf8mb4');

// =====================================
// APPLICATION SETTINGS
// =====================================
define('SITE_NAME', 'EZBaths Consultant Portal');
define('SITE_URL', 'http://localhost/ezbaths-portal'); // Update for production
define('BASE_PATH', __DIR__ . '/..');

// =====================================
// SESSION CONFIGURATION
// =====================================
define('SESSION_TIMEOUT', 3600); // 1 hour in seconds
define('SESSION_NAME', 'EZBATHS_SESSION');

// =====================================
// FILE UPLOAD SETTINGS
// =====================================
define('UPLOAD_MAX_SIZE', 10485760); // 10MB in bytes
define('ALLOWED_DOCUMENT_TYPES', ['pdf', 'doc', 'docx', 'xlsx', 'xls']);
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'heic']);

define('UPLOAD_PATH_DOCUMENTS', BASE_PATH . '/uploads/documents/');
define('UPLOAD_PATH_PHOTOS', BASE_PATH . '/uploads/photos/');
define('UPLOAD_PATH_EXPORTS', BASE_PATH . '/uploads/exports/');

// =====================================
// SECURITY SETTINGS
// =====================================
define('HASH_ALGO', PASSWORD_BCRYPT);
define('HASH_COST', 12);
define('CSRF_TOKEN_NAME', 'csrf_token');
define('PASSWORD_MIN_LENGTH', 8);

// =====================================
// EMAIL CONFIGURATION (for password reset)
// =====================================
define('MAIL_FROM', 'noreply@ezbaths.com');
define('MAIL_FROM_NAME', 'EZBaths Portal');
define('MAIL_HOST', getenv('EZAPP_MAIL_HOST') ?: '');
define('MAIL_PORT', intval(getenv('EZAPP_MAIL_PORT') ?: 587));
define('MAIL_USERNAME', getenv('EZAPP_MAIL_USER') ?: '');
define('MAIL_PASSWORD', getenv('EZAPP_MAIL_PASS') ?: '');
define('MAIL_ENCRYPTION', getenv('EZAPP_MAIL_ENC') ?: 'tls');

// =====================================
// TIMEZONE
// =====================================
date_default_timezone_set('America/New_York'); // Adjust as needed

// =====================================
// ERROR REPORTING (Development vs Production)
// =====================================
define('ENVIRONMENT', 'development'); // 'development' or 'production'

if (ENVIRONMENT === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', BASE_PATH . '/logs/error.log');
}

// =====================================
// PAGINATION
// =====================================
define('ITEMS_PER_PAGE', 20);

// =====================================
// DATABASE CONNECTION CLASS
// =====================================
class Database
{
    private static $instance = null;
    private $connection;

    private function __construct()
    {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_PERSISTENT         => false
            ];

            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // Log error and show generic message
            error_log("Database Connection Error: " . $e->getMessage());
            die("Database connection failed. Please contact support.");
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->connection;
    }

    // Prevent cloning of the instance
    private function __clone() {}

    // Prevent unserializing of the instance
    public function __wakeup()
    {
        throw new Exception("Cannot unserialize singleton");
    }
}

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Get database connection
 */
function getDB()
{
    return Database::getInstance()->getConnection();
}

/**
 * Redirect to a specific page
 */
function redirect($path)
{
    header("Location: " . SITE_URL . $path);
    exit;
}

/**
 * Check if user is logged in
 */
function isLoggedIn()
{
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Check if user is admin
 */
function isAdmin()
{
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

/**
 * Sanitize input data
 */
function sanitize($data)
{
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Validate email address
 */
function isValidEmail($email)
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Generate CSRF token
 */
function generateCSRFToken()
{
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}

/**
 * Verify CSRF token
 */
function verifyCSRFToken($token)
{
    return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}

/**
 * Log activity
 */
function logActivity($userId, $action, $module, $details = null)
{
    try {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO activity_log (user_id, action, module, details, ip_address) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $userId,
            $action,
            $module,
            $details,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
    } catch (Exception $e) {
        error_log("Activity logging failed: " . $e->getMessage());
    }
}

/**
 * Format date for display
 */
function formatDate($date, $format = 'M d, Y')
{
    return date($format, strtotime($date));
}

/**
 * Format file size
 */
function formatFileSize($bytes)
{
    $units = ['B', 'KB', 'MB', 'GB'];
    $i = 0;
    while ($bytes >= 1024 && $i < count($units) - 1) {
        $bytes /= 1024;
        $i++;
    }
    return round($bytes, 2) . ' ' . $units[$i];
}

/**
 * Check file extension
 */
function isAllowedFileType($filename, $allowedTypes)
{
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    return in_array($ext, $allowedTypes);
}
