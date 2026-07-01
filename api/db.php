<?php
// Set CORS headers for local development testing
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$username = 'root';
$password = '';
$port = '3306';
$dbname = 'surat_aspirasi_db';

try {
    // 1. Connect to MySQL server (without selecting DB) to create it if it doesn't exist
    $pdo = new PDO("mysql:host=$host;port=$port", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    // 2. Connect to the specific database
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create users table for Admin
    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `email` VARCHAR(100) UNIQUE NULL,
        `password` VARCHAR(255) NULL,
        `role` ENUM('admin', 'user') DEFAULT 'user',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;");

    // Create aspirations table for student letters and admin replies
    $pdo->exec("CREATE TABLE IF NOT EXISTS `aspirations` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(100) NOT NULL,
        `jurusan` VARCHAR(100) NOT NULL,
        `category` VARCHAR(50) NOT NULL,
        `message` TEXT NOT NULL,
        `reply` TEXT NULL,
        `replied_at` TIMESTAMP NULL DEFAULT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `status` ENUM('pending', 'replied') DEFAULT 'pending'
    ) ENGINE=InnoDB;");

    // Seed default admin account if not already present
    $adminEmail = 'admin@unhar.ac.id';
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM `users` WHERE `email` = ? AND `role` = 'admin'");
    $stmt->execute([$adminEmail]);
    if ($stmt->fetchColumn() == 0) {
        $adminPassword = password_hash('adminpassword123', PASSWORD_BCRYPT);
        $insertAdmin = $pdo->prepare("INSERT INTO `users` (`email`, `password`, `role`) VALUES (?, ?, 'admin')");
        $insertAdmin->execute([$adminEmail, $adminPassword]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection/initialization failed: " . $e->getMessage()
    ]);
    exit();
}
