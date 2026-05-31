// Função para validar login via API

async function login(username, password) {
  try {
    const response = await fetch('./api/auth.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const result = await response.json();
    
    // Se o login for bem sucedido, salva os dados do usuário

    if (result.success) {
      sessionStorage.setItem('authUser', JSON.stringify(result.userData));
      return true;
    }
    
    // Se não for bem sucedido, retorna false

    return false;
  } catch (error) {
    console.error("Erro no login:", error);
    return false;
  }
}

// Função para verificar se está logado e redirecionar se não estiver

function verificarAutenticacao() {
  const authUser = sessionStorage.getItem('authUser');
  if (!authUser) {

    // Se não tiver a chave 'authUser', joga de volta para o login

    window.location.href = 'login.html';
  }
}

// Função de logout

function logout() {
  sessionStorage.removeItem('authUser');
  window.location.href = 'login.html';
}

// Função para verificar se está logado na página de login (para não logar de novo)

function redirecionarSeLogado() {
  const authUser = sessionStorage.getItem('authUser');
  if (authUser) {
    window.location.href = 'produtos.html';
  }
}

