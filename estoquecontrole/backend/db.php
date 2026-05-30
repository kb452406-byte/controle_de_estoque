<?php
// Caminho do banco SQLite (arquivo local, sem instalação)
define('DB_PATH', __DIR__ . '/estoque.db');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO('sqlite:' . DB_PATH);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        criarTabelas($pdo);
    }
    return $pdo;
}

function criarTabelas(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS categorias (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            nome      TEXT NOT NULL UNIQUE,
            criado_em TEXT DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS produtos (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            categoria_id INTEGER NOT NULL,
            nome         TEXT    NOT NULL,
            quantidade   REAL    NOT NULL DEFAULT 0,
            unidade      TEXT    NOT NULL DEFAULT 'UN',
            valor        TEXT,
            notas        TEXT,
            criado_em    TEXT DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
        );
    ");

    // Dados iniciais se o banco estiver vazio
    $count = $pdo->query("SELECT COUNT(*) FROM categorias")->fetchColumn();
    if ($count == 0) {
        $pdo->exec("
            INSERT INTO categorias (nome) VALUES
                ('Perfumes'), ('Óleos'), ('Indústrias'), ('Cestinhas');

            INSERT INTO produtos (categoria_id, nome, quantidade, unidade) VALUES
                (1, 'Perfume Floral',    50, 'ML'),
                (1, 'Perfume Oriental',  30, 'ML'),
                (2, 'Óleo de Rosa',      20, 'ML'),
                (3, 'Fragrância Índia',  15, 'ML'),
                (4, 'Cestinha Presente', 10, 'UN');
        ");
    }
}
