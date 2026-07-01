<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit();
}

$role = isset($_GET['role']) ? trim($_GET['role']) : '';

try {
    if ($role === 'admin') {
        // Admins can see all aspirations
        $stmt = $pdo->prepare("SELECT * FROM `aspirations` ORDER BY `created_at` DESC");
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "data" => $results
        ]);
        exit();

    } elseif ($role === 'user') {
        $name = isset($_GET['name']) ? trim($_GET['name']) : '';
        $jurusan = isset($_GET['jurusan']) ? trim($_GET['jurusan']) : '';

        if (empty($name) || empty($jurusan)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Name and Jurusan are required to fetch student history"]);
            exit();
        }

        // Students see only their own messages to see responses
        $stmt = $pdo->prepare("SELECT * FROM `aspirations` WHERE `name` = ? AND `jurusan` = ? ORDER BY `created_at` DESC");
        $stmt->execute([$name, $jurusan]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "data" => $results
        ]);
        exit();

    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid or missing role parameter"]);
        exit();
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database query failed: " . $e->getMessage()]);
    exit();
}
