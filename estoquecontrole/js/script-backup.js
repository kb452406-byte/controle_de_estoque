// ─── Configuração ────────────────────────────────────────────────────────────


// ─── Estado local ─────────────────────────────────────────────────────────────
let produtos = [];     // cache dos produtos carregados
let categorias = [];   // cache das categorias

// ─── Helpers de fetch ─────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.erro || 'Erro desconhecido');
  return json.data;
}

// ─── Carregar dados ───────────────────────────────────────────────────────────
async function carregarCategorias() {
  categorias = await apiFetch(`${API_BASE}/categorias.php`);
}

async function carregarProdutos(filtro = '') {
  const url = filtro
    ? `${API_BASE}/produtos.php?busca=${encodeURIComponent(filtro)}`
    : `${API_BASE}/produtos.php`;
  produtos = await apiFetch(url);
  renderizarTabela(produtos);
}

// ─── Renderizar tabela ────────────────────────────────────────────────────────
function renderizarTabela(lista) {
  const tabela = document.getElementById('tabela');
  tabela.innerHTML = '';

  if (lista.length === 0) {
    tabela.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#999;">Nenhum produto encontrado.</td></tr>`;
    return;
  }

  lista.forEach(p => {
    const linha = document.createElement('tr');
    linha.dataset.id = p.id;
    linha.innerHTML = `
      <td>${p.categoria_nome}</td>
      <td>
        <input class="input-table" type="number" value="${p.quantidade}"
               onchange="atualizarCampo(${p.id}, 'quantidade', this.value)" />
      </td>
      <td>
        <input class="input-table" type="text" value="${p.unidade}"
               onchange="atualizarCampo(${p.id}, 'unidade', this.value)" />
      </td>
      <td>
        <input class="input-table" type="text" value="${p.valor || ''}"
               placeholder="R$"
               onchange="atualizarCampo(${p.id}, 'valor', this.value)" />
      </td>
      <td>
        <button onclick="deletarProduto(${p.id})"
                style="background:#f2c6c6;border:none;border-radius:5px;padding:4px 10px;cursor:pointer;">
          🗑
        </button>
      </td>
    `;
    tabela.appendChild(linha);
  });
}

// ─── Atualizar campo inline ───────────────────────────────────────────────────
async function atualizarCampo(id, campo, valor) {
  try {
    await apiFetch(`${API_BASE}/produtos.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ [campo]: valor }),
    });
  } catch (e) {
    alert('Erro ao salvar: ' + e.message);
  }
}

// ─── Adicionar produto via modal ──────────────────────────────────────────────
async function adicionarProduto(categoria_id, nome, quantidade, unidade) {
  const novo = await apiFetch(`${API_BASE}/produtos.php`, {
    method: 'POST',
    body: JSON.stringify({ categoria_id, nome, quantidade, unidade }),
  });
  await carregarProdutos(); // recarrega a tabela
  return novo;
}

// ─── Deletar produto ──────────────────────────────────────────────────────────
async function deletarProduto(id) {
  if (!confirm('Remover este produto?')) return;
  try {
    await apiFetch(`${API_BASE}/produtos.php?id=${id}`, { method: 'DELETE' });
    await carregarProdutos();
  } catch (e) {
    alert('Erro ao remover: ' + e.message);
  }
}

// ─── Modal simples para adicionar ────────────────────────────────────────────
function abrirModal(categoriaNomePadrao = '') {
  const categoria_id = categorias.find(c =>
    c.nome.toLowerCase().includes(categoriaNomePadrao.toLowerCase())
  )?.id || categorias[0]?.id;

  const opcoesCategoria = categorias.map(c =>
    `<option value="${c.id}" ${c.id === categoria_id ? 'selected' : ''}>${c.nome}</option>`
  ).join('');

  // Remove modal anterior se existir
  document.getElementById('modal-estoque')?.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-estoque';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.45);
    display:flex;align-items:center;justify-content:center;z-index:999;
  `;
  modal.innerHTML = `
    <div style="background:#f4efe6;border-radius:12px;padding:28px;width:340px;
                box-shadow:0 8px 24px rgba(0,0,0,.3);font-family:Arial,sans-serif;">
      <h3 style="margin:0 0 18px;font-size:18px;">Novo Produto</h3>

      <label style="font-size:12px;font-weight:600;color:#666;">Categoria</label>
      <select id="m-cat" style="width:100%;padding:8px;border-radius:6px;
              border:1px solid #ccc;margin:4px 0 14px;font-size:14px;">
        ${opcoesCategoria}
      </select>

      <label style="font-size:12px;font-weight:600;color:#666;">Nome do produto</label>
      <input id="m-nome" type="text" placeholder="Ex: Perfume Floral"
             style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;
                    margin:4px 0 14px;font-size:14px;box-sizing:border-box;" />

      <label style="font-size:12px;font-weight:600;color:#666;">Quantidade inicial</label>
      <input id="m-qtd" type="number" value="0"
             style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;
                    margin:4px 0 14px;font-size:14px;box-sizing:border-box;" />

      <label style="font-size:12px;font-weight:600;color:#666;">Unidade (ML, UN…)</label>
      <input id="m-un" type="text" value="ML"
             style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;
                    margin:4px 0 20px;font-size:14px;box-sizing:border-box;" />

      <div style="display:flex;gap:10px;">
        <button onclick="confirmarModal()"
                style="flex:1;padding:10px;background:#cfe8c6;border:none;
                       border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
          Salvar
        </button>
        <button onclick="document.getElementById('modal-estoque').remove()"
                style="flex:1;padding:10px;background:#f2c6c6;border:none;
                       border-radius:8px;font-size:14px;cursor:pointer;">
          Cancelar
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function confirmarModal() {
  const cat  = document.getElementById('m-cat').value;
  const nome = document.getElementById('m-nome').value.trim();
  const qtd  = document.getElementById('m-qtd').value;
  const un   = document.getElementById('m-un').value.trim() || 'UN';

  if (!nome) { alert('Digite o nome do produto.'); return; }

  try {
    await adicionarProduto(parseInt(cat), nome, parseFloat(qtd), un);
    document.getElementById('modal-estoque').remove();
  } catch (e) {
    alert('Erro: ' + e.message);
  }
}

// ─── Busca ────────────────────────────────────────────────────────────────────
document.getElementById('buscar')?.addEventListener('input', (e) => {
  carregarProdutos(e.target.value);
});

// ─── Botões do topo ───────────────────────────────────────────────────────────
document.getElementById('btn-add-perfume')?.addEventListener('click', () => abrirModal('perfume'));
document.getElementById('btn-add-produto')?.addEventListener('click', () => abrirModal(''));
document.getElementById('btn-add-item')  ?.addEventListener('click', () => abrirModal(''));

// ─── Inicialização ────────────────────────────────────────────────────────────
(async () => {
  try {
    await carregarCategorias();
    await carregarProdutos();
  } catch (e) {
    console.error('Falha ao carregar dados:', e);
    document.getElementById('tabela').innerHTML = `
      <tr><td colspan="5" style="color:red;text-align:center;">
        ⚠ Não foi possível conectar ao servidor.<br>
        Verifique se o XAMPP está rodando.
      </td></tr>
    `;
  }
})();
