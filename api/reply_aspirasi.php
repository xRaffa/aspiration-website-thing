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

$id = isset($input['id']) ? intval($input['id']) : 0;
$reply = isset($input['reply']) ? trim($input['reply']) : '';

if ($id <= 0 || empty($reply)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Valid letter ID and non-empty reply content are required"]);
    exit();
}

try {
    // Verify the record exists
    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM `aspirations` WHERE `id` = ?");
    $checkStmt->execute([$id]);
    if ($checkStmt->fetchColumn() == 0) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Aspiration letter not found"]);
        exit();
    }

    // Update with admin reply
    $stmt = $pdo->prepare("UPDATE `aspirations` SET `reply` = ?, `replied_at` = CURRENT_TIMESTAMP, `status` = 'replied' WHERE `id` = ?");
    $stmt->execute([$reply, $id]);

    echo json_encode([
        "status" => "success",
        "message" => "Reply submitted successfully!"
    ]);
    exit();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database update failed: " . $e->getMessage()]);
    exit();
}
