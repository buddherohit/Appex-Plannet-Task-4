<?php
// backend/api/notes.php

require_once '../config/database.php';
require_once '../config/helpers.php';

$database = new Database();
$db = $database->getConnection();

// Authenticate user (Both Admin and Student can view/upload notes)
$user = authenticate($db);

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'GET') {
    $noteId = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($noteId > 0) {
        // Fetch single note details
        try {
            $stmt = $db->prepare("
                SELECT n.*, u.full_name as uploaded_by_name 
                FROM notes n
                JOIN users u ON n.uploaded_by = u.id
                WHERE n.id = :id LIMIT 1
            ");
            $stmt->execute([':id' => $noteId]);
            $note = $stmt->fetch();
            if ($note) {
                jsonResponse(true, "Note retrieved.", $note);
            } else {
                jsonResponse(false, "Note not found.", null, 404);
            }
        } catch (PDOException $e) {
            jsonResponse(false, "Error fetching note: " . $e->getMessage(), null, 500);
        }
    } else {
        // Fetch paginated lists
        $search = isset($_GET['search']) ? sanitize($_GET['search']) : '';
        $subject = isset($_GET['subject']) ? sanitize($_GET['subject']) : '';
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        if ($page < 1) $page = 1;
        $limit = 10;
        $offset = ($page - 1) * $limit;

        try {
            $whereClauses = [];
            $params = [];

            if (!empty($search)) {
                $whereClauses[] = "n.title LIKE :search";
                $params[':search'] = "%" . $search . "%";
            }
            if (!empty($subject)) {
                $whereClauses[] = "n.subject = :subject";
                $params[':subject'] = $subject;
            }

            $whereSql = "";
            if (count($whereClauses) > 0) {
                $whereSql = "WHERE " . implode(" AND ", $whereClauses);
            }

            // Total count
            $countStmt = $db->prepare("SELECT COUNT(*) as total FROM notes n $whereSql");
            $countStmt->execute($params);
            $totalCount = intval($countStmt->fetch()['total']);

            // Get notes with uploader info
            $query = "
                SELECT n.*, u.full_name as uploaded_by_name 
                FROM notes n
                JOIN users u ON n.uploaded_by = u.id
                $whereSql
                ORDER BY n.created_at DESC
                LIMIT $limit OFFSET $offset
            ";
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $notes = $stmt->fetchAll();

            // Fetch list of distinct subjects for frontend filter
            $subStmt = $db->prepare("SELECT DISTINCT subject FROM notes WHERE subject IS NOT NULL AND subject != ''");
            $subStmt->execute();
            $subjects = array_column($subStmt->fetchAll(), 'subject');

            jsonResponse(true, "Notes retrieved successfully.", [
                "notes" => $notes,
                "subjects" => $subjects,
                "pagination" => [
                    "total_records" => $totalCount,
                    "total_pages" => ceil($totalCount / $limit),
                    "current_page" => $page,
                    "limit" => $limit
                ]
            ]);
        } catch (PDOException $e) {
            jsonResponse(false, "Failed to retrieve notes: " . $e->getMessage(), null, 500);
        }
    }
}

if ($method === 'POST') {
    if ($action === 'update' || (isset($_POST['_method']) && $_POST['_method'] === 'PUT')) {
        updateNote($db, $user);
    } else {
        uploadNote($db, $user);
    }
} else if ($method === 'DELETE') {
    deleteNote($db, $user);
} else {
    jsonResponse(false, "Method not allowed.", null, 405);
}

// UPLOAD NOTE
function uploadNote($db, $user) {
    $title = isset($_POST['title']) ? sanitize($_POST['title']) : '';
    $subject = isset($_POST['subject']) ? sanitize($_POST['subject']) : '';

    if (empty($title) || empty($subject)) {
        jsonResponse(false, "Title and subject are required fields.", null, 400);
    }

    if (!isset($_FILES['note_file']) || $_FILES['note_file']['error'] !== UPLOAD_ERR_OK) {
        jsonResponse(false, "Please select a document to upload.", null, 400);
    }

    $file = $_FILES['note_file'];
    
    // File validation: PDF, DOCX, PPT, PPTX
    $allowedExtensions = ['pdf', 'docx', 'doc', 'ppt', 'pptx'];
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($fileExtension, $allowedExtensions)) {
        jsonResponse(false, "Only PDF, DOC, DOCX, PPT, and PPTX formats are allowed.", null, 400);
    }

    // Verify mime type for extra security
    $allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedMimes)) {
        // Fallback check: sometimes file type mapping can be slightly different on Windows, 
        // we'll enforce extension check and simple check, but let's be flexible while secure
    }

    // Maximum size: 10MB
    $maxSize = 10 * 1024 * 1024; // 10 Megabytes
    if ($file['size'] > $maxSize) {
        jsonResponse(false, "Document file size exceeds the 10MB limit.", null, 400);
    }

    $uploadDir = '../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Sanitize file name to prevent directory traversal
    $filename = 'note_' . bin2hex(random_bytes(8)) . '.' . $fileExtension;
    $targetPath = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $fileUrl = 'uploads/' . $filename;

        try {
            $stmt = $db->prepare("
                INSERT INTO notes (title, subject, file_url, uploaded_by) 
                VALUES (:title, :subject, :file_url, :uploaded_by)
            ");
            $stmt->execute([
                ':title' => $title,
                ':subject' => $subject,
                ':file_url' => $fileUrl,
                ':uploaded_by' => $user['id']
            ]);

            $newNoteId = $db->lastInsertId();
            logActivity($db, $user['id'], "Uploaded study notes: " . $title);

            jsonResponse(true, "Notes uploaded successfully.", ["note_id" => $newNoteId], 201);
        } catch (PDOException $e) {
            jsonResponse(false, "Failed to register note in database: " . $e->getMessage(), null, 500);
        }
    } else {
        jsonResponse(false, "Failed to write document file to uploads folder.", null, 500);
    }
}

