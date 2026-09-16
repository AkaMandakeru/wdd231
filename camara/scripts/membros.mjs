// Membros da câmara: busca o JSON e monta o cartão de cada empresa
// (usado no diretório e nos destaques da página inicial)

import { criarElemento, criarLink } from "./utilitarios.mjs";

export const nomesNiveis = { 1: "Membro", 2: "Prata", 3: "Ouro" };

export async function buscarMembros() {
  const resposta = await fetch("dados/membros.json");
  if (!resposta.ok) {
    throw new Error(`HTTP ${resposta.status}`);
  }
  return resposta.json();
}

export function criarCartaoMembro(membro, tagTitulo = "h2") {
  const cartao = criarElemento("article", `membro nivel-${membro.nivel}`);

  const logo = criarElemento("img", "membro-logo");
  logo.src = `imagens/${membro.imagem}`;
  logo.alt = `Logotipo de ${membro.nome}`;
  logo.width = 120;
  logo.height = 120;
  logo.loading = "lazy";

  const identificacao = criarElemento("div", "membro-identificacao");
  identificacao.append(
    criarElemento(tagTitulo, "membro-nome", membro.nome),
    criarElemento("p", "membro-slogan", membro.slogan),
    criarElemento("p", "membro-nivel", nomesNiveis[membro.nivel])
  );

  const endereco = criarElemento("p", "membro-endereco");
  endereco.append(membro.endereco, document.createElement("br"), membro.cidade);

  const numeroTelefone = membro.telefone.replace(/\D/g, "");
  const contato = criarElemento("div", "membro-contato");
  const telefone = criarElemento("p", "membro-telefone");
  telefone.append(criarLink(`tel:+55${numeroTelefone}`, membro.telefone));
  const email = criarElemento("p", "membro-email");
  email.append(criarLink(`mailto:${membro.email}`, membro.email));
  contato.append(telefone, email);

  const site = criarElemento("p", "membro-site");
  const linkSite = criarLink(membro.site, membro.site.replace(/^https?:\/\/(www\.)?/, ""));
  linkSite.target = "_blank";
  linkSite.rel = "noopener";
  site.append(linkSite);

  cartao.append(logo, identificacao, endereco, contato, site);
  return cartao;
}
