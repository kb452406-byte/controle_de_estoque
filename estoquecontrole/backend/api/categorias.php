<?php
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$db = getDB();
$metodo = metodo();

// GET /api/categorias.php
if ($metodo === 'GET') {
    $rows = $db->query("
        SELECT c.id, c.nome, c.criado_em,
               COUNT(p.id) AS total_produtos
          FROM categorias c
     LEFT JOIN produtos p ON p.categoria_id = c.id
      GROUP BY c.id
      ORDER BY c.nome
    ")->fetchAll();
    resposta($rows);
}

// POST /api/categorias.php  { "nome": "Sabonetes" }
if ($metodo === 'POST') {
    $body = bodyJson();
    $nome = trim($body['nome'] ?? '');
    if ($nome === '') erro('O campo "nome" é obrigatório.');

    try {
        $stmt = $db->prepare("INSERT INTO categorias (nome) VALUES (:nome)");
        $stmt->execute([':nome' => $nome]);
        $id = (int) $db->lastInsertId();
        resposta(['id' => $id, 'nome' => $nome], 201);
    } catch (PDOException $e) {
        if (str_contains($e->getMessage(), 'UNIQUE')) {
            erro('Já existe uma categoria com esse nome.');
        }
        erro('Erro ao salvar: ' . $e->getMessage(), 500);
    }
}

// PUT /api/categorias.php?id=3  { "nome": "Novo Nome" }
if ($metodo === 'PUT') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) erro('Informe o id da categoria.');
    $body = bodyJson();
    $nome = trim($body['nome'] ?? '');
    if ($nome === '') erro('O campo "nome" é obrigatório.');

    $stmt = $db->prepare("UPDATE categorias SET nome = :nome WHERE id = :id");
    $stmt->execute([':nome' => $nome, ':id' => $id]);
    if ($stmt->rowCount() === 0) erro('Categoria não encontrada.', 404);
    resposta(['id' => $id, 'nome' => $nome]);
}

// DELETE /api/categorias.php?id=3
if ($metodo === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) erro('Informe o id da categoria.');

    $stmt = $db->prepare("DELETE FROM categorias WHERE id = :id");
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) erro('Categoria não encontrada.', 404);
    resposta(['deletado' => $id]);
}

erro('Método não suportado.', 405);
