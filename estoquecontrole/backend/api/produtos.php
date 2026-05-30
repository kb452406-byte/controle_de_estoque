<?php
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';

$db = getDB();
$metodo = metodo();

// ─── GET ──────────────────────────────────────────────────────────────────────
// GET /api/produtos.php                     → todos os produtos
// GET /api/produtos.php?categoria_id=2      → por categoria
// GET /api/produtos.php?busca=floral        → busca por nome
// GET /api/produtos.php?id=5               → produto único
if ($metodo === 'GET') {

    // Produto único
    if (!empty($_GET['id'])) {
        $stmt = $db->prepare("
            SELECT p.*, c.nome AS categoria_nome
              FROM produtos p
              JOIN categorias c ON c.id = p.categoria_id
             WHERE p.id = :id
        ");
        $stmt->execute([':id' => (int) $_GET['id']]);
        $row = $stmt->fetch();
        if (!$row) erro('Produto não encontrado.', 404);
        resposta($row);
    }

    // Lista com filtros opcionais
    $where  = [];
    $params = [];

    if (!empty($_GET['categoria_id'])) {
        $where[]  = 'p.categoria_id = :categoria_id';
        $params[':categoria_id'] = (int) $_GET['categoria_id'];
    }

    if (!empty($_GET['busca'])) {
        $where[]  = "p.nome LIKE :busca";
        $params[':busca'] = '%' . $_GET['busca'] . '%';
    }

    $clausula = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $rows = $db->prepare("
        SELECT p.*, c.nome AS categoria_nome
          FROM produtos p
          JOIN categorias c ON c.id = p.categoria_id
        $clausula
         ORDER BY c.nome, p.nome
    ");
    $rows->execute($params);
    resposta($rows->fetchAll());
}

// ─── POST ─────────────────────────────────────────────────────────────────────
// { "categoria_id": 1, "nome": "Perfume X", "quantidade": 10, "unidade": "ML", "valor": "R$ 25,00", "notas": "" }
if ($metodo === 'POST') {
    $b = bodyJson();

    $categoria_id = (int) ($b['categoria_id'] ?? 0);
    $nome         = trim($b['nome']       ?? '');
    $quantidade   = (float) ($b['quantidade'] ?? 0);
    $unidade      = trim($b['unidade']    ?? 'UN');
    $valor        = trim($b['valor']      ?? '');
    $notas        = trim($b['notas']      ?? '');

    if (!$categoria_id) erro('O campo "categoria_id" é obrigatório.');
    if ($nome === '')   erro('O campo "nome" é obrigatório.');

    // Verifica se categoria existe
    $cat = $db->prepare("SELECT id FROM categorias WHERE id = :id");
    $cat->execute([':id' => $categoria_id]);
    if (!$cat->fetch()) erro('Categoria não encontrada.', 404);

    $stmt = $db->prepare("
        INSERT INTO produtos (categoria_id, nome, quantidade, unidade, valor, notas)
        VALUES (:categoria_id, :nome, :quantidade, :unidade, :valor, :notas)
    ");
    $stmt->execute([
        ':categoria_id' => $categoria_id,
        ':nome'         => $nome,
        ':quantidade'   => $quantidade,
        ':unidade'      => $unidade,
        ':valor'        => $valor,
        ':notas'        => $notas,
    ]);

    $id = (int) $db->lastInsertId();
    resposta(['id' => $id, 'nome' => $nome, 'categoria_id' => $categoria_id], 201);
}

// ─── PUT ──────────────────────────────────────────────────────────────────────
// PUT /api/produtos.php?id=5
if ($metodo === 'PUT') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) erro('Informe o id do produto.');
    $b = bodyJson();

    // Campos permitidos para atualização
    $campos  = [];
    $params  = [':id' => $id];

    if (isset($b['nome']))         { $campos[] = 'nome = :nome';               $params[':nome']         = trim($b['nome']); }
    if (isset($b['quantidade']))   { $campos[] = 'quantidade = :quantidade';   $params[':quantidade']   = (float) $b['quantidade']; }
    if (isset($b['unidade']))      { $campos[] = 'unidade = :unidade';         $params[':unidade']      = trim($b['unidade']); }
    if (isset($b['valor']))        { $campos[] = 'valor = :valor';             $params[':valor']        = trim($b['valor']); }
    if (isset($b['notas']))        { $campos[] = 'notas = :notas';             $params[':notas']        = trim($b['notas']); }
    if (isset($b['categoria_id'])) { $campos[] = 'categoria_id = :categoria_id'; $params[':categoria_id'] = (int) $b['categoria_id']; }

    if (!$campos) erro('Nenhum campo para atualizar.');

    $stmt = $db->prepare("UPDATE produtos SET " . implode(', ', $campos) . " WHERE id = :id");
    $stmt->execute($params);
    if ($stmt->rowCount() === 0) erro('Produto não encontrado.', 404);
    resposta(['id' => $id, 'atualizado' => true]);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
// DELETE /api/produtos.php?id=5
if ($metodo === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) erro('Informe o id do produto.');

    $stmt = $db->prepare("DELETE FROM produtos WHERE id = :id");
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) erro('Produto não encontrado.', 404);
    resposta(['deletado' => $id]);
}

erro('Método não suportado.', 405);
