<?php
// backend/api/auth.php

require_once '../config/database.php';
require_once '../config/helpers.php';

$database = new Database();
$db = $database->getConnection();

$input = getJsonInput();
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'register':
        register($db, $input);
        break;

    case 'login':
        login($db, $input);
        break;

    case 'logout':
        logout($db);
        break;

    case 'verify':
        verify($db);
        break;

    case 'forgot':
        forgotPassword($db, $input);
        break;

    case 'reset':
        resetPassword($db, $input);
        break;

    case 'update_profile':
        updateProfile($db);
        break;

    case 'change_password':
        changePassword($db, $input);
        break;

    default:
        jsonResponse(false, "Invalid auth action.", null, 400);
}

// 1. REGISTER
function register($db, $input) {
    $fullName = isset($input['full_name']) ? sanitize($input['full_name']) : '';
    $email = isset($input['email']) ? sanitize($input['email']) : '';
    $mobile = isset($input['mobile']) ? sanitize($input['mobile']) : '';
    $password = isset($input['password']) ? $input['password'] : '';

    if (empty($fullName) || empty($email) || empty($mobile) || empty($password)) {
        jsonResponse(false, "All fields are required.", null, 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(false, "Invalid email format.", null, 400);
    }

    try {
        // Check if email already exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        if ($stmt->fetch()) {
            jsonResponse(false, "Email is already registered.", null, 400);
        }

        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Insert user
        $stmt = $db->prepare("
            INSERT INTO users (full_name, email, mobile, password, role) 
            VALUES (:full_name, :email, :mobile, :password, 'student')
        ");
        $stmt->execute([
            ':full_name' => $fullName,
            ':email' => $email,
            ':mobile' => $mobile,
            ':password' => $hashedPassword
        ]);

        $newUserId = $db->lastInsertId();
        logActivity($db, $newUserId, "User registered an account");

        jsonResponse(true, "Registration successful. You can now log in.", null, 201);
    } catch (PDOException $e) {
        jsonResponse(false, "Registration failed: " . $e->getMessage(), null, 500);
    }
}

// 2. LOGIN
function login($db, $input) {
    $email = isset($input['email']) ? sanitize($input['email']) : '';
    $password = isset($input['password']) ? $input['password'] : '';

    if (empty($email) || empty($password)) {
        jsonResponse(false, "Email and password are required.", null, 400);
    }

    try {
        // Fetch user
        $stmt = $db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            jsonResponse(false, "Invalid email or password.", null, 401);
        }

        // Generate dynamic secure token
        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime('+7 days'));

        // Save token to session_tokens
        $stmt = $db->prepare("INSERT INTO session_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)");
        $stmt->execute([
            ':user_id' => $user['id'],
            ':token' => $token,
            ':expires_at' => $expiry
        ]);

        logActivity($db, $user['id'], "User logged in");

        unset($user['password']); // Protect password hash from leakage
        jsonResponse(true, "Login successful.", [
            "token" => $token,
            "user" => $user
        ]);
    } catch (PDOException $e) {
        jsonResponse(false, "Login failed: " . $e->getMessage(), null, 500);
    }
}

// 3. LOGOUT
function logout($db) {
    $user = authenticate($db);
    
    // Parse header to get raw token
    $headers = apache_request_headers();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        try {
            $stmt = $db->prepare("DELETE FROM session_tokens WHERE token = :token");
            $stmt->execute([':token' => $token]);
            logActivity($db, $user['id'], "User logged out");
            jsonResponse(true, "Logged out successfully.");
        } catch (PDOException $e) {
            jsonResponse(false, "Logout failed: " . $e->getMessage(), null, 500);
        }
    } else {
        jsonResponse(false, "No active session found.", null, 400);
    }
}

// 4. VERIFY SESSION
function verify($db) {
    $user = authenticate($db);
    jsonResponse(true, "Session valid.", ["user" => $user]);
}

// 5. FORGOT PASSWORD
function forgotPassword($db, $input) {
    $email = isset($input['email']) ? sanitize($input['email']) : '';

    if (empty($email)) {
        jsonResponse(false, "Email field is required.", null, 400);
    }

    try {
        $stmt = $db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonResponse(false, "Account with this email does not exist.", null, 404);
        }

        // Generate password reset token
        $token = bin2hex(random_bytes(16));
        $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

        // Clear existing reset tokens for this email
        $stmt = $db->prepare("DELETE FROM password_resets WHERE email = :email");
        $stmt->execute([':email' => $email]);

        // Insert new token
        $stmt = $db->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (:email, :token, :expires_at)");
        $stmt->execute([
            ':email' => $email,
            ':token' => $token,
            ':expires_at' => $expiry
        ]);

        logActivity($db, $user['id'], "Password reset requested");

        jsonResponse(true, "Password reset code generated. Use the simulated code below to complete the reset.", [
            "reset_token" => $token
        ]);
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to initiate password reset: " . $e->getMessage(), null, 500);
    }
}

