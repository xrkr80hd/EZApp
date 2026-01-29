<?php
// api/users.php - User management API
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) { @session_start(); }

require_once '../config.php';

// Auth removed: allow access without session/admin

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // List all users
        try {
            $stmt = $pdo->query("
                SELECT id, username, first_name, last_name, email, phone, 
                       is_admin, active, created_at, last_login
                FROM consultants
                ORDER BY created_at DESC
            ");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert boolean fields
            foreach ($users as &$user) {
                $user['is_admin'] = (bool)$user['is_admin'];
                $user['active'] = (bool)$user['active'];
            }
            
            echo json_encode(['success' => true, 'users' => $users]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        // Create or update user
        $data = json_decode(file_get_contents('php://input'), true);
        
        $id = $data['id'] ?? null;
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        $firstName = $data['first_name'] ?? '';
        $lastName = $data['last_name'] ?? '';
        $email = $data['email'] ?? null;
        $phone = $data['phone'] ?? null;
        $isAdmin = $data['is_admin'] ?? 0;
        $active = $data['active'] ?? 1;

        try {
            if ($id) {
                // Update existing user
                if (!empty($password)) {
                    // Update with new password
                    $passwordHash = password_hash($password, PASSWORD_BCRYPT);
                    $stmt = $pdo->prepare("
                        UPDATE consultants 
                        SET username = ?, password_hash = ?, first_name = ?, last_name = ?, 
                            email = ?, phone = ?, is_admin = ?, active = ?
                        WHERE id = ?
                    ");
                    $stmt->execute([$username, $passwordHash, $firstName, $lastName, $email, $phone, $isAdmin, $active, $id]);
                } else {
                    // Update without changing password
                    $stmt = $pdo->prepare("
                        UPDATE consultants 
                        SET username = ?, first_name = ?, last_name = ?, 
                            email = ?, phone = ?, is_admin = ?, active = ?
                        WHERE id = ?
                    ");
                    $stmt->execute([$username, $firstName, $lastName, $email, $phone, $isAdmin, $active, $id]);
                }
                
                echo json_encode(['success' => true, 'message' => 'User updated successfully']);
            } else {
                // Create new user
                if (empty($password)) {
                    echo json_encode(['success' => false, 'message' => 'Password is required for new users']);
                    exit;
                }
                
                $passwordHash = password_hash($password, PASSWORD_BCRYPT);
                $stmt = $pdo->prepare("
                    INSERT INTO consultants (username, password_hash, first_name, last_name, email, phone, is_admin, active)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([$username, $passwordHash, $firstName, $lastName, $email, $phone, $isAdmin, $active]);
                
                echo json_encode(['success' => true, 'message' => 'User created successfully', 'id' => $pdo->lastInsertId()]);
            }
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                echo json_encode(['success' => false, 'message' => 'Username already exists']);
            } else {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
        }
        break;

    case 'DELETE':
        // Delete user
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'User ID is required']);
            exit;
        }

        // Prevent deleting yourself
        if ($id == $_SESSION['consultant_id']) {
            echo json_encode(['success' => false, 'message' => 'You cannot delete your own account']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM consultants WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
