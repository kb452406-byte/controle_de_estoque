// Simulação de Banco de Dados de Usuários
const usuariosMock = [
  { username: 'admin', password: 'admin123', nome: 'Administrador' },
  { username: 'usuario', password: '123456', nome: 'Usuário Padrão' }
];

// Função para validar login
function login(username, password) {
  // Procura o usuário no "banco de dados"
  const user = usuariosMock.find(u => u.username === username && u.password === password);

  if (user) {
    // Se encontrar, salva os dados no sessionStorage (simulando um token/sessão)
    // Removemos a senha por segurança, armazenando apenas o username e nome
    const { password, ...userData } = user;
    sessionStorage.setItem('authUser', JSON.stringify(userData));
    return true;
  }
  return false;
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
    window.location.href = 'home.html';
  }
}

