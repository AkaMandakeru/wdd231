// Página do diretório: exibe todos os membros e alterna entre grade e lista

import { buscarMembros, criarCartaoMembro } from "./membros.mjs";
import { criarElemento } from "./utilitarios.mjs";

const containerMembros = document.querySelector("#membros");
const botaoGrade = document.querySelector("#botaoGrade");
const botaoLista = document.querySelector("#botaoLista");

async function exibirMembros() {
  try {
    const membros = await buscarMembros();
    containerMembros.replaceChildren(...membros.map((membro) => criarCartaoMembro(membro)));
  } catch {
    containerMembros.replaceChildren(
      criarElemento(
        "p",
        "mensagem-status",
        "Não foi possível carregar o diretório de membros. Tente novamente mais tarde."
      )
    );
  }
}

function definirExibicao(modo) {
  const emGrade = modo === "grade";

  containerMembros.classList.toggle("exibicao-grade", emGrade);
  containerMembros.classList.toggle("exibicao-lista", !emGrade);

  botaoGrade.classList.toggle("selecionado", emGrade);
  botaoLista.classList.toggle("selecionado", !emGrade);
  botaoGrade.setAttribute("aria-pressed", emGrade);
  botaoLista.setAttribute("aria-pressed", !emGrade);
}

botaoGrade.addEventListener("click", () => definirExibicao("grade"));
botaoLista.addEventListener("click", () => definirExibicao("lista"));

exibirMembros();
