# 🛠 Backend — Controle de Estoque

## Stack
- **PHP 8+** (backend / API REST)
- **SQLite** (banco de dados — arquivo local, sem instalação separada)
- **XAMPP** (servidor local recomendado para Windows)

---

## 📁 Estrutura de Pastas

```
estoquecontrole/
├── backend/
│   ├── db.php              ← conexão com SQLite + criação das tabelas
│   ├── helpers.php         ← funções de resposta JSON e CORS
│   ├── .htaccess           ← segurança básica
│   ├── estoque.db          ← banco criado automaticamente na 1ª execução
│   └── api/
│       ├── auth.php        ← POST login/logout | GET verifica sessão
│       ├── categorias.php  ← GET / POST / PUT / DELETE
│       └── produtos.php    ← GET / POST / PUT / DELETE + busca
│
├── css/
├── js/                     ← substitua os arquivos abaixo:
│   ├── auth.js             ← usar o da pasta frontend-js/
│   └── script.js           ← usar o da pasta frontend-js/
├── home.html
└── login.html
```

---

## 🚀 Como rodar (XAMPP)

1. **Instale o XAMPP**: https://www.apachefriends.org/pt_br/index.html
2. Copie a pasta `estoquecontrole/` para dentro de `C:\xampp\htdocs\`
3. Abra o **XAMPP Control Panel** e clique em **Start** no Apache
4. Acesse no navegador: `http://localhost/estoquecontrole/login.html`

> O banco `estoque.db` é criado automaticamente na primeira vez que a API é acessada.
> Não é necessário instalar MySQL nem configurar nada.

---

## 🔌 Endpoints da API

### Autenticação
| Método | URL | Descrição |
|--------|-----|-----------|
| POST | `/backend/api/auth.php` | `{ "acao": "login", "username": "...", "password": "..." }` |
| POST | `/backend/api/auth.php` | `{ "acao": "logout" }` |
| GET  | `/backend/api/auth.php` | Verifica sessão ativa |

### Categorias
| Método | URL | Descrição |
|--------|-----|-----------|
| GET    | `/backend/api/categorias.php` | Lista todas |
| POST   | `/backend/api/categorias.php` | `{ "nome": "Nova Categoria" }` |
| PUT    | `/backend/api/categorias.php?id=1` | `{ "nome": "Novo Nome" }` |
| DELETE | `/backend/api/categorias.php?id=1` | Remove categoria |

### Produtos
| Método | URL | Descrição |
|--------|-----|-----------|
| GET    | `/backend/api/produtos.php` | Lista todos |
| GET    | `/backend/api/produtos.php?busca=floral` | Busca por nome |
| GET    | `/backend/api/produtos.php?categoria_id=2` | Filtra por categoria |
| GET    | `/backend/api/produtos.php?id=5` | Produto específico |
| POST   | `/backend/api/produtos.php` | Cria produto |
| PUT    | `/backend/api/produtos.php?id=5` | Atualiza campos |
| DELETE | `/backend/api/produtos.php?id=5` | Remove produto |

---

## 👤 Usuários padrão

| Usuário   | Senha      |
|-----------|------------|
| `admin`   | `admin123` |
| `usuario` | `123456`   |

Para adicionar usuários, edite o array `USUARIOS` em `backend/api/auth.php`.

---

## ⚠ Atenção após instalar

Substitua os arquivos do frontend:
- `js/auth.js` → pelo arquivo de `backend/frontend-js/auth.js`
- `js/script.js` → pelo arquivo de `backend/frontend-js/script.js`

O `home.html` também precisa de uma coluna extra `<th>` para o botão de deletar:

```html
<tr>
  <th>Categoria</th>
  <th>Qtd</th>
  <th>Tipo</th>
  <th>Valor</th>
  <th>Ações</th>   ← adicionar esta linha
</tr>
```
