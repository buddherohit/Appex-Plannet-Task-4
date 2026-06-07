<?php
// backend/config/helpers.php

// 1. CORS Headers Setup
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Parse Raw JSON request body
function getJsonInput() {
    $raw = file_get_contents("php://input");
    return json_decode($raw, true) ?? [];
}

// 3. Output standardized JSON
function jsonResponse($success, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    $response = [
        "success" => $success,
        "message" => $message
    ];
    if ($data !== null) {
        $response["data"] = $data;
    }
    echo json_encode($response);
    exit;
}

// 4. Sanitize inputs to prevent XSS
function sanitize($data) {
    if (is_array($data)) {
        return array_map('sanitize', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// 5. Create activity log entry
function logActivity($conn, $userId, $action) {
    try {
        $stmt = $conn->prepare("INSERT INTO activity_logs (user_id, action) VALUES (:user_id, :action)");
        $stmt->execute([
            ':user_id' => $userId,
            ':action' => $action
        ]);
        return true;
    } catch (PDOException $e) {
        // Silently fail logging rather than blocking flow
        return false;
    }
}

// 6. Verify User Authentication by Session Token
function authenticate($conn, $requiredRole = null) {
    $headers = apache_request_headers();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

    if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (empty($authHeader)) {
        jsonResponse(false, "Authentication required. Authorization header missing.", null, 401);
    }

    // Parse 'Bearer <token>'
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    } else {
        jsonResponse(false, "Invalid authorization header format.", null, 401);
    }

    try {
        // Query token from database
        $stmt = $conn->prepare("
            SELECT u.id, u.full_name, u.email, u.mobile, u.role, u.profile_image, t.expires_at 
            FROM session_tokens t
            JOIN users u ON t.user_id = u.id
            WHERE t.token = :token AND t.expires_at > NOW()
            LIMIT 1
        ");
        $stmt->execute([':token' => $token]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonResponse(false, "Session expired or invalid token.", null, 401);
        }

        // Validate role access if specified
        if ($requiredRole !== null) {
            if ($requiredRole === 'admin' && $user['role'] !== 'admin') {
                jsonResponse(false, "Access denied. Admin role required.", null, 403);
            }
        }

        return $user;
    } catch (PDOException $e) {
        jsonResponse(false, "Authorization check failed: " . $e->getMessage(), null, 500);
    }
}
?>
