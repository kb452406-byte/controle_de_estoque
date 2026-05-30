<?php
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

// Usuários fixos (sem tabela — como o projeto original usava mock)
// Para adicionar mais usuários, basta inserir aqui.
const USUARIOS = [
    ['username' => 'admin',   'password' => 'admin123', 'nome' => 'Administradora'],
    ['username' => 'usuario', 'password' => '123456',   'nome' => 'Usuário Padrão'],
];

session_start();
$metodo = metodo();

// ─── POST /api/auth.php  { "acao": "login", "username": "...", "password": "..." }
if ($metodo === 'POST') {
    $b    = bodyJson();
    $acao = $b['acao'] ?? '';

    // LOGIN
    if ($acao === 'login') {
        $u = trim($b['username'] ?? '');
        $p = trim($b['password'] ?? '');

        if (!$u || !$p) erro('Preencha usuário e senha.');

        $encontrado = null;
        foreach (USUARIOS as $user) {
            if ($user['username'] === $u && $user['password'] === $p) {
                $encontrado = $user;
                break;
            }
        }

        if (!$encontrado) erro('Usuário ou senha incorretos.', 401);

        // Salva sessão server-side
        $_SESSION['auth'] = [
            'username' => $encontrado['username'],
            'nome'     => $encontrado['nome'],
            'logado_em' => date('Y-m-d H:i:s'),
        ];

        resposta([
            'username' => $encontrado['username'],
            'nome'     => $encontrado['nome'],
        ]);
    }

    // LOGOUT
    if ($acao === 'logout') {
        session_destroy();
        resposta(['mensagem' => 'Sessão encerrada.']);
    }

    erro('Ação desconhecida. Use "login" ou "logout".');
}

// ─── GET /api/auth.php  → verifica se está logado
if ($metodo === 'GET') {
    if (!empty($_SESSION['auth'])) {
        resposta($_SESSION['auth']);
    }
    erro('Não autenticado.', 401);
}

erro('Método não suportado.', 405);
