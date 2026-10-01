// Página Sobre: monta os cartões dos pontos de interesse, os créditos das fotos
// e a mensagem sobre o tempo desde a última visita.

import { locais } from "../dados/locais.mjs";
import { criarElemento, criarLink } from "./utilitarios.mjs";

const galeria = document.querySelector("#galeria");
const listaCreditos = document.querySelector("#creditos");
const aviso = document.querySelector("#avisoVisita");
const dialogo = document.querySelector("#dialogoLocal");
const tituloDialogo = document.querySelector("#tituloDialogoLocal");
const corpoDialogo = document.querySelector("#corpoDialogoLocal");

const chaveVisita = "camara-ultima-visita";
const umDiaEmMilissegundos = 86400000;

// ----- Mensagem da última visita -----

function mensagemDaVisita(anterior, agora) {
  if (!anterior) {
    return "Boas-vindas! Entre em contato conosco caso tenha alguma dúvida.";
  }

  const dias = Math.floor((agora - anterior) / umDiaEmMilissegundos);
  if (dias < 1) {
    return "Já voltou? Que legal!";
  }
  return `Seu último acesso foi há ${dias} ${dias === 1 ? "dia" : "dias"}.`;
}

function exibirMensagemDaVisita() {
  const agora = Date.now();
  const anterior = Number(localStorage.getItem(chaveVisita));

  aviso.textContent = mensagemDaVisita(anterior, agora);
  aviso.hidden = false;

  localStorage.setItem(chaveVisita, agora);
}

// ----- Cartões dos pontos de interesse -----

function abrirDetalhes(local) {
  tituloDialogo.textContent = local.nome;

  const endereco = criarElemento("address", "dialogo-endereco", local.endereco);
  const texto = criarElemento("p", "", local.detalhes);
  const site = criarElemento("p", "dialogo-site");
  const link = criarLink(local.site, "Site oficial");
  link.target = "_blank";
  link.rel = "noopener";
  site.append(link);

  corpoDialogo.replaceChildren(endereco, texto, site);
  dialogo.showModal();
}

function criarCartao(local, indice) {
  const cartao = criarElemento("article", "cartao-local");

  const imagem = criarElemento("img", "imagem-local");
  imagem.src = `imagens/${local.imagem}.webp`;
  imagem.alt = local.alt;
  imagem.width = 300;
  imagem.height = 200;
  // A primeira imagem aparece de cara; as outras só carregam ao rolar a página.
  imagem.loading = indice === 0 ? "eager" : "lazy";

  const figura = criarElemento("figure", "figura-local");
  figura.append(imagem);

  const botao = criarElemento("button", "botao-local", "Saiba mais");
  botao.type = "button";
  botao.addEventListener("click", () => abrirDetalhes(local));

  cartao.append(
    criarElemento("h2", "titulo-local", local.nome),
    figura,
    criarElemento("p", "descricao-local", local.descricao),
    criarElemento("address", "endereco-local", local.endereco),
    botao
  );

  return cartao;
}

function criarCredito(local) {
  const item = document.createElement("li");
  const link = criarLink(local.credito.pagina, local.nome);
  link.target = "_blank";
  link.rel = "noopener";
  item.append(link, ` — foto de ${local.credito.autor}, ${local.credito.licenca}, via Wikimedia Commons.`);
  return item;
}

galeria.replaceChildren(...locais.map(criarCartao));
listaCreditos.replaceChildren(...locais.map(criarCredito));

dialogo.querySelector(".fechar-dialogo").addEventListener("click", () => dialogo.close());
dialogo.addEventListener("click", (evento) => {
  if (evento.target === dialogo) {
    dialogo.close();
  }
});

exibirMensagemDaVisita();
