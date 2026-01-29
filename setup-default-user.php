<?php
// setup-default-user.php
// Run this once to create a default admin user (set env vars)

// Database configuration
$host = 'localhost';
$db   = getenv('EZAPP_DB_NAME') ?: '';
$user = getenv('EZAPP_DB_USER') ?: '';
$pass = getenv('EZAPP_DB_PASS') ?: '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "✅ Database connected successfully!<br><br>";
} catch (\PDOException $e) {
    die('❌ Database connection failed: ' . $e->getMessage());
}

$username = getenv('EZAPP_DEFAULT_USER') ?: '';
$password = getenv('EZAPP_DEFAULT_PASS') ?: '';
$firstName = 'Trav';
$lastName = 'EZ Baths';
$isAdmin = 1;

// Generate password hash
$passwordHash = password_hash($password, PASSWORD_BCRYPT);

try {
    // Check if user already exists
    $checkStmt = $pdo->prepare("SELECT id FROM consultants WHERE username = ?");
    $checkStmt->execute([$username]);
    
    if ($checkStmt->fetch()) {
        echo "User already exists!\n";
        exit;
    }

    // Insert default user
    $stmt = $pdo->prepare("
        INSERT INTO consultants (username, password_hash, first_name, last_name, is_admin, active)
        VALUES (?, ?, ?, ?, ?, 1)
    ");
    
    $stmt->execute([$username, $passwordHash, $firstName, $lastName, $isAdmin]);
    
    echo "✅ Default user created successfully!\n\n";
    echo "Username: " . ($username ?: '<YOUR_USERNAME>') . "\n";
    echo "Password: " . ($password ?: '<YOUR_PASSWORD>') . "\n";
    echo "Admin: Yes\n\n";
    echo "Password hash: $passwordHash\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
