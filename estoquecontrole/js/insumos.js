// URL DO PPHP
const API_URL = 'api/insumos.php';

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

// FUNÇÃO SETA A CATEGORIA DO MENU

function setCategoria(categoria, elementoClicado) {
    categoriaAtual = categoria;
    
    if (elementoClicado) {
        document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
        elementoClicado.classList.add('active');
    }
    
    renderizarTabela();
}

// FUNÇÃO RENDERIZAR TABELA DE INSUMOS

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
        
        // Se o banco retornar a categoria oficial, compara exato
        if (item.categoria && item.categoria === categoriaAtual) {
            return true;
        }

        // Fallback para problemas de codificação () no banco
        if (item.categoria) {
            let catBanco = item.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let catAtual = categoriaAtual.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (catBanco === catAtual) return true;
            // Se as duas strings começam igual (ex: fragr)
            if (catAtual.length > 4 && catBanco.substring(0,5) === catAtual.substring(0,5)) return true;
        }
        
        // Fallback antigo por nome do insumo
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
        renderizarLinha(item.id, item.nome, item.estoque_atual, item.tipo || "UN", item.preco_venda, dataFormatada, item.alerta_estoque);
    });
}

// 2. FUNÇÃO PARA CARREGAR DADOS (GET)
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

// 3. FUNÇÃO VISUAL: Desenha a linha no HTML
function renderizarLinha(id, categoria, qtd, tipo, valor, ultimaAlteracao, alertaEstoque) {
    const tabela = document.getElementById("tabela");
    const linha = document.createElement("tr");

    // Destaca de vermelho clarinho caso o estoque esteja baixo
    if (alertaEstoque == 1) {
        linha.style.backgroundColor = "#ffeaec";
        categoria = `<span title="Estoque Baixo!" style="color: #dc3545;"><i class="bi bi-exclamation-triangle-fill"></i> ${categoria}</span>`;
    }


    // COLOCA AS LINHAS DENTRO DA TABELA
    // DADOS COM INPUTS PARA EDIÇÃO, SIMULANDO UM CADERNO DE ANOTAÇÕES

    linha.innerHTML = `
        <td>${categoria}</td>
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
                <option value="PC" ${tipo === 'PC' ? 'selected' : ''}>PC</option>
                <option value="CX" ${tipo === 'CX' ? 'selected' : ''}>CX</option>
            </select>
        </td>
        <td>R$ ${valor}</td>
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

// 5. FUNÇÃO PARA ATUALIZAR CAMPO (PUT)

async function atualizarCampoNoBanco(id, campo, novoValor) {

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
        await atualizarCampoNoBanco(id, 'status', 'inativo');
    }
}


// MODAL

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

// FUNÇÃO PARA SALVAR NOVO ITEM (POST)

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

// FUNÇÃO PARA ALTERAR O MENU (ABRIR E FECHAR)

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