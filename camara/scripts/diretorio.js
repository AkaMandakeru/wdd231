// Diretório de membros: carrega dados/membros.json e alterna entre grade e lista

const urlMembros = "dados/membros.json";
const nomesNiveis = { 1: "Membro", 2: "Prata", 3: "Ouro" };

const containerMembros = document.querySelector("#membros");
const botaoGrade = document.querySelector("#botaoGrade");
const botaoLista = document.querySelector("#botaoLista");

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  elemento.className = classe;
  if (texto) {
    elemento.textContent = texto;
  }
  return elemento;
}

function criarLink(href, texto) {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = texto;
  return link;
}

function criarCartaoMembro(membro) {
  const cartao = criarElemento("article", `membro nivel-${membro.nivel}`);

  const logo = criarElemento("img", "membro-logo");
  logo.src = `imagens/${membro.imagem}`;
  logo.alt = `Logotipo de ${membro.nome}`;
  logo.width = 120;
  logo.height = 120;
  logo.loading = "lazy";

  const identificacao = criarElemento("div", "membro-identificacao");
  identificacao.append(
    criarElemento("h2", "membro-nome", membro.nome),
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

function exibirMembros(membros) {
  containerMembros.replaceChildren(...membros.map(criarCartaoMembro));
}

async function buscarMembros() {
  try {
    const resposta = await fetch(urlMembros);
    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }
    const membros = await resposta.json();
    exibirMembros(membros);
  } catch (erro) {
    containerMembros.replaceChildren(
      criarElemento(
        "p",
        "mensagem-status",
        "Não foi possível carregar o diretório de membros. Tente novamente mais tarde."
      )
    );
    console.error("Erro ao carregar os membros:", erro);
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

buscarMembros();
