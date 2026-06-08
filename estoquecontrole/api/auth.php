<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Inclui o arquivo de configuração do banco de dados onde $pdo é instanciado
require_once '../config/database.php';

// Recebe os dados do POST
$data = json_decode(file_get_contents("php://input"));

$username_input = '';
$password_input = '';

// Verifica se os dados vieram via JSON ou Formulário
$action = 'login';
if (isset($data->action)) {
    $action = $data->action;
} elseif (isset($_POST['action'])) {
    $action = $_POST['action'];
}

if (isset($data->username) && isset($data->password)) {
    $username_input = $data->username;
    $password_input = $data->password;
} elseif (isset($_POST['username']) && isset($_POST['password'])) {
    $username_input = $_POST['username'];
    $password_input = $_POST['password'];
}

if ($action === 'register') {
    $nome = $data->nome ?? $_POST['nome'] ?? '';
    $email = $data->email ?? $_POST['email'] ?? '';
    
    if (empty($nome) || empty($username_input) || empty($password_input)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Todos os campos obrigatórios devem ser preenchidos."]);
        exit;
    }

    try {
        // Verifica se o usuário já existe
        $check = $pdo->prepare("SELECT id FROM usuarios WHERE username = :username");
        $check->bindParam(':username', $username_input);
        $check->execute();

        if ($check->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Usuário já existe."]);
            exit;
        }

        // Insere o novo usuário
        $query = "INSERT INTO usuarios (nome, username, email, password) VALUES (:nome, :username, :email, :password)";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':nome', $nome);
        $stmt->bindParam(':username', $username_input);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password_input);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Cadastro realizado com sucesso."]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Erro ao cadastrar usuário."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Erro no servidor: " . $e->getMessage()]);
    }
    exit;
}

// Verifica se os campos estão vazios
if (empty($username_input) || empty($password_input)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Usuário e senha são obrigatórios."]);
    exit;
}

try {
    // Busca o usuário no banco de dados usando o $pdo do database.php
    $query = "SELECT id, username, password, nome FROM usuarios WHERE username = :username LIMIT 1";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':username', $username_input);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch();

        if ($password_input === $row['password']) {
            // Login bem sucedido
            echo json_encode([
                "success" => true,
                "message" => "Login realizado com sucesso.",
                "userData" => [
                    "id" => $row['id'],
                    "username" => $row['username'],
                    "nome" => $row['nome']
                ]
            ]);
        } else {
            // Senha incorreta
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Credenciais inválidas."]);
        }
    } else {
        // Usuário não encontrado
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Credenciais inválidas."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erro no servidor: " . $e->getMessage()]);
}
?>
