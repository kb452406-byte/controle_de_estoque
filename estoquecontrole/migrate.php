<?php
require_once './config/database.php';

try {
    // Tenta adicionar a coluna preco_custo (MySQL antigo não suporta IF NOT EXISTS no ALTER TABLE diretamente para colunas de forma simples sem procedures, então vamos tentar e ignorar o erro de duplicação se houver)
    try {
        $pdo->exec("ALTER TABLE produtos ADD COLUMN preco_custo DECIMAL(10,2) DEFAULT 0.00 AFTER preco_venda");
        echo "Coluna preco_custo adicionada.\n";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') {
            echo "Coluna preco_custo já existe.\n";
        } else {
            throw $e;
        }
    }

    $sql = "
    CREATE TABLE IF NOT EXISTS perfumes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        produto_id INT NOT NULL,
        marca VARCHAR(255),
        familia_olfativa VARCHAR(255),
        nota_topo VARCHAR(255),
        nota_coracao VARCHAR(255),
        nota_fundo VARCHAR(255),
        observacoes TEXT,
        FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    
    $pdo->exec($sql);
    echo "Tabela perfumes criada/verificada com sucesso!\n";
    
} catch (PDOException $e) {
    echo "Erro na migracao: " . $e->getMessage() . "\n";
}
?>
