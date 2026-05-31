<?php
// Headers obrigatórios para comunicação da API com o JavaScript
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

// ROTA GET: Retorna o Catálogo de Insumos com um alerta lógico de estoque
if ($method === 'GET') {
    try {
        try {
            // A tabela insumos usa nomes diferentes de colunas, então mapeamos no SELECT
            $stmt = $pdo->query("SELECT id, nome, categoria, quantidade_atual AS estoque_atual, tipo, preco_custo_unitario AS preco_venda, estoque_minimo, data_atualizacao, (quantidade_atual <= estoque_minimo) AS alerta_estoque FROM insumos WHERE status = 'ativo' OR status IS NULL");
            $insumos = $stmt->fetchAll();
        } catch (PDOException $e) {
            // Fallback caso a tabela antiga seja usada
            $stmt = $pdo->query("SELECT *, (estoque_atual <= estoque_minimo) AS alerta_estoque FROM insumos");
            $insumos = $stmt->fetchAll();
        }
        
        echo json_encode($insumos);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}

// ROTA POST: Cadastra um novo insumo enviado pelo JS
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!empty($data['nome']) && isset($data['preco_venda'])) {
        try {
            // Mapeia para as colunas reais da tabela insumos
            $sql = "INSERT INTO insumos (nome, categoria, tipo, preco_custo_unitario, quantidade_atual, estoque_minimo) 
                    VALUES (:nome, :categoria, :tipo, :preco_custo_unitario, :quantidade_atual, :estoque_minimo)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nome' => $data['nome'],
                ':categoria' => $data['categoria'] ?? 'Outros',
                ':tipo' => $data['tipo'] ?? 'UN',
                ':preco_custo_unitario' => $data['preco_venda'],
                ':quantidade_atual' => $data['estoque_atual'] ?? 0,
                ':estoque_minimo' => $data['estoque_minimo'] ?? 5
            ]);
            
            echo json_encode(["success" => true, "message" => "Insumo cadastrado com sucesso!"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Dados incompletos."]);
    }
}

// ROTA PUT: Atualiza um campo específico de um insumo
if ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    $data = json_decode(file_get_contents("php://input"), true);

    if ($id && !empty($data)) {
        try {
            // Monta o SET do SQL dinamicamente baseado nas chaves enviadas
            $fields = [];
            $params = [':id' => $id];
            
            foreach ($data as $key => $value) {
                // Mapeamento das variáveis JS para as colunas reais do Banco
                $coluna_banco = $key;
                if ($key === 'estoque_atual') $coluna_banco = 'quantidade_atual';
                if ($key === 'preco_venda') $coluna_banco = 'preco_custo_unitario';

                // Permite apenas chaves válidas
                if (in_array($coluna_banco, ['quantidade_atual', 'tipo', 'preco_custo_unitario', 'categoria', 'status'])) {
                    $fields[] = "$coluna_banco = :$key";
                    $params[":$key"] = $value;
                }
            }
            
            if (count($fields) > 0) {
                $sql = "UPDATE insumos SET " . implode(", ", $fields) . " WHERE id = :id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                
                echo json_encode(["success" => true, "message" => "Insumo atualizado com sucesso!"]);
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
