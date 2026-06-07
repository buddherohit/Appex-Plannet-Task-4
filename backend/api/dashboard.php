<?php
// backend/api/dashboard.php

require_once '../config/database.php';
require_once '../config/helpers.php';

$database = new Database();
$db = $database->getConnection();

// Authenticate user (Both student and admin can access, but dashboard details/analytics scale to role)
$user = authenticate($db);

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    jsonResponse(false, "Method not allowed.", null, 405);
}

try {
    // 1. Core counters (Admin gets global, Student gets some specific ones plus global options)
    $stats = [];
    
    // Total Students
    $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    $stats['total_students'] = intval($stmt->fetch()['count']);
    
    // Total Courses
    $stmt = $db->query("SELECT COUNT(*) as count FROM courses");
    $stats['total_courses'] = intval($stmt->fetch()['count']);
    
    // Total Notes
    $stmt = $db->query("SELECT COUNT(*) as count FROM notes");
    $stats['total_notes'] = intval($stmt->fetch()['count']);
    
    // Total Projects
    if ($user['role'] === 'admin') {
        $stmt = $db->query("SELECT COUNT(*) as count FROM projects");
    } else {
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM projects WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $user['id']]);
    }
    $stats['total_projects'] = intval($stmt->fetch()['count']);

    // Total Jobs
    $stmt = $db->query("SELECT COUNT(*) as count FROM jobs");
    $stats['total_jobs'] = intval($stmt->fetch()['count']);


    // 2. Analytics (Only relevant or detailed for Admin, but visible to both or customized)
    $analytics = [];

    // Trend: Students registered per month (last 6 months)
    $stmt = $db->query("
        SELECT DATE_FORMAT(created_at, '%b %Y') as month, COUNT(*) as count, DATE_FORMAT(created_at, '%Y-%m') as sort_date
        FROM users 
        WHERE role = 'student' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY month, sort_date
        ORDER BY sort_date ASC
    ");
    $registrations = $stmt->fetchAll();
    $analytics['registrations'] = [
        "labels" => array_column($registrations, 'month'),
        "data" => array_map('intval', array_column($registrations, 'count'))
    ];

    // Course upload breakdown: category-wise
    $stmt = $db->query("
        SELECT category, COUNT(*) as count 
        FROM courses 
        WHERE category != '' AND category IS NOT NULL
        GROUP BY category 
        ORDER BY count DESC
    ");
    $courseCats = $stmt->fetchAll();
    $analytics['courses_by_category'] = [
        "labels" => array_column($courseCats, 'category'),
        "data" => array_map('intval', array_column($courseCats, 'count'))
    ];

    // Job Posting Statistics: jobs posted per month (last 6 months)
    $stmt = $db->query("
        SELECT DATE_FORMAT(created_at, '%b %Y') as month, COUNT(*) as count, DATE_FORMAT(created_at, '%Y-%m') as sort_date
        FROM jobs 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY month, sort_date
        ORDER BY sort_date ASC
    ");
    $jobsPosted = $stmt->fetchAll();
    $analytics['jobs_posted'] = [
        "labels" => array_column($jobsPosted, 'month'),
        "data" => array_map('intval', array_column($jobsPosted, 'count'))
    ];


    // 3. Activity Logs feed
    $activity = [];
    if ($user['role'] === 'admin') {
        // Admins see all logs
        $stmt = $db->query("
            SELECT l.*, u.full_name, u.email, u.role
            FROM activity_logs l
            JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
            LIMIT 15
        ");
        $activity = $stmt->fetchAll();
    } else {
        // Students see only their own activity log
        $stmt = $db->prepare("
            SELECT l.*, u.full_name, u.email 
            FROM activity_logs l
            JOIN users u ON l.user_id = u.id
            WHERE l.user_id = :user_id
            ORDER BY l.created_at DESC
            LIMIT 10
        ");
        $stmt->execute([':user_id' => $user['id']]);
        $activity = $stmt->fetchAll();
    }

    jsonResponse(true, "Dashboard metrics retrieved successfully.", [
        "stats" => $stats,
        "analytics" => $analytics,
        "activity" => $activity
    ]);

} catch (PDOException $e) {
    jsonResponse(false, "Failed to load dashboard metrics: " . $e->getMessage(), null, 500);
}
?>
