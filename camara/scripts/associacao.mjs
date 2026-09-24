// Página de associação: marca a hora em que o formulário foi aberto e abre os modais dos níveis

const campoDataHora = document.querySelector("#dataHora");
campoDataHora.value = new Date().toISOString();

document.querySelectorAll(".botao-nivel").forEach((botao) => {
  const dialogo = document.querySelector(`#${botao.dataset.dialogo}`);

  botao.addEventListener("click", () => dialogo.showModal());
  dialogo.querySelector(".fechar-dialogo").addEventListener("click", () => dialogo.close());

  // Um clique no <dialog> só chega até aqui quando cai fora da caixa de conteúdo.
  dialogo.addEventListener("click", (evento) => {
    if (evento.target === dialogo) {
      dialogo.close();
    }
  });
});