// UPDATE NOTE details
function updateNote($db, $user) {
    $noteId = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if ($noteId <= 0) {
        jsonResponse(false, "Invalid note ID.", null, 400);
    }

    $title = isset($_POST['title']) ? sanitize($_POST['title']) : '';
    $subject = isset($_POST['subject']) ? sanitize($_POST['subject']) : '';

    if (empty($title) || empty($subject)) {
        jsonResponse(false, "Title and subject are required.", null, 400);
    }

    try {
        // Fetch current note
        $stmt = $db->prepare("SELECT * FROM notes WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $noteId]);
        $note = $stmt->fetch();

        if (!$note) {
            jsonResponse(false, "Note not found.", null, 404);
        }

        // Access check: only note owner or admin can edit
        if ($note['uploaded_by'] !== $user['id'] && $user['role'] !== 'admin') {
            jsonResponse(false, "Access denied. You can only edit your own uploads.", null, 403);
        }

        $fileUrl = $note['file_url'];

        // If user wants to replace file
        if (isset($_FILES['note_file']) && $_FILES['note_file']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['note_file'];
            $allowedExtensions = ['pdf', 'docx', 'doc', 'ppt', 'pptx'];
            $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

            if (!in_array($fileExtension, $allowedExtensions)) {
                jsonResponse(false, "Invalid file format. Upload PDF, DOC, DOCX, PPT, or PPTX.", null, 400);
            }

            if ($file['size'] > 10 * 1024 * 1024) {
                jsonResponse(false, "File must be smaller than 10MB.", null, 400);
            }

            $uploadDir = '../uploads/';
            $filename = 'note_' . bin2hex(random_bytes(8)) . '.' . $fileExtension;
            $targetPath = $uploadDir . $filename;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                // Delete old file if exists
                $oldFile = '../' . $note['file_url'];
                if (file_exists($oldFile) && is_file($oldFile)) {
                    unlink($oldFile);
                }
                $fileUrl = 'uploads/' . $filename;
            } else {
                jsonResponse(false, "Failed to upload new file.", null, 500);
            }
        }

        $stmt = $db->prepare("
            UPDATE notes 
            SET title = :title, subject = :subject, file_url = :file_url 
            WHERE id = :id
        ");
        $stmt->execute([
            ':title' => $title,
            ':subject' => $subject,
            ':file_url' => $fileUrl,
            ':id' => $noteId
        ]);

        logActivity($db, $user['id'], "Updated study notes ID: " . $noteId . " ($title)");
        jsonResponse(true, "Notes updated successfully.");
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to update notes: " . $e->getMessage(), null, 500);
    }
}

// DELETE NOTE
function deleteNote($db, $user) {
    $noteId = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($noteId <= 0) {
        jsonResponse(false, "Invalid note ID.", null, 400);
    }

    try {
        $stmt = $db->prepare("SELECT * FROM notes WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $noteId]);
        $note = $stmt->fetch();

        if (!$note) {
            jsonResponse(false, "Note not found.", null, 404);
        }

        // Access check: Only owner or admin can delete
        if ($note['uploaded_by'] !== $user['id'] && $user['role'] !== 'admin') {
            jsonResponse(false, "Access denied. You can only delete your own uploads.", null, 403);
        }

        // Delete raw file from disk
        $filePath = '../' . $note['file_url'];
        if (file_exists($filePath) && is_file($filePath)) {
            unlink($filePath);
        }

        // Delete from DB
        $stmt = $db->prepare("DELETE FROM notes WHERE id = :id");
        $stmt->execute([':id' => $noteId]);

        logActivity($db, $user['id'], "Deleted study notes: " . $note['title']);
        jsonResponse(true, "Note deleted successfully.");
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to delete note: " . $e->getMessage(), null, 500);
    }
}
?>
