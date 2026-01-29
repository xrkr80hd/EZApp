<?php
// config/database.php - Database connection
$host = getenv('EZAPP_DB_HOST') ?: 'localhost';
$dbname = getenv('EZAPP_DB_NAME') ?: 'ezbaths_portal';
$username = getenv('EZAPP_DB_USER') ?: 'root'; // Change this for production
$password = getenv('EZAPP_DB_PASS') ?: ''; // Change this for production

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    die('Database connection failed. Please contact administrator.');
}
?>
