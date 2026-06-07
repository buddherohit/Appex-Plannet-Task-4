<?php
// backend/api/jobs.php

require_once '../config/database.php';
require_once '../config/helpers.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();

// 1. READ (GET method is public/student authorized)
if ($method === 'GET') {
    $jobId = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($jobId > 0) {
        // Fetch single job details
        try {
            $stmt = $db->prepare("SELECT * FROM jobs WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $jobId]);
            $job = $stmt->fetch();
            if ($job) {
                jsonResponse(true, "Job details retrieved.", $job);
            } else {
                jsonResponse(false, "Job listing not found.", null, 404);
            }
        } catch (PDOException $e) {
            jsonResponse(false, "Error retrieving job details: " . $e->getMessage(), null, 500);
        }
    } else {
        // Fetch list with pagination, filters, and search
        $search = isset($_GET['search']) ? sanitize($_GET['search']) : '';
        $company = isset($_GET['company']) ? sanitize($_GET['company']) : '';
        $location = isset($_GET['location']) ? sanitize($_GET['location']) : '';
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        if ($page < 1) $page = 1;
        $limit = 10;
        $offset = ($page - 1) * $limit;

        try {
            $whereClauses = [];
            $params = [];

            if (!empty($search)) {
                $whereClauses[] = "(company_name LIKE :search OR role LIKE :search OR description LIKE :search)";
                $params[':search'] = "%" . $search . "%";
            }
            if (!empty($company)) {
                $whereClauses[] = "company_name = :company";
                $params[':company'] = $company;
            }
            if (!empty($location)) {
                $whereClauses[] = "location = :location";
                $params[':location'] = $location;
            }

            $whereSql = "";
            if (count($whereClauses) > 0) {
                $whereSql = "WHERE " . implode(" AND ", $whereClauses);
            }

            // Total count
            $countStmt = $db->prepare("SELECT COUNT(*) as total FROM jobs $whereSql");
            $countStmt->execute($params);
            $totalCount = intval($countStmt->fetch()['total']);

            // Get records
            $stmt = $db->prepare("SELECT * FROM jobs $whereSql ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
            $stmt->execute($params);
            $jobs = $stmt->fetchAll();

            // Fetch filters data: distinct companies and locations
            $compStmt = $db->prepare("SELECT DISTINCT company_name FROM jobs WHERE company_name != '' ORDER BY company_name");
            $compStmt->execute();
            $companies = array_column($compStmt->fetchAll(), 'company_name');

            $locStmt = $db->prepare("SELECT DISTINCT location FROM jobs WHERE location != '' ORDER BY location");
            $locStmt->execute();
            $locations = array_column($locStmt->fetchAll(), 'location');

            jsonResponse(true, "Job listings retrieved.", [
                "jobs" => $jobs,
                "companies" => $companies,
                "locations" => $locations,
                "pagination" => [
                    "total_records" => $totalCount,
                    "total_pages" => ceil($totalCount / $limit),
                    "current_page" => $page,
                    "limit" => $limit
                ]
            ]);
        } catch (PDOException $e) {
            jsonResponse(false, "Error fetching job listings: " . $e->getMessage(), null, 500);
        }
    }
}

// 2. WRITE/UPDATE/DELETE (Requires Admin privileges)
$user = authenticate($db, 'admin');

if ($method === 'POST') {
    createJob($db, $user, $input);
} else if ($method === 'PUT') {
    updateJob($db, $user, $input);
} else if ($method === 'DELETE') {
    deleteJob($db, $user);
} else {
    jsonResponse(false, "Method not allowed.", null, 405);
}

// CREATE JOB
function createJob($db, $user, $input) {
    $companyName = isset($input['company_name']) ? sanitize($input['company_name']) : '';
    $role = isset($input['role']) ? sanitize($input['role']) : '';
    $location = isset($input['location']) ? sanitize($input['location']) : '';
    $description = isset($input['description']) ? sanitize($input['description']) : '';
    $applicationLink = isset($input['application_link']) ? sanitize($input['application_link']) : '';

    if (empty($companyName) || empty($role) || empty($location) || empty($description) || empty($applicationLink)) {
        jsonResponse(false, "All fields are required.", null, 400);
    }

    try {
        $stmt = $db->prepare("
            INSERT INTO jobs (company_name, role, location, description, application_link) 
            VALUES (:company_name, :role, :location, :description, :application_link)
        ");
        $stmt->execute([
            ':company_name' => $companyName,
            ':role' => $role,
            ':location' => $location,
            ':description' => $description,
            ':application_link' => $applicationLink
        ]);

        $newJobId = $db->lastInsertId();
        logActivity($db, $user['id'], "Admin added job listing: " . $companyName . " - " . $role);

        jsonResponse(true, "Job listing created successfully.", ["job_id" => $newJobId], 201);
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to create job listing: " . $e->getMessage(), null, 500);
    }
}

// UPDATE JOB
function updateJob($db, $user, $input) {
    $jobId = isset($input['id']) ? intval($input['id']) : 0;
    if ($jobId <= 0) {
        jsonResponse(false, "Invalid job ID.", null, 400);
    }

    $companyName = isset($input['company_name']) ? sanitize($input['company_name']) : '';
    $role = isset($input['role']) ? sanitize($input['role']) : '';
    $location = isset($input['location']) ? sanitize($input['location']) : '';
    $description = isset($input['description']) ? sanitize($input['description']) : '';
    $applicationLink = isset($input['application_link']) ? sanitize($input['application_link']) : '';

    if (empty($companyName) || empty($role) || empty($location) || empty($description) || empty($applicationLink)) {
        jsonResponse(false, "All fields are required.", null, 400);
    }

    try {
        $stmt = $db->prepare("SELECT id FROM jobs WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $jobId]);
        if (!$stmt->fetch()) {
            jsonResponse(false, "Job listing not found.", null, 404);
        }

        $stmt = $db->prepare("
            UPDATE jobs 
            SET company_name = :company_name, role = :role, location = :location, description = :description, application_link = :application_link 
            WHERE id = :id
        ");
        $stmt->execute([
            ':company_name' => $companyName,
            ':role' => $role,
            ':location' => $location,
            ':description' => $description,
            ':application_link' => $applicationLink,
            ':id' => $jobId
        ]);

        logActivity($db, $user['id'], "Admin updated job ID: " . $jobId . " ($companyName - $role)");
        jsonResponse(true, "Job listing updated successfully.");
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to update job listing: " . $e->getMessage(), null, 500);
    }
}

// DELETE JOB
function deleteJob($db, $user) {
    $jobId = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($jobId <= 0) {
        jsonResponse(false, "Invalid job ID.", null, 400);
    }

    try {
        $stmt = $db->prepare("SELECT company_name, role FROM jobs WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $jobId]);
        $job = $stmt->fetch();

        if (!$job) {
            jsonResponse(false, "Job listing not found.", null, 404);
        }

        $stmt = $db->prepare("DELETE FROM jobs WHERE id = :id");
        $stmt->execute([':id' => $jobId]);

        logActivity($db, $user['id'], "Admin deleted job listing: " . $job['company_name'] . " - " . $job['role']);
        jsonResponse(true, "Job listing deleted successfully.");
    } catch (PDOException $e) {
        jsonResponse(false, "Failed to delete job listing: " . $e->getMessage(), null, 500);
    }
}
?>
