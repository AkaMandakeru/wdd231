// Funções auxiliares compartilhadas pelos módulos das páginas da câmara

export function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) {
    elemento.className = classe;
  }
  if (texto) {
    elemento.textContent = texto;
  }
  return elemento;
}

export function criarLink(href, texto) {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = texto;
  return link;
}
