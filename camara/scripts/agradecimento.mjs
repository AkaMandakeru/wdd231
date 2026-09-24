// Página de agradecimento: lê os dados enviados pelo formulário (método get) e os exibe

import { criarElemento } from "./utilitarios.mjs";

const parametros = new URLSearchParams(window.location.search);
const resumo = document.querySelector("#resumoPedido");

function formatarDataHora(valor) {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    return valor;
  }
  return data.toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });
}

// Só os campos obrigatórios do formulário entram no resumo.
const camposObrigatorios = [
  { chave: "primeiro-nome", rotulo: "Nome" },
  { chave: "sobrenome", rotulo: "Sobrenome" },
  { chave: "email", rotulo: "E-mail" },
  { chave: "celular", rotulo: "Celular" },
  { chave: "organizacao", rotulo: "Organização" },
  { chave: "data-hora", rotulo: "Pedido preenchido em", formatar: formatarDataHora },
];

function criarLinha({ chave, rotulo, formatar }) {
  const valor = parametros.get(chave).trim();
  const linha = criarElemento("div", "resumo-linha");
  linha.append(
    criarElemento("dt", "resumo-rotulo", rotulo),
    criarElemento("dd", "resumo-valor", formatar ? formatar(valor) : valor)
  );
  return linha;
}

const faltando = camposObrigatorios.filter(({ chave }) => !parametros.get(chave)?.trim());

if (faltando.length === 0) {
  resumo.replaceChildren(...camposObrigatorios.map(criarLinha));
} else {
  const aviso = criarElemento(
    "p",
    "mensagem-status",
    "Não encontramos os dados do pedido. Preencha o formulário de associação para enviá-lo."
  );
  resumo.replaceWith(aviso);
}
