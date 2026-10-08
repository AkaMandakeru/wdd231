// Pedaços de interface reaproveitados pelas páginas: cartas, modal e mensagens.

import { urlDaImagem } from "./api.mjs";
import { alternarCarta, estaGuardada } from "./armazenamento.mjs";

const dialogo = document.querySelector("#dialogoCarta");
const tituloDialogo = document.querySelector("#tituloDialogo");
const corpoDialogo = document.querySelector("#corpoDialogo");

let cartaNoDialogo = null;
let aoMudarColecao = () => {};

// Os textos vêm de uma API externa, então nada é inserido como HTML sem escape.
function escapar(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function listaDeTipos(carta) {
  return carta.tipos.length > 0 ? carta.tipos.join(", ") : "—";
}

// O selo usa a cor do primeiro tipo da carta, como no wireframe.
function selosDeTipo(carta) {
  return carta.tipos
    .map((tipo) => `<span class="selo-tipo selo-${escapar(tipo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""))}">${escapar(tipo)}</span>`)
    .join("");
}

export function montarCarta(carta, indice = 0) {
  const guardada = estaGuardada(carta.id);

  return `
    <li class="carta ${guardada ? "carta-guardada" : ""}" data-id="${escapar(carta.id)}">
      <img class="carta-imagem" src="${escapar(urlDaImagem(carta))}" alt="Carta ${escapar(carta.nome)}"
        width="245" height="342" loading="${indice < 4 ? "eager" : "lazy"}">
      <h3 class="carta-nome">${escapar(carta.nome)}</h3>
      <p class="carta-colecao">${escapar(carta.colecao.nome)}</p>
      <p class="carta-selos">${selosDeTipo(carta) || '<span class="selo-tipo">Sem tipo</span>'}</p>
      <dl class="carta-dados">
        <dt>Raridade</dt><dd>${escapar(carta.raridade)}</dd>
        <dt>HP</dt><dd>${carta.hp ? escapar(carta.hp) : "—"}</dd>
        <dt>Número</dt><dd>${escapar(carta.numero)}${carta.colecao.total ? `/${escapar(carta.colecao.total)}` : ""}</dd>
      </dl>
      <div class="carta-acoes">
        <button class="botao-pequeno" type="button" data-acao="detalhes">Detalhes</button>
        <button class="botao-pequeno" type="button" data-acao="guardar" aria-pressed="${guardada}">${guardada ? "Remover" : "Guardar"}</button>
      </div>
    </li>
  `;
}

export function montarGrade(elemento, cartas) {
  elemento.innerHTML = cartas.map((carta, indice) => montarCarta(carta, indice)).join("");
}

function rotuloDoBotaoDoDialogo(guardada) {
  return guardada ? "Remover da Minha Coleção" : "+ Adicionar à Minha Coleção";
}

export function abrirDetalhes(carta) {
  cartaNoDialogo = carta;
  tituloDialogo.textContent = carta.nome;
  const guardada = estaGuardada(carta.id);

  const ataques = carta.ataques.length > 0
    ? `<ul class="lista-ataques">${carta.ataques.map((ataque) => `
        <li class="ataque">
          <p class="ataque-topo"><span>${escapar(ataque.nome)}</span><span>${escapar(ataque.dano ?? "")}</span></p>
          <p class="ataque-efeito">${escapar(ataque.efeito || `Custo: ${ataque.custo.join(", ") || "—"}`)}</p>
        </li>`).join("")}</ul>`
    : "<p>Esta carta não tem ataques.</p>";

  corpoDialogo.innerHTML = `
    <img class="dialogo-imagem" src="${escapar(urlDaImagem(carta, "high"))}" alt="Carta ${escapar(carta.nome)}"
      width="600" height="825">
    <div>
      <p class="dialogo-origem">${escapar(carta.colecao.nome)} &middot; nº ${escapar(carta.numero)}${carta.colecao.total ? `/${escapar(carta.colecao.total)}` : ""}</p>
      <p class="carta-selos">${selosDeTipo(carta) || '<span class="selo-tipo">Sem tipo</span>'}</p>
      <dl class="carta-dados">
        <dt>HP</dt><dd>${carta.hp ? escapar(carta.hp) : "—"}</dd>
        <dt>Tipo</dt><dd>${escapar(listaDeTipos(carta))}</dd>
        <dt>Raridade</dt><dd>${escapar(carta.raridade)}</dd>
        <dt>Categoria</dt><dd>${escapar(carta.categoria || "—")}${carta.estagio ? ` · ${escapar(carta.estagio)}` : ""}</dd>
        <dt>Ilustração</dt><dd>${escapar(carta.ilustrador)}</dd>
      </dl>
      <button class="botao" type="button" id="guardarNoDialogo" aria-pressed="${guardada}">${rotuloDoBotaoDoDialogo(guardada)}</button>
      <h3>Ataques</h3>
      ${ataques}
    </div>
  `;

  dialogo.showModal();
}

/**
 * Liga os botões "Detalhes" e "Guardar" de uma grade usando delegação de eventos,
 * para que a grade possa ser redesenhada sem recriar os receptores.
 */
export function ligarGrade(grade, buscarCarta, aoAlternar) {
  aoMudarColecao = aoAlternar;

  grade.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-acao]");
    if (!botao) {
      return;
    }

    const item = botao.closest(".carta");
    const carta = buscarCarta(item.dataset.id);
    if (!carta) {
      return;
    }

    if (botao.dataset.acao === "detalhes") {
      abrirDetalhes(carta);
      return;
    }

    const guardada = alternarCarta(carta);
    botao.textContent = guardada ? "Remover" : "Guardar";
    botao.setAttribute("aria-pressed", guardada);
    item.classList.toggle("carta-guardada", guardada);
    aoAlternar(carta, guardada);
  });
}

/** Mantém o cartão da grade em sincronia quando a carta é guardada pelo modal. */
function atualizarCartaNaGrade(id, guardada) {
  const item = document.querySelector(`.carta[data-id="${id}"]`);
  if (!item) {
    return;
  }
  const botao = item.querySelector('[data-acao="guardar"]');
  botao.textContent = guardada ? "Remover" : "Guardar";
  botao.setAttribute("aria-pressed", guardada);
  item.classList.toggle("carta-guardada", guardada);
}

export function prepararDialogo() {
  dialogo.querySelector(".fechar-dialogo").addEventListener("click", () => dialogo.close());

  dialogo.addEventListener("click", (evento) => {
    if (evento.target === dialogo) {
      dialogo.close();
      return;
    }

    if (evento.target.closest("#guardarNoDialogo") && cartaNoDialogo) {
      const guardada = alternarCarta(cartaNoDialogo);
      const botao = dialogo.querySelector("#guardarNoDialogo");
      botao.textContent = rotuloDoBotaoDoDialogo(guardada);
      botao.setAttribute("aria-pressed", guardada);
      atualizarCartaNaGrade(cartaNoDialogo.id, guardada);
      aoMudarColecao(cartaNoDialogo, guardada);
    }
  });
}

export function mostrarMensagem(elemento, texto, tipo = "informacao") {
  elemento.textContent = texto;
  elemento.className = tipo === "erro" ? "mensagem mensagem-erro" : "mensagem";
  elemento.hidden = false;
}
