// Página inicial: cartas em destaque sorteadas e resumo da coleção guardada.

import { obterDestaques } from "./api.mjs";
import { contarPorRaridade, lerColecao } from "./armazenamento.mjs";
import { ligarGrade, montarGrade, mostrarMensagem, prepararDialogo } from "./componentes.mjs";

const grade = document.querySelector("#destaques");
const aviso = document.querySelector("#avisoDestaques");
const resumo = document.querySelector("#resumoColecao");

let emExibicao = [];

function atualizarResumo() {
  const colecao = lerColecao();
  const raridades = contarPorRaridade(colecao);
  const colecoesDistintas = new Set(colecao.map((carta) => carta.colecao.nome));

  resumo.innerHTML = `
    <div class="resumo-item"><dt>Cartas guardadas</dt><dd>${colecao.length}</dd></div>
    <div class="resumo-item"><dt>Raridades diferentes</dt><dd>${raridades.length}</dd></div>
    <div class="resumo-item"><dt>Coleções diferentes</dt><dd>${colecoesDistintas.size}</dd></div>
  `;
}

async function carregarDestaques() {
  const { cartas, origem, colecao } = await obterDestaques(4);

  if (cartas.length === 0) {
    mostrarMensagem(aviso, "Não foi possível carregar as cartas em destaque agora. Tente de novo em instantes.", "erro");
    grade.innerHTML = "";
    return;
  }

  mostrarMensagem(aviso, origem === "reserva"
    ? "A API está fora do ar, então estas cartas vêm do arquivo de reserva do site."
    : `Sorteadas agora da coleção ${colecao.nome}. Recarregue a página para ver outras.`);

  emExibicao = cartas;
  montarGrade(grade, cartas);
}

prepararDialogo();
ligarGrade(grade, (id) => emExibicao.find((carta) => carta.id === id), atualizarResumo);

// A busca rápida usa o envio normal do formulário (method get para cartas.html),
// então ela continua funcionando mesmo se este módulo falhar.
atualizarResumo();
carregarDestaques();
