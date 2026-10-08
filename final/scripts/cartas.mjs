// Página de resultados: filtros por tipo, coleção e raridade, ordenação e paginação.

import { colecoes, obterPagina, obterResultados, ordenacoes, raridades, tipos } from "./api.mjs";
import { lerPreferencias, salvarPreferencias } from "./armazenamento.mjs";
import { ligarGrade, montarGrade, mostrarMensagem, prepararDialogo } from "./componentes.mjs";

const formulario = document.querySelector("#filtros");
const campoTermo = document.querySelector("#termo");
const campoOrdem = document.querySelector("#ordem");
const grupoTipos = document.querySelector("#grupoTipos");
const grupoColecoes = document.querySelector("#grupoColecoes");
const grupoRaridades = document.querySelector("#grupoRaridades");
const botoesLimpar = document.querySelectorAll("#limparFiltros, #limparFiltrosVazio");
const grade = document.querySelector("#grade");
const aviso = document.querySelector("#avisoCartas");
const contagem = document.querySelector("#contagem");
const paginacao = document.querySelector("#paginacao");
const vazio = document.querySelector("#semResultados");

const porPagina = 15;
const estado = { itens: [], origem: "", pagina: 1, emExibicao: [] };

function caixas(grupo, nome, valores) {
  grupo.innerHTML = valores
    .map((valor, indice) => `
      <li>
        <label class="caixa" for="${nome}${indice}">
          <input type="checkbox" id="${nome}${indice}" name="${nome}" value="${valor}">
          <span>${valor}</span>
        </label>
      </li>`)
    .join("");
}

function montarFiltros() {
  caixas(grupoTipos, "tipo", tipos);
  grupoColecoes.innerHTML = colecoes
    .map((colecao, indice) => `
      <li>
        <label class="caixa" for="colecao${indice}">
          <input type="checkbox" id="colecao${indice}" name="colecao" value="${colecao.id}">
          <span>${colecao.nome}</span>
        </label>
      </li>`)
    .join("");
  caixas(grupoRaridades, "raridade", raridades);

  campoOrdem.innerHTML = Object.entries(ordenacoes)
    .map(([chave, { rotulo }]) => `<option value="${chave}">${rotulo}</option>`)
    .join("");
}

function marcados(nome) {
  return [...formulario.querySelectorAll(`input[name="${nome}"]:checked`)].map((caixa) => caixa.value);
}

const minimoDeLetras = 3;

function filtrosAtuais() {
  const digitado = campoTermo.value.trim();
  return {
    termo: digitado.length >= minimoDeLetras ? digitado : "",
    tipos: marcados("tipo"),
    colecoes: marcados("colecao"),
    raridades: marcados("raridade"),
    ordem: campoOrdem.value,
  };
}

function aplicarMarcacoes(nome, valores) {
  formulario.querySelectorAll(`input[name="${nome}"]`).forEach((caixa) => {
    caixa.checked = valores.includes(caixa.value);
  });
}

function restaurarEstadoInicial() {
  const preferencias = lerPreferencias();
  const termoDaUrl = new URLSearchParams(window.location.search).get("busca");

  campoTermo.value = termoDaUrl ?? preferencias.termo ?? "";
  campoOrdem.value = ordenacoes[preferencias.ordem] ? preferencias.ordem : "recentes";
  aplicarMarcacoes("tipo", preferencias.tipos ?? []);
  aplicarMarcacoes("colecao", preferencias.colecoes ?? []);
  aplicarMarcacoes("raridade", preferencias.raridades ?? []);
}

function descreverFiltros({ termo, tipos: t, colecoes: c, raridades: r }) {
  const partes = [];
  if (termo) {
    partes.push(`com "${termo}"`);
  }
  if (t.length > 0) {
    partes.push(`do tipo ${t.join(" ou ")}`);
  }
  if (r.length > 0) {
    partes.push(`de raridade ${r.join(" ou ")}`);
  }
  if (c.length > 0) {
    const nomes = c.map((id) => colecoes.find((colecao) => colecao.id === id)?.nome ?? id);
    partes.push(`em ${nomes.join(" ou ")}`);
  }
  return partes.join(", ");
}

