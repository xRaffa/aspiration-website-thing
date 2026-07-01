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

$role = isset($input['role']) ? trim($input['role']) : '';

if ($role === 'user') {
    $name = isset($input['name']) ? trim($input['name']) : '';
    $jurusan = isset($input['jurusan']) ? trim($input['jurusan']) : '';

    if (empty($name) || empty($jurusan)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Name and Jurusan are required"]);
        exit();
    }

    echo json_encode([
        "status" => "success",
        "message" => "Login successful",
        "user" => [
            "name" => $name,
            "jurusan" => $jurusan,
            "role" => "user"
        ]
    ]);
    exit();

} elseif ($role === 'admin') {
    $email = isset($input['email']) ? trim($input['email']) : '';
    $password = isset($input['password']) ? trim($input['password']) : '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Email and Password are required"]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM `users` WHERE `email` = ? AND `role` = 'admin' LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            echo json_encode([
                "status" => "success",
                "message" => "Admin login successful",
                "user" => [
                    "email" => $user['email'],
                    "role" => "admin"
                ]
            ]);
            exit();
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
            exit();
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database query failed: " . $e->getMessage()]);
        exit();
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid role specified"]);
    exit();
}
