<?php
// Headers para permitir que o frontend JS chame a API localmente
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responde imediatamente o preflight do navegador
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resposta(mixed $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode(['ok' => true,  'data'  => $data],  JSON_UNESCAPED_UNICODE);
    exit;
}

function erro(string $mensagem, int $status = 400): void {
    http_response_code($status);
    echo json_encode(['ok' => false, 'erro' => $mensagem], JSON_UNESCAPED_UNICODE);
    exit;
}

function bodyJson(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function metodo(): string {
    return $_SERVER['REQUEST_METHOD'];
}
