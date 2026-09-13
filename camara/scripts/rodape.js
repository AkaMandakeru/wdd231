// Conteúdo dinâmico do rodapé: ano dos direitos autorais e última modificação

const anoAtual = document.querySelector("#anoAtual");
const ultimaModificacao = document.querySelector("#ultimaModificacao");

anoAtual.textContent = new Date().getFullYear();
ultimaModificacao.textContent = `Última Modificação: ${document.lastModified}`;
