// Menu de navegação responsivo (hambúrguer nas telas pequenas)

const botaoMenu = document.querySelector("#botaoMenu");
const menuPrincipal = document.querySelector("#menuPrincipal");

function definirEstadoMenu(aberto) {
  menuPrincipal.classList.toggle("aberto", aberto);
  botaoMenu.setAttribute("aria-expanded", aberto);
  botaoMenu.setAttribute(
    "aria-label",
    aberto ? "Fechar menu de navegação" : "Abrir menu de navegação"
  );
}

botaoMenu.addEventListener("click", () => {
  definirEstadoMenu(!menuPrincipal.classList.contains("aberto"));
});

// Fecha o menu depois que um link é escolhido em telas pequenas.
menuPrincipal.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => definirEstadoMenu(false));
});
