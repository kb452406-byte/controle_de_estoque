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

// Função de cadastro
async function cadastrar() {
    const nome = document.getElementById('nome').value.trim();
    const sobrenome = document.getElementById('sobrenome').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm_password = document.getElementById('confirm_password').value;
    const termos = document.getElementById('termos').checked;

    if (!nome || !sobrenome || !username || !email || !password || !confirm_password) {
        alert("Preencha todos os campos!");
        return;
    }

    if (password !== confirm_password) {
        alert("As senhas não coincidem!");
        return;
    }

    if (!termos) {
        alert("Você precisa aceitar os termos de uso!");
        return;
    }

    const nomeCompleto = nome + " " + sobrenome;

    try {
        const response = await fetch('./api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'register',
                nome: nomeCompleto,
                username: username,
                email: email,
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            alert("Cadastro realizado com sucesso!");
            window.location.href = 'login.html';
        } else {
            alert(result.message || "Erro ao cadastrar.");
        }
    } catch (error) {
        console.error("Erro no cadastro:", error);
        alert("Erro ao conectar com o servidor.");
    }
}

window.addEventListener('DOMContentLoaded', () => {
  const authUser = sessionStorage.getItem('authUser');
  if (authUser) {
    try {
      const user = JSON.parse(authUser);
      const nameEl = document.getElementById('nome-usuario');
      if (nameEl && user.nome) {
        // Exibe o nome completo do usuário
        nameEl.textContent = `Olá, ${user.nome}!`;
      }
    } catch (e) {
      console.error('Erro ao parsear dados do usuário:', e);
    }
  }
});
