<?php
// backend/api/courses.php

require_once '../config/database.php';
require_once '../config/helpers.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. READ (GET method is public/student authorized)
if ($method === 'GET') {
    $courseId = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($courseId > 0) {
        // Fetch single course
        try {
            $stmt = $db->prepare("SELECT * FROM courses WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $courseId]);
            $course = $stmt->fetch();
            if ($course) {
                jsonResponse(true, "Course details retrieved.", $course);
            } else {
                jsonResponse(false, "Course not found.", null, 404);
            }
        } catch (PDOException $e) {
            jsonResponse(false, "Error fetching course: " . $e->getMessage(), null, 500);
        }
    } else {
        // Fetch paginated list
        $search = isset($_GET['search']) ? sanitize($_GET['search']) : '';
        $category = isset($_GET['category']) ? sanitize($_GET['category']) : '';
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        if ($page < 1) $page = 1;
        $limit = 10;
        $offset = ($page - 1) * $limit;

        try {
            // Build query dynamically
            $whereClauses = [];
            $params = [];

            if (!empty($search)) {
                $whereClauses[] = "(title LIKE :search OR description LIKE :search)";
                $params[':search'] = "%" . $search . "%";
            }
            if (!empty($category)) {
                $whereClauses[] = "category = :category";
                $params[':category'] = $category;
            }

            $whereSql = "";
            if (count($whereClauses) > 0) {
                $whereSql = "WHERE " . implode(" AND ", $whereClauses);
            }

            // Total count query
            $countStmt = $db->prepare("SELECT COUNT(*) as total FROM courses $whereSql");
            $countStmt->execute($params);
            $totalCount = intval($countStmt->fetch()['total']);

            // Fetch records query
            $stmt = $db->prepare("SELECT * FROM courses $whereSql ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
            $stmt->execute($params);
            $courses = $stmt->fetchAll();

            // Fetch list of distinct categories for filters
            $catStmt = $db->prepare("SELECT DISTINCT category FROM courses WHERE category IS NOT NULL AND category != ''");
            $catStmt->execute();
            $categories = array_column($catStmt->fetchAll(), 'category');

            jsonResponse(true, "Courses retrieved successfully.", [
                "courses" => $courses,
                "categories" => $categories,
                "pagination" => [
                    "total_records" => $totalCount,
                    "total_pages" => ceil($totalCount / $limit),
                    "current_page" => $page,
                    "limit" => $limit
                ]
            ]);
        } catch (PDOException $e) {
            jsonResponse(false, "Error fetching courses list: " . $e->getMessage(), null, 500);
        }
    }
}

// 2. WRITE/UPDATE/DELETE (Requires Admin privileges)
$user = authenticate($db, 'admin');

if ($method === 'POST') {
    // Determine if we are creating or updating (via POST method with _method override or action query param)
    if ($action === 'update' || isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
        updateCourse($db, $user);
    } else {
        createCourse($db, $user);
    }
} else if ($method === 'DELETE') {
    deleteCourse($db, $user);
} else {
    jsonResponse(false, "Method not allowed.", null, 405);
}

// CREATE COURSE
function createCourse($db, $user) {
    // Support multipart form data for file upload
    $title = isset($_POST['title']) ? sanitize($_POST['title']) : '';
    $description = isset($_POST['description']) ? sanitize($_POST['description']) : '';
    $category = isset($_POST['category']) ? sanitize($_POST['category']) : '';
    $thumbnailUrl = '';

    if (empty($title) || empty($description) || empty($category)) {
        jsonResponse(false, "Title, description, and category are required fields.", null, 400);
    }

    // Process file upload if provided
    if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
        $thumbnailUrl = handleImageUpload($_FILES['thumbnail']);
    }

    try {
        $stmt = $db->prepare("
            INSERT INTO courses (title, description, thumbnail, category) 
            VALUES (:title, :description, :thumbnail, :category)
        ");
        $stmt->execute([
            ':title' => $title,
            ':description' => $description,
            ':thumbnail' => $thumbnailUrl,
            ':category' => $category
        ]);

        $newCourseId = $db->lastInsertId();
        logActivity($db, $user['id'], "Admin created course: " . $title);

        jsonResponse(true, "Course created successfully.", ["course_id" => $newCourseId], 201);
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to create course: " . $e->getMessage(), null, 500);
    }
}

// UPDATE COURSE
function updateCourse($db, $user) {
    $courseId = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if ($courseId <= 0) {
        jsonResponse(false, "Invalid course ID for update.", null, 400);
    }

    $title = isset($_POST['title']) ? sanitize($_POST['title']) : '';
    $description = isset($_POST['description']) ? sanitize($_POST['description']) : '';
    $category = isset($_POST['category']) ? sanitize($_POST['category']) : '';

    if (empty($title) || empty($description) || empty($category)) {
        jsonResponse(false, "Title, description, and category are required fields.", null, 400);
    }

    try {
        // Fetch current course
        $stmt = $db->prepare("SELECT thumbnail FROM courses WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $courseId]);
        $course = $stmt->fetch();
        if (!$course) {
            jsonResponse(false, "Course not found.", null, 404);
        }

        $thumbnailUrl = $course['thumbnail'];

        // Process file upload if a new thumbnail is provided
        if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
            $thumbnailUrl = handleImageUpload($_FILES['thumbnail']);
        }

        $stmt = $db->prepare("
            UPDATE courses 
            SET title = :title, description = :description, thumbnail = :thumbnail, category = :category 
            WHERE id = :id
        ");
        $stmt->execute([
            ':title' => $title,
            ':description' => $description,
            ':thumbnail' => $thumbnailUrl,
            ':category' => $category,
            ':id' => $courseId
        ]);

        logActivity($db, $user['id'], "Admin updated course ID: " . $courseId . " ($title)");
        jsonResponse(true, "Course updated successfully.");
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to update course: " . $e->getMessage(), null, 500);
    }
}

// DELETE COURSE
function deleteCourse($db, $user) {
    $courseId = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($courseId <= 0) {
        jsonResponse(false, "Invalid course ID for deletion.", null, 400);
    }

    try {
        // Fetch details to log
        $stmt = $db->prepare("SELECT title FROM courses WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $courseId]);
        $course = $stmt->fetch();

        if (!$course) {
            jsonResponse(false, "Course not found.", null, 404);
        }

        $stmt = $db->prepare("DELETE FROM courses WHERE id = :id");
        $stmt->execute([':id' => $courseId]);

        logActivity($db, $user['id'], "Admin deleted course: " . $course['title']);
        jsonResponse(true, "Course deleted successfully.");
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to delete course: " . $e->getMessage(), null, 500);
    }
}

// Helper: Handle Thumbnail image uploads
function handleImageUpload($file) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $fileType = $file['type'];
    
    if (!in_array($fileType, $allowedTypes)) {
        jsonResponse(false, "Only JPG, PNG, GIF, and WEBP image uploads are permitted for course thumbnails.", null, 400);
    }

    // Max image size: 2MB for thumbnails
    if ($file['size'] > 2 * 1024 * 1024) {
        jsonResponse(false, "Course thumbnail image must be smaller than 2MB.", null, 400);
    }

    $uploadDir = '../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'thumb_' . bin2hex(random_bytes(8)) . '.' . $extension;
    $targetPath = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        return 'uploads/' . $filename;
    } else {
        jsonResponse(false, "Failed to write course thumbnail to uploads folder.", null, 500);
    }
}
?>
