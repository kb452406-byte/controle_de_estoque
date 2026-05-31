// Definimos a URL da nossa API PHP
const API_URL = 'api/produtos.php'; // Pode ser api/insumos.php dependendo da tabela

let todosOsProdutos = [];
let categoriaAtual = 'Todos';

// 1. EVENTO DE INICIALIZAÇÃO: Assim que a página abre, busca os dados no banco
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosDoBanco();
    
    const inputBuscar = document.getElementById('buscar');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', renderizarTabela);
    }
});

function setCategoria(categoria, elementoClicado) {
    categoriaAtual = categoria;
    
    if (elementoClicado) {
        document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
        elementoClicado.classList.add('active');
    }
    
    renderizarTabela();
}

function renderizarTabela() {
    const tabela = document.getElementById("tabela");
    if (!tabela) return;
    tabela.innerHTML = '';
    
    const termo = document.getElementById('buscar') ? document.getElementById('buscar').value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

    const filtrados = todosOsProdutos.filter(item => {
        const nomeOriginal = item.nome || '';
        const nome = nomeOriginal.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (termo && !nome.includes(termo)) return false;
        if (categoriaAtual === 'Todos') return true;
        
        // Se o banco retornar a categoria oficial, usa ela
        if (item.categoria && item.categoria === categoriaAtual) {
            return true;
        }
        
        // Fallback antigo por nome
        let catBusca = categoriaAtual.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (catBusca.endsWith('s')) catBusca = catBusca.slice(0, -1);
        
        return nome.includes(catBusca) || nomeOriginal.toLowerCase().includes(categoriaAtual.toLowerCase());
    });

    filtrados.forEach(item => {
        let dataFormatada = "-";
        if (item.data_atualizacao) {
            const data = new Date(item.data_atualizacao);
            dataFormatada = data.toLocaleString('pt-BR');
        }
        renderizarLinha(item.id, item.nome, item.categoria, item.estoque_atual, item.tipo || "UN", item.preco_venda, dataFormatada, item.alerta_estoque);
    });
}

// 2. FUNÇÃO PARA BUSCAR DADOS (GET)
async function carregarDadosDoBanco() {
    try {
        const resposta = await fetch(API_URL);
        
        if (!resposta.ok) {
            const txt = await resposta.text();
            throw new Error(`Erro do servidor (${resposta.status}): ${txt}`);
        }
        
        const dados = await resposta.json();
        
        if (!Array.isArray(dados)) {
            if (dados && dados.error) throw new Error(dados.error);
            throw new Error("Formato de dados inválido recebido do servidor.");
        }
        
        todosOsProdutos = dados;
        renderizarTabela();
    } catch (erro) {
        console.error("Erro ao carregar dados do estoque:", erro);
        alert("Erro de conexão com o banco de dados:\n" + erro.message);
    }
}

