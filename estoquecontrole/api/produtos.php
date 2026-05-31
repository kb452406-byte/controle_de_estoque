<?php
// Headers obrigatórios para comunicação da API com o JavaScript
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

// ROTA GET: Retorna o Catálogo de Produtos com um alerta lógico de estoque
if ($method === 'GET') {
    try {
        try {
            $stmt = $pdo->query("SELECT *, (estoque_atual <= estoque_minimo) AS alerta_estoque FROM produtos WHERE status = 'ativo' OR status IS NULL");
            $produtos = $stmt->fetchAll();
        } catch (PDOException $e) {
            // Se a coluna 'status' não existir ainda, faz a busca padrão para não quebrar o sistema
            $stmt = $pdo->query("SELECT *, (estoque_atual <= estoque_minimo) AS alerta_estoque FROM produtos");
            $produtos = $stmt->fetchAll();
        }
        
        echo json_encode($produtos);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}

// ROTA POST: Cadastra um novo produto enviado pelo JS
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!empty($data['nome']) && !empty($data['preco_venda'])) {
        try {
            $sql = "INSERT INTO produtos (nome, categoria, volume_ml, tipo, preco_venda, estoque_atual, estoque_minimo) 
                    VALUES (:nome, :categoria, :volume_ml, :tipo, :preco_venda, :estoque_atual, :estoque_minimo)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nome' => $data['nome'],
                ':categoria' => $data['categoria'] ?? 'Outros',
                ':volume_ml' => $data['volume_ml'] ?? null,
                ':tipo' => $data['tipo'] ?? 'UN',
                ':preco_venda' => $data['preco_venda'],
                ':estoque_atual' => $data['estoque_atual'] ?? 0,
                ':estoque_minimo' => $data['estoque_minimo'] ?? 5
            ]);
            
            echo json_encode(["success" => true, "message" => "Produto cadastrado com sucesso!"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Dados incompletos."]);
    }
}

// ROTA PUT: Atualiza um campo específico de um produto
if ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    $data = json_decode(file_get_contents("php://input"), true);

    if ($id && !empty($data)) {
        try {
            // Monta o SET do SQL dinamicamente baseado nas chaves enviadas
            $fields = [];
            $params = [':id' => $id];
            
            foreach ($data as $key => $value) {
                // Permite apenas chaves válidas para evitar SQL Injection
                if (in_array($key, ['nome', 'estoque_atual', 'tipo', 'status', 'categoria', 'preco_venda'])) {
                    $fields[] = "$key = :$key";
                    $params[":$key"] = $value;
                }
            }
            
            if (count($fields) > 0) {
                $sql = "UPDATE produtos SET " . implode(", ", $fields) . " WHERE id = :id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                
                echo json_encode(["success" => true, "message" => "Produto atualizado com sucesso!"]);
            } else {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Nenhum campo válido para atualizar."]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID ou dados ausentes."]);
    }
}