<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
    exit();
}

$name = isset($input['name']) ? trim($input['name']) : '';
$jurusan = isset($input['jurusan']) ? trim($input['jurusan']) : '';
$category = isset($input['category']) ? trim($input['category']) : '';
$message = isset($input['message']) ? trim($input['message']) : '';

if (empty($name) || empty($jurusan) || empty($category) || empty($message)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "All fields are required (name, jurusan, category, message)"]);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO `aspirations` (`name`, `jurusan`, `category`, `message`, `status`) VALUES (?, ?, ?, ?, 'pending')");
    $stmt->execute([$name, $jurusan, $category, $message]);
    
    echo json_encode([
        "status" => "success",
        "message" => "Aspiration letter successfully submitted!"
    ]);
    exit();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database insertion failed: " . $e->getMessage()]);
    exit();
}
