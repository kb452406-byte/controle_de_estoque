function adicionarItem(categoria, nome, qtd, tipo, valor) {
  const tabela = document.getElementById("tabela");

  const linha = document.createElement("tr");

  linha.innerHTML = `
    <td>${categoria}</td>
    <td>${nome}</td>
    <td>${qtd}</td>
    <td>${tipo}</td>
    <td>${valor}</td>
  `;

  tabela.appendChild(linha);
}

/* categorias */
adicionarItem("Óleos", "Perfume 1", 30, "ML", "R$");
adicionarItem("Perfumes", "Perfume 2", 50, "ML", "R$");
adicionarItem("Indústrias", "Perfume 3", 20, "ML", "R$");
adicionarItem("Cestinhas", "Perfume 4", 20, "ML", "R$");