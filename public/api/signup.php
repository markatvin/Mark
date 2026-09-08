<?php
declare(strict_types=1);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
$email = is_array($body) ? trim((string)($body['email'] ?? '')) : '';

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Please enter a valid email address.']);
    exit;
}

$email = strtolower($email);

$dataDir = __DIR__ . '/../../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$db = new PDO('sqlite:' . $dataDir . '/signups.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec('CREATE TABLE IF NOT EXISTS signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    ip TEXT,
    created_at TEXT NOT NULL
)');

try {
    $stmt = $db->prepare('INSERT INTO signups (email, ip, created_at) VALUES (:email, :ip, :created_at)');
    $stmt->execute([
        ':email' => $email,
        ':ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ':created_at' => gmdate('c'),
    ]);

    http_response_code(201);
    echo json_encode([
        'status' => 'ok',
        'message' => "Thanks! We'll be in touch at {$email}.",
    ]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        echo json_encode([
            'status' => 'duplicate',
            'message' => "You're already on the list — we'll be in touch.",
        ]);
        exit;
    }

    http_response_code(500);
    echo json_encode(['error' => 'Something went wrong. Please try again.']);
}
