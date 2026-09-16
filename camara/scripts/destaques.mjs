// Empresas em destaque: sorteia membros ouro ou prata a cada carregamento da página

import { buscarMembros, criarCartaoMembro } from "./membros.mjs";
import { criarElemento } from "./utilitarios.mjs";

const quantidadeDestaques = 3;
const containerDestaques = document.querySelector("#destaques");

// Embaralhamento de Fisher-Yates: cada ordem possível tem a mesma chance.
function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export async function exibirDestaques() {
  try {
    const membros = await buscarMembros();
    const ouroOuPrata = membros.filter((membro) => membro.nivel >= 2);
    const sorteados = embaralhar(ouroOuPrata).slice(0, quantidadeDestaques);
    containerDestaques.replaceChildren(...sorteados.map((membro) => criarCartaoMembro(membro, "h3")));
  } catch {
    containerDestaques.replaceChildren(
      criarElemento("p", "mensagem-status", "Não foi possível carregar as empresas em destaque.")
    );
  }
}
