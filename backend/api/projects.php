<?php
// backend/api/projects.php

require_once '../config/database.php';
require_once '../config/helpers.php';

$database = new Database();
$db = $database->getConnection();

// Authenticate user
$user = authenticate($db);

$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();

if ($method === 'GET') {
    $projectId = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($projectId > 0) {
        // Fetch single project
        try {
            $stmt = $db->prepare("
                SELECT p.*, u.full_name as student_name, u.email as student_email 
                FROM projects p
                JOIN users u ON p.user_id = u.id
                WHERE p.id = :id LIMIT 1
            ");
            $stmt->execute([':id' => $projectId]);
            $project = $stmt->fetch();
            if ($project) {
                jsonResponse(true, "Project retrieved.", $project);
            } else {
                jsonResponse(false, "Project not found.", null, 404);
            }
        } catch (PDOException $e) {
            jsonResponse(false, "Error fetching project: " . $e->getMessage(), null, 500);
        }
    } else {
        // Fetch paginated list
        $search = isset($_GET['search']) ? sanitize($_GET['search']) : '';
        $filterUserId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        if ($page < 1) $page = 1;
        $limit = 10;
        $offset = ($page - 1) * $limit;

        try {
            $whereClauses = [];
            $params = [];

            if (!empty($search)) {
                $whereClauses[] = "(p.title LIKE :search OR p.description LIKE :search)";
                $params[':search'] = "%" . $search . "%";
            }
            if ($filterUserId > 0) {
                $whereClauses[] = "p.user_id = :user_id";
                $params[':user_id'] = $filterUserId;
            }

            $whereSql = "";
            if (count($whereClauses) > 0) {
                $whereSql = "WHERE " . implode(" AND ", $whereClauses);
            }

            // Count total
            $countStmt = $db->prepare("SELECT COUNT(*) as total FROM projects p $whereSql");
            $countStmt->execute($params);
            $totalCount = intval($countStmt->fetch()['total']);

            // Get projects
            $query = "
                SELECT p.*, u.full_name as student_name, u.email as student_email 
                FROM projects p
                JOIN users u ON p.user_id = u.id
                $whereSql
                ORDER BY p.created_at DESC
                LIMIT $limit OFFSET $offset
            ";
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $projects = $stmt->fetchAll();

            jsonResponse(true, "Projects retrieved.", [
                "projects" => $projects,
                "pagination" => [
                    "total_records" => $totalCount,
                    "total_pages" => ceil($totalCount / $limit),
                    "current_page" => $page,
                    "limit" => $limit
                ]
            ]);
        } catch (PDOException $e) {
            jsonResponse(false, "Error fetching projects list: " . $e->getMessage(), null, 500);
        }
    }
} else if ($method === 'POST') {
    createProject($db, $user, $input);
} else if ($method === 'PUT') {
    updateProject($db, $user, $input);
} else if ($method === 'DELETE') {
    deleteProject($db, $user);
} else {
    jsonResponse(false, "Method not allowed.", null, 405);
}

// CREATE PROJECT
function createProject($db, $user, $input) {
    $title = isset($input['title']) ? sanitize($input['title']) : '';
    $description = isset($input['description']) ? sanitize($input['description']) : '';
    $githubLink = isset($input['github_link']) ? sanitize($input['github_link']) : '';
    $demoLink = isset($input['demo_link']) ? sanitize($input['demo_link']) : '';

    if (empty($title) || empty($description)) {
        jsonResponse(false, "Title and description are required.", null, 400);
    }

    try {
        $stmt = $db->prepare("
            INSERT INTO projects (title, description, github_link, demo_link, user_id) 
            VALUES (:title, :description, :github_link, :demo_link, :user_id)
        ");
        $stmt->execute([
            ':title' => $title,
            ':description' => $description,
            ':github_link' => $githubLink,
            ':demo_link' => $demoLink,
            ':user_id' => $user['id']
        ]);

        $newProjectId = $db->lastInsertId();
        logActivity($db, $user['id'], "Added showcase project: " . $title);

        jsonResponse(true, "Project added successfully.", ["project_id" => $newProjectId], 201);
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to add project: " . $e->getMessage(), null, 500);
    }
}

// UPDATE PROJECT
function updateProject($db, $user, $input) {
    $projectId = isset($input['id']) ? intval($input['id']) : 0;
    if ($projectId <= 0) {
        jsonResponse(false, "Invalid project ID.", null, 400);
    }

    $title = isset($input['title']) ? sanitize($input['title']) : '';
    $description = isset($input['description']) ? sanitize($input['description']) : '';
    $githubLink = isset($input['github_link']) ? sanitize($input['github_link']) : '';
    $demoLink = isset($input['demo_link']) ? sanitize($input['demo_link']) : '';

    if (empty($title) || empty($description)) {
        jsonResponse(false, "Title and description are required.", null, 400);
    }

    try {
        // Fetch project to verify ownership
        $stmt = $db->prepare("SELECT user_id FROM projects WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $projectId]);
        $project = $stmt->fetch();

        if (!$project) {
            jsonResponse(false, "Project not found.", null, 404);
        }

        // Ownership verify: only project owner or admin can update
        if ($project['user_id'] !== $user['id'] && $user['role'] !== 'admin') {
            jsonResponse(false, "Access denied. You can only edit your own projects.", null, 403);
        }

        $stmt = $db->prepare("
            UPDATE projects 
            SET title = :title, description = :description, github_link = :github_link, demo_link = :demo_link 
            WHERE id = :id
        ");
        $stmt->execute([
            ':title' => $title,
            ':description' => $description,
            ':github_link' => $githubLink,
            ':demo_link' => $demoLink,
            ':id' => $projectId
        ]);

        logActivity($db, $user['id'], "Updated project ID: " . $projectId . " ($title)");
        jsonResponse(true, "Project updated successfully.");
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to update project: " . $e->getMessage(), null, 500);
    }
}

// DELETE PROJECT
function deleteProject($db, $user) {
    $projectId = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($projectId <= 0) {
        jsonResponse(false, "Invalid project ID.", null, 400);
    }

    try {
        // Fetch project to check ownership
        $stmt = $db->prepare("SELECT user_id, title FROM projects WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $projectId]);
        $project = $stmt->fetch();

        if (!$project) {
            jsonResponse(false, "Project not found.", null, 404);
        }

        // Ownership verify
        if ($project['user_id'] !== $user['id'] && $user['role'] !== 'admin') {
            jsonResponse(false, "Access denied. You can only delete your own projects.", null, 403);
        }

        $stmt = $db->prepare("DELETE FROM projects WHERE id = :id");
        $stmt->execute([':id' => $projectId]);

        logActivity($db, $user['id'], "Deleted showcase project: " . $project['title']);
        jsonResponse(true, "Project deleted successfully.");
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to delete project: " . $e->getMessage(), null, 500);
    }
}
?>