// 3. FUNÇÃO VISUAL: Desenha a linha no HTML (Seu código original melhorado)
function renderizarLinha(id, nome, categoria, qtd, tipo, valor, ultimaAlteracao, alertaEstoque) {
    const tabela = document.getElementById("tabela");
    const linha = document.createElement("tr");

    // Destaca de vermelho clarinho caso o estoque esteja baixo
    let alertaBadge = "";
    if (alertaEstoque == 1) {
        linha.style.backgroundColor = "#ffeaec";
        alertaBadge = `<span title="Estoque Baixo!" style="color: #dc3545; margin-left: 5px;"><i class="bi bi-exclamation-triangle-fill"></i></span>`;
    }

    // ADICIONANDO DADOS NA TABELA
    // TODOS COM INPUTS PARA EDIÇÃO, SIMULANDO UM CADERNO DE ANOTAÇÕES

    linha.innerHTML = `
        <td>
            <div style="display: flex; align-items: center;">
                <input 
                    class="input-table" 
                    type="text" 
                    value="${nome}" 
                    style="width: 100%; min-width: 120px;"
                    onchange="atualizarCampoNoBanco(${id}, 'nome', this.value)"
                >
                ${alertaBadge}
            </div>
        </td>
        <td>
            <input 
                class="input-table" 
                type="number" 
                value="${qtd}" 
                onchange="atualizarCampoNoBanco(${id}, 'estoque_atual', this.value)"
            >
        </td>
        <td>
            <select class="input-table" onchange="atualizarCampoNoBanco(${id}, 'tipo', this.value)">
                <option value="UN" ${tipo === 'UN' ? 'selected' : ''}>UN</option>
                <option value="KG" ${tipo === 'KG' ? 'selected' : ''}>KG</option>
                <option value="L" ${tipo === 'L' ? 'selected' : ''}>L</option>
                <option value="ML" ${tipo === 'ML' ? 'selected' : ''}>ML</option>
                <option value="PCT" ${tipo === 'PCT' ? 'selected' : ''}>PCT</option>
                <option value="CX" ${tipo === 'CX' ? 'selected' : ''}>CX</option>
            </select>
        </td>
        <td>
            <input 
                class="input-table" 
                type="text" 
                value="R$ ${valor}" 
                onchange="atualizarCampoNoBanco(${id}, 'preco_venda', this.value.replace('R$', '').trim())"
            ></td>
        <td>
            <select class="input-table" onchange="atualizarCampoNoBanco(${id}, 'categoria', this.value)">
                <option value="Aromatizantes e Casa" ${categoria === 'Aromatizantes e Casa' ? 'selected' : ''}>Aromatizantes e Casa</option>
                <option value="Cuidado Capilar" ${categoria === 'Cuidado Capilar' ? 'selected' : ''}>Cuidado Capilar</option>
                <option value="Cuidado Corporal" ${categoria === 'Cuidado Corporal' ? 'selected' : ''}>Cuidado Corporal</option>
                <option value="Bebidas Naturais" ${categoria === 'Bebidas Naturais' ? 'selected' : ''}>Bebidas Naturais</option>
                <option value="Kits e Eventos" ${categoria === 'Kits e Eventos' ? 'selected' : ''}>Kits e Eventos</option>
                <option value="Outros" ${categoria === 'Outros' ? 'selected' : ''}>Outros</option>
            </select>
        </td>
        <td>${ultimaAlteracao}</td>
        <td style="text-align: center;">
            <button class="btn" style="background-color: #dc3545; color: white; width:35px; height:35px; padding: 5px 10px; border-radius: 4px; cursor: pointer;" onclick="excluirItem(${id})" title="Excluir">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;

    tabela.appendChild(linha);
}

// 4. FUNÇÃO PARA SALVAR NOVO ITEM (POST)
async function adicionarItemBanco(nome, categoria, qtd, tipo, valor) {
    const novoItem = {
        nome: nome,
        categoria: categoria,
        estoque_atual: qtd,
        tipo: tipo,
        preco_venda: valor
    };

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoItem)
        });

        const resultado = await resposta.json();

        if (resultado.success) {
            console.log("Item salvo com sucesso!");
            fecharModal();
            document.getElementById('add-nome').value = '';
            document.getElementById('add-qtd').value = '';
            document.getElementById('add-valor').value = '';
            carregarDadosDoBanco();
        } else {
            alert("Erro ao salvar: " + resultado.message);
        }
    } catch (erro) {
        console.error("Erro ao enviar para o back-end:", erro);
    }
}

// 5. FUNÇÃO PARA ATUALIZAR CAMPO (PUT) - Foco em UX
async function atualizarCampoNoBanco(id, campo, novoValor) {
    // Essa função avisa o PHP que o usuário mudou algum campo (estoque ou tipo) de um item existente
    try {
        const body = {};
        body[campo] = novoValor;

        const resposta = await fetch(`${API_URL}?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const resultado = await resposta.json();
        if (resultado.success) {
            console.log(`O campo ${campo} do item ${id} foi atualizado para ${novoValor}`);
            carregarDadosDoBanco(); // Recarrega a tabela para atualizar a data visualmente
        } else {
            console.error("Erro ao atualizar no PHP:", resultado.message);
            alert("Erro ao salvar a alteração: " + resultado.message);
        }
    } catch (erro) {
        console.error("Erro ao atualizar item:", erro);
        alert("Erro de comunicação com o servidor.");
    }
}

// 6. FUNÇÃO PARA EXCLUIR ITEM (SOFT DELETE)
async function excluirItem(id) {
    if (confirm("Tem certeza que deseja excluir este item?")) {
        // Aproveita a nossa função atualizarCampoNoBanco para mudar o status para 'inativo'
        await atualizarCampoNoBanco(id, 'status', 'inativo');
    }
}

/* =========================================
   Eventos e Modal
   ========================================= */

function abrirModal() {
    const modal = document.getElementById('modal-add');
    if(modal) modal.style.display = 'block';
}

function fecharModal() {
    const modal = document.getElementById('modal-add');
    if(modal) modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal-add');
    if (event.target == modal) {
        fecharModal();
    }
}

function salvarNovoItem() {
    const nome = document.getElementById('add-nome').value.trim();
    const categoria = document.getElementById('add-categoria').value;
    const tipo = document.getElementById('add-tipo').value;
    const qtdStr = document.getElementById('add-qtd').value;
    const valorStr = document.getElementById('add-valor').value;

    if (!nome) {
        alert("O nome é obrigatório.");
        return;
    }

    let qtd = parseInt(qtdStr || 0);
    let valor = parseFloat(valorStr ? valorStr.replace(',', '.') : 0);

    if (isNaN(qtd)) qtd = 0;
    if (isNaN(valor)) valor = 0;

    adicionarItemBanco(nome, categoria, qtd, tipo, valor);
}

// Toggle para o menu lateral
function toggleMenu(btn) {
    const ul = btn.nextElementSibling;
    const icon = btn.querySelector('i');
    if (ul.style.display === 'none') {
        ul.style.display = 'block';
        icon.classList.remove('bi-chevron-right');
        icon.classList.add('bi-chevron-down');
    } else {
        ul.style.display = 'none';
        icon.classList.remove('bi-chevron-down');
        icon.classList.add('bi-chevron-right');
    }
}