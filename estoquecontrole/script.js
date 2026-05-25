function adicionarItem(categoria, qtd, tipo, valor) {
  const tabela = document.getElementById("tabela");

  const linha = document.createElement("tr");

  linha.innerHTML = `
    <td>${categoria}</td>
    <td>
      <input class="input-table" type="number" value="${qtd}" id="qtd">
    </td>
    <td>
      <input class="input-table" type="text" value="${tipo}" id="tipo">
    </td>
    <td>${valor}</td>
  `;

  tabela.appendChild(linha);
}

/* categorias */
adicionarItem("Óleos", 30, "ML", "R$");
adicionarItem("Perfumes", 50, "ML", "R$");
adicionarItem("Indústrias", 20, "ML", "R$");
adicionarItem("Cestinhas", 20, "ML", "R$");