// 6. RESET PASSWORD
function resetPassword($db, $input) {
    $email = isset($input['email']) ? sanitize($input['email']) : '';
    $token = isset($input['token']) ? sanitize($input['token']) : '';
    $password = isset($input['password']) ? $input['password'] : '';

    if (empty($email) || empty($token) || empty($password)) {
        jsonResponse(false, "All fields (email, token, password) are required.", null, 400);
    }

    try {
        // Validate reset token
        $stmt = $db->prepare("
            SELECT id FROM password_resets 
            WHERE email = :email AND token = :token AND expires_at > NOW() 
            LIMIT 1
        ");
        $stmt->execute([
            ':email' => $email,
            ':token' => $token
        ]);
        $resetRecord = $stmt->fetch();

        if (!$resetRecord) {
            jsonResponse(false, "Invalid or expired password reset token.", null, 400);
        }

        // Update password in users table
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $db->prepare("UPDATE users SET password = :password WHERE email = :email");
        $stmt->execute([
            ':password' => $hashedPassword,
            ':email' => $email
        ]);

        // Fetch user id for activity logs
        $stmt = $db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        // Clear all reset tokens for this email
        $stmt = $db->prepare("DELETE FROM password_resets WHERE email = :email");
        $stmt->execute([':email' => $email]);

        if ($user) {
            logActivity($db, $user['id'], "Password changed successfully via reset token");
        }

        jsonResponse(true, "Password has been reset successfully. You can now log in.");
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to reset password: " . $e->getMessage(), null, 500);
    }
}

// 7. UPDATE PROFILE
function updateProfile($db) {
    $user = authenticate($db);

    $fullName = isset($_POST['full_name']) ? sanitize($_POST['full_name']) : '';
    $mobile = isset($_POST['mobile']) ? sanitize($_POST['mobile']) : '';
    $email = isset($_POST['email']) ? sanitize($_POST['email']) : '';

    if (empty($fullName) || empty($mobile) || empty($email)) {
        jsonResponse(false, "Full name, email, and mobile number are required.", null, 400);
    }

    try {
        // Check email uniqueness if email has changed
        if ($email !== $user['email']) {
            $stmt = $db->prepare("SELECT id FROM users WHERE email = :email AND id != :id LIMIT 1");
            $stmt->execute([
                ':email' => $email,
                ':id' => $user['id']
            ]);
            if ($stmt->fetch()) {
                jsonResponse(false, "This email is already in use by another user.", null, 400);
            }
        }

        $profileImage = $user['profile_image'];

        // Process file upload if provided
        if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['profile_image'];
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            
            if (!in_array($file['type'], $allowedTypes)) {
                jsonResponse(false, "Only JPG, PNG, GIF, and WEBP image uploads are permitted.", null, 400);
            }

            if ($file['size'] > 3 * 1024 * 1024) { // 3MB limit
                jsonResponse(false, "Profile picture must be smaller than 3MB.", null, 400);
            }

            $uploadDir = '../uploads/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'profile_' . $user['id'] . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
            $targetPath = $uploadDir . $filename;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                // Delete old profile picture if exists and isn't a default placeholder
                if (!empty($user['profile_image'])) {
                    $oldFile = '../' . $user['profile_image'];
                    if (file_exists($oldFile) && is_file($oldFile)) {
                        unlink($oldFile);
                    }
                }
                $profileImage = 'uploads/' . $filename;
            } else {
                jsonResponse(false, "Failed to save profile picture.", null, 500);
            }
        }

        $stmt = $db->prepare("
            UPDATE users 
            SET full_name = :full_name, mobile = :mobile, email = :email, profile_image = :profile_image 
            WHERE id = :id
        ");
        $stmt->execute([
            ':full_name' => $fullName,
            ':mobile' => $mobile,
            ':email' => $email,
            ':profile_image' => $profileImage,
            ':id' => $user['id']
        ]);

        logActivity($db, $user['id'], "Updated profile details");

        // Fetch updated user info
        $stmt = $db->prepare("SELECT id, full_name, email, mobile, role, profile_image, created_at FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $user['id']]);
        $updatedUser = $stmt->fetch();

        jsonResponse(true, "Profile updated successfully.", ["user" => $updatedUser]);
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to update profile: " . $e->getMessage(), null, 500);
    }
}

// 8. CHANGE PASSWORD
function changePassword($db, $input) {
    $user = authenticate($db);

    $currentPassword = isset($input['current_password']) ? $input['current_password'] : '';
    $newPassword = isset($input['new_password']) ? $input['new_password'] : '';

    if (empty($currentPassword) || empty($newPassword)) {
        jsonResponse(false, "Current password and new password are required.", null, 400);
    }

    try {
        // Fetch user password hash
        $stmt = $db->prepare("SELECT password FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $user['id']]);
        $pwdRecord = $stmt->fetch();

        if (!$pwdRecord || !password_verify($currentPassword, $pwdRecord['password'])) {
            jsonResponse(false, "Your current password is incorrect.", null, 400);
        }

        // Hash and save new password
        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $stmt = $db->prepare("UPDATE users SET password = :password WHERE id = :id");
        $stmt->execute([
            ':password' => $newHash,
            ':id' => $user['id']
        ]);

        logActivity($db, $user['id'], "Changed account password");
        jsonResponse(true, "Password changed successfully.");
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to change password: " . $e->getMessage(), null, 500);
    }
}
?>
