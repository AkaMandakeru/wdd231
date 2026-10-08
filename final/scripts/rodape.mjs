// Ano atual e data da última modificação no rodapé.

document.querySelector("#anoAtual").textContent = new Date().getFullYear();
document.querySelector("#ultimaModificacao").textContent = `Última modificação: ${document.lastModified}`;