function montarPaginacao(totalPaginas) {
  if (totalPaginas <= 1) {
    paginacao.innerHTML = "";
    paginacao.hidden = true;
    return;
  }

  const atual = estado.pagina;
  const numeros = new Set([1, totalPaginas, atual, atual - 1, atual + 1]);
  const visiveis = [...numeros].filter((n) => n >= 1 && n <= totalPaginas).sort((a, b) => a - b);

  let html = `<li><button class="pagina-botao" type="button" data-pagina="${atual - 1}" ${atual === 1 ? "disabled" : ""} aria-label="Página anterior">‹</button></li>`;
  let anterior = 0;
  visiveis.forEach((numero) => {
    if (numero - anterior > 1) {
      html += `<li><span class="pagina-reticencias">…</span></li>`;
    }
    html += `<li><button class="pagina-botao ${numero === atual ? "pagina-atual" : ""}" type="button" data-pagina="${numero}" ${numero === atual ? 'aria-current="page"' : ""}>${numero}</button></li>`;
    anterior = numero;
  });
  html += `<li><button class="pagina-botao" type="button" data-pagina="${atual + 1}" ${atual === totalPaginas ? "disabled" : ""} aria-label="Próxima página">›</button></li>`;

  paginacao.innerHTML = html;
  paginacao.hidden = false;
}

async function desenharPagina() {
  const total = estado.itens.length;
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  estado.pagina = Math.min(estado.pagina, totalPaginas);

  grade.setAttribute("aria-busy", "true");
  const cartas = await obterPagina(estado.itens, estado.origem, estado.pagina, porPagina);
  estado.emExibicao = cartas;
  montarGrade(grade, cartas);
  grade.removeAttribute("aria-busy");

  const primeira = (estado.pagina - 1) * porPagina + 1;
  const ultima = primeira + cartas.length - 1;
  contagem.textContent = total > 0
    ? `Resultados: ${total} ${total === 1 ? "carta" : "cartas"} · mostrando ${primeira} a ${ultima}`
    : "";
  montarPaginacao(totalPaginas);
}

// Sem nome e sem coleção marcada a API devolveria o catálogo inteiro, mais de
// 12 mil cartas e 1,4 MB, então a coleção mais recente entra como padrão.
function garantirLimite(filtros) {
  if (filtros.termo || filtros.colecoes.length > 0) {
    return filtros;
  }

  const primeira = formulario.querySelector('input[name="colecao"]');
  primeira.checked = true;
  return { ...filtros, colecoes: [primeira.value] };
}

async function buscar() {
  const filtros = garantirLimite(filtrosAtuais());
  const digitado = campoTermo.value.trim();
  salvarPreferencias(filtros);

  mostrarMensagem(aviso, "Carregando cartas…");
  vazio.hidden = true;
  paginacao.hidden = true;
  contagem.textContent = "";
  grade.innerHTML = "";

  const { itens, origem } = await obterResultados(filtros);
  estado.itens = itens;
  estado.origem = origem;
  estado.pagina = 1;

  if (origem === "erro") {
    mostrarMensagem(aviso, "Não foi possível carregar as cartas agora. Confira sua conexão e tente de novo.", "erro");
    return;
  }

  if (itens.length === 0) {
    aviso.hidden = true;
    vazio.hidden = false;
    vazio.querySelector(".texto-vazio").textContent = `Nenhuma carta ${descreverFiltros(filtros) || "encontrada"}.`;
    return;
  }

  if (origem === "reserva") {
    mostrarMensagem(aviso, "A API não respondeu, então estes resultados vêm do arquivo de reserva do site.");
  } else if (digitado.length > 0 && digitado.length < minimoDeLetras) {
    mostrarMensagem(aviso, `Digite pelo menos ${minimoDeLetras} letras para buscar pelo nome. Enquanto isso, mostramos a coleção escolhida.`);
  } else {
    aviso.hidden = true;
  }

  await desenharPagina();
}

prepararDialogo();
montarFiltros();
restaurarEstadoInicial();
ligarGrade(grade, (id) => estado.emExibicao.find((carta) => carta.id === id), () => {});

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  buscar();
});

formulario.addEventListener("change", (evento) => {
  if (evento.target.type === "checkbox") {
    buscar();
  }
});

// O seletor de ordenação fica no painel de resultados, fora do formulário de filtros.
campoOrdem.addEventListener("change", buscar);

botoesLimpar.forEach((botao) => {
  botao.addEventListener("click", () => {
    formulario.reset();
    campoTermo.value = "";
    campoOrdem.value = "recentes";
    buscar();
  });
});

paginacao.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-pagina]");
  if (!botao || botao.disabled) {
    return;
  }
  estado.pagina = Number(botao.dataset.pagina);
  desenharPagina();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

buscar();
