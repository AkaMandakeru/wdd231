// Página da coleção: cartas guardadas no navegador, com busca, ordenação e resumo.

import { contarPorRaridade, lerColecao } from "./armazenamento.mjs";
import { ligarGrade, montarGrade, prepararDialogo } from "./componentes.mjs";

const grade = document.querySelector("#minhaColecao");
const resumo = document.querySelector("#resumoColecao");
const porRaridade = document.querySelector("#porRaridade");
const vazio = document.querySelector("#colecaoVazia");
const totalTexto = document.querySelector("#totalTexto");
const campoBusca = document.querySelector("#buscaColecao");
const campoOrdem = document.querySelector("#ordemColecao");
const semResultado = document.querySelector("#semResultadoColecao");
const totalNoFormulario = document.querySelector("#totalCartas");
const dataHora = document.querySelector("#dataHora");

function ordenar(cartas, ordem) {
  const copia = [...cartas];
  if (ordem === "nome") {
    return copia.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }
  if (ordem === "raridade") {
    return copia.sort((a, b) => a.raridade.localeCompare(b.raridade, "pt-BR"));
  }
  return copia.sort((a, b) => (b.guardadaEm ?? 0) - (a.guardadaEm ?? 0));
}

function desenharResumo(colecao) {
  const raridades = contarPorRaridade(colecao);
  const colecoesDistintas = new Set(colecao.map((carta) => carta.colecao.nome));
  const comHp = colecao.filter((carta) => carta.hp);
  const hpMedio = comHp.length
    ? Math.round(comHp.reduce((soma, carta) => soma + Number(carta.hp), 0) / comHp.length)
    : 0;

  resumo.innerHTML = `
    <div class="resumo-item"><dt>Cartas guardadas</dt><dd>${colecao.length}</dd></div>
    <div class="resumo-item"><dt>Raridades diferentes</dt><dd>${raridades.length}</dd></div>
    <div class="resumo-item"><dt>Coleções diferentes</dt><dd>${colecoesDistintas.size}</dd></div>
    <div class="resumo-item"><dt>HP médio</dt><dd>${hpMedio || "—"}</dd></div>
  `;

  porRaridade.innerHTML = raridades
    .map(([raridade, quantidade]) => `
      <li class="raridade-linha">
        <span>${raridade}</span>
        <span class="raridade-quantidade">${quantidade}</span>
      </li>`)
    .join("");
}

function desenhar() {
  const colecao = lerColecao();
  const termo = campoBusca.value.trim().toLowerCase();
  const visiveis = ordenar(
    colecao.filter((carta) => !termo
      || carta.nome.toLowerCase().includes(termo)
      || carta.colecao.nome.toLowerCase().includes(termo)),
    campoOrdem.value
  );

  totalTexto.textContent = colecao.length === 1
    ? "Você possui 1 carta"
    : `Você possui ${colecao.length} cartas`;

  desenharResumo(colecao);
  montarGrade(grade, visiveis);

  vazio.hidden = colecao.length > 0;
  porRaridade.hidden = colecao.length === 0;
  semResultado.hidden = colecao.length === 0 || visiveis.length > 0;
  totalNoFormulario.value = colecao.length;
}

prepararDialogo();
ligarGrade(grade, (id) => lerColecao().find((carta) => carta.id === id), desenhar);

campoBusca.addEventListener("input", desenhar);
campoOrdem.addEventListener("change", desenhar);

dataHora.value = new Date().toISOString();
desenhar();
