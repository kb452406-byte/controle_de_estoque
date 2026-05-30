// ─── Configuração ────────────────────────────────────────────────────────────
var API_BASE = 'http://localhost:8080/backend/api';
// ─── Login ────────────────────────────────────────────────────────────────────
async function login(username, password) {
  try {
    const res = await fetch(`${API_BASE}/auth.php`, {
      method: 'POST',
      credentials: 'include', // envia cookie de sessão
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'login', username, password }),
    });

    const json = await res.json();

    if (json.ok) {
      // Guarda nome do usuário localmente só para exibição
      sessionStorage.setItem('authUser', JSON.stringify(json.data));
      return true;
    }
    return false;
  } catch (e) {
    console.error('Erro de conexão ao fazer login:', e);
    return false;
  }
}

// ─── Verificar autenticação ───────────────────────────────────────────────────
// Chamada no topo de cada página protegida
async function verificarAutenticacao() {
  try {
    const res = await fetch(`${API_BASE}/auth.php`, {
      credentials: 'include',
    });
    if (!res.ok) {
      window.location.href = 'login.html';
    }
  } catch (e) {
    // Se o backend não responder, redireciona para login
    window.location.href = 'login.html';
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
async function logout() {
  await fetch(`${API_BASE}/auth.php`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acao: 'logout' }),
  });
  sessionStorage.removeItem('authUser');
  window.location.href = 'login.html';
}

// ─── Redirecionar se já logado (página de login) ──────────────────────────────
async function redirecionarSeLogado() {
  try {
    const res = await fetch(`${API_BASE}/auth.php`, {
      credentials: 'include',
    });
    if (res.ok) {
      window.location.href = 'home.html';
    }
  } catch (e) {
    // Não está logado, continua na tela de login normalmente
  }
}
