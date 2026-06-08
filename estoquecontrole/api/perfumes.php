<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!empty($data['nome']) && !empty($data['preco_venda'])) {
        try {
            $pdo->beginTransaction();

            // 1. Insert into produtos
            $sql_produto = "INSERT INTO produtos (nome, categoria, volume_ml, tipo, preco_custo, preco_venda, estoque_atual, estoque_minimo) 
                    VALUES (:nome, :categoria, :volume_ml, :tipo, :preco_custo, :preco_venda, :estoque_atual, :estoque_minimo)";
            
            $stmt_produto = $pdo->prepare($sql_produto);
            $stmt_produto->execute([
                ':nome' => $data['nome'],
                ':categoria' => 'Cuidado Corporal', // default para perfumes
                ':volume_ml' => !empty($data['volume_ml']) ? $data['volume_ml'] : null,
                ':tipo' => 'UN',
                ':preco_custo' => !empty($data['preco_custo']) ? $data['preco_custo'] : 0.00,
                ':preco_venda' => $data['preco_venda'],
                ':estoque_atual' => !empty($data['estoque_atual']) ? $data['estoque_atual'] : 0,
                ':estoque_minimo' => 5
            ]);
            
            $produto_id = $pdo->lastInsertId();

            // 2. Insert into perfumes
            $sql_perfume = "INSERT INTO perfumes (produto_id, marca, familia_olfativa, nota_topo, nota_coracao, nota_fundo, observacoes)
                    VALUES (:produto_id, :marca, :familia_olfativa, :nota_topo, :nota_coracao, :nota_fundo, :observacoes)";
            
            $stmt_perfume = $pdo->prepare($sql_perfume);
            $stmt_perfume->execute([
                ':produto_id' => $produto_id,
                ':marca' => !empty($data['marca']) ? $data['marca'] : null,
                ':familia_olfativa' => !empty($data['familia_olfativa']) ? $data['familia_olfativa'] : null,
                ':nota_topo' => !empty($data['nota_topo']) ? $data['nota_topo'] : null,
                ':nota_coracao' => !empty($data['nota_coracao']) ? $data['nota_coracao'] : null,
                ':nota_fundo' => !empty($data['nota_fundo']) ? $data['nota_fundo'] : null,
                ':observacoes' => !empty($data['observacoes']) ? $data['observacoes'] : null
            ]);

            $pdo->commit();
            echo json_encode(["success" => true, "message" => "Perfume cadastrado com sucesso!"]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Dados obrigatórios incompletos (nome, preco_venda)."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método não permitido."]);
}
?>
