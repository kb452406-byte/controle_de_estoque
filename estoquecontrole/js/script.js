function adicionarItem(categoria, qtd, tipo, valor) {
  const tabela = document.getElementById("tabela");

  const linha = document.createElement("tr");

  // Removido id="qtd" e id="tipo" para evitar IDs duplicados no DOM. 
  // Agora usam apenas as classes.
  linha.innerHTML = `
    <td>${categoria}</td>
    <td>
      <input class="input-table" type="number" value="${qtd}">
    </td>
    <td>
      <input class="input-table" type="text" value="${tipo}">
    </td>
    <td>${valor}</td>
  `;

  tabela.appendChild(linha);
}

/* Categorias Iniciais */
adicionarItem("Óleos", 30, "ML", "R$");
adicionarItem("Perfumes", 50, "ML", "R$");
adicionarItem("Indústrias", 20, "ML", "R$");
adicionarItem("Cestinhas", 20, "ML", "R$");

/* Eventos dos Botões */
document.getElementById('btn-add-perfume').addEventListener('click', () => {
  adicionarItem("Novo Perfume", 0, "ML", "R$");
});

document.getElementById('btn-add-produto').addEventListener('click', () => {
  adicionarItem("Novo Produto", 0, "UN", "R$");
});

document.getElementById('btn-add-item').addEventListener('click', () => {
  adicionarItem("Novo Item", 0, "UN", "R$");
});