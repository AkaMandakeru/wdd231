// Menu de navegação responsivo: hambúrguer nas telas pequenas.

const botaoMenu = document.querySelector("#botaoMenu");
const menu = document.querySelector("#menuPrincipal");

function definirEstado(aberto) {
  menu.classList.toggle("aberto", aberto);
  botaoMenu.setAttribute("aria-expanded", aberto);
  botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu de navegação" : "Abrir menu de navegação");
}

botaoMenu.addEventListener("click", () => {
  definirEstado(!menu.classList.contains("aberto"));
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => definirEstado(false));
});
