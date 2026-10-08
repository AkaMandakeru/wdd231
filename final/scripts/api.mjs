// Acesso à API TCGdex (em português) com reserva local para quando a API falha.

const base = "https://api.tcgdex.net/v2/pt";
const arquivoReserva = "dados/cartas-reserva.json";

export const colecoes = [
  { id: "sv10", nome: "Rivais Predestinados" },
  { id: "sv09", nome: "Amigos de Jornada" },
  { id: "sv08.5", nome: "Evoluções Prismáticas" },
  { id: "sv08", nome: "Fagulhas Impetuosas" },
  { id: "sv07", nome: "Coroa Estelar" },
  { id: "sv06", nome: "Máscaras do Crepúsculo" },
  { id: "sv05", nome: "Forças Temporais" },
  { id: "sv03", nome: "Obsidiana em Chamas" },
];

export const tipos = [
  "Água", "Dragão", "Elétrico", "Fada", "Fogo", "Incolor",
  "Lutador", "Metal", "Planta", "Psíquico", "Sombrio",
];

export const raridades = [
  "Comum", "Incomum", "Rara", "Rara Dupla", "Ultra Rara", "Ilustração Rara",
];

export const ordenacoes = {
  recentes: { rotulo: "Mais recentes", campo: "id", direcao: "DESC" },
  nome: { rotulo: "Nome (A-Z)", campo: "name", direcao: "ASC" },
  numero: { rotulo: "Número na coleção", campo: "localId", direcao: "ASC" },
};

const esperar = (milissegundos) => new Promise((resolver) => setTimeout(resolver, milissegundos));

// A API falha de vez em quando por um tropeço da CDN, então vale uma segunda tentativa
// antes de recorrer ao arquivo de reserva.
async function buscarJson(url, tentativas = 2) {
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error(`A API respondeu ${resposta.status}`);
    }
    return await resposta.json();
  } catch (erro) {
    if (tentativas > 1) {
      await esperar(500);
      return buscarJson(url, tentativas - 1);
    }
    throw erro;
  }
}

// Converte a resposta da API para o formato usado em todo o site.
function normalizar(carta) {
  return {
    id: carta.id,
    nome: carta.name,
    imagem: carta.image ?? "",
    numero: carta.localId ?? "",
    raridade: carta.rarity || "Sem raridade",
    categoria: carta.category || "",
    estagio: carta.stage || "",
    hp: carta.hp ?? null,
    tipos: carta.types ?? [],
    ilustrador: carta.illustrator || "Desconhecido",
    colecao: {
      id: carta.set?.id ?? "",
      nome: carta.set?.name ?? "",
      total: carta.set?.cardCount?.official ?? null,
    },
    ataques: (carta.attacks ?? []).map((ataque) => ({
      nome: ataque.name ?? "",
      custo: ataque.cost ?? [],
      dano: ataque.damage ?? null,
      efeito: ataque.effect ?? "",
    })),
  };
}

export function urlDaImagem(carta, qualidade = "low") {
  return carta.imagem ? `${carta.imagem}/${qualidade}.webp` : "";
}

// Como a API trata cada filtro (verificado contra a API em 2026-10-08):
// - vírgula funciona como "ou", mas comparando por trecho do texto;
// - por isso a raridade vai uma por requisição com "eq:", senão "Rara" traria "Ultra Rara";
// - e a coleção é conferida de novo aqui, senão "sv03" traria também "sv03.5".
function construirConsulta({ termo, colecoes: setsEscolhidos, tipos: tiposEscolhidos, raridade }) {
  const parametros = new URLSearchParams();

  if (termo) {
    parametros.set("name", `like:${termo}`);
  }
  if (setsEscolhidos.length > 0) {
    parametros.set("set", setsEscolhidos.join(","));
  }
  if (tiposEscolhidos.length > 0) {
    parametros.set("types", tiposEscolhidos.join(","));
  }
  if (raridade) {
    parametros.set("rarity", `eq:${raridade}`);
  }

  return `${base}/cards?${parametros}`;
}

function ordenar(itens, ordem, campoNome = "name", campoNumero = "localId") {
  const copia = [...itens];
  if (ordem === "nome") {
    return copia.sort((a, b) => a[campoNome].localeCompare(b[campoNome], "pt-BR"));
  }
  if (ordem === "numero") {
    return copia.sort((a, b) => String(a[campoNumero]).localeCompare(String(b[campoNumero]), "pt-BR", { numeric: true }));
  }
  return copia.sort((a, b) => b.id.localeCompare(a.id, "pt-BR", { numeric: true }));
}

function filtrarReserva(cartas, { termo, colecoes: setsEscolhidos, tipos: tiposEscolhidos, raridades: raridadesEscolhidas, ordem }) {
  const termoMinusculo = termo.toLowerCase();
  const filtradas = cartas
    .filter((carta) => !termo || carta.nome.toLowerCase().includes(termoMinusculo))
    .filter((carta) => setsEscolhidos.length === 0 || setsEscolhidos.includes(carta.colecao.id))
    .filter((carta) => tiposEscolhidos.length === 0 || carta.tipos.some((tipo) => tiposEscolhidos.includes(tipo)))
    .filter((carta) => raridadesEscolhidas.length === 0 || raridadesEscolhidas.includes(carta.raridade));

  return ordenar(filtradas, ordem, "nome", "numero");
}

/**
 * Busca a lista inteira de resultados de um filtro. É ela que dá a contagem
 * total e permite paginar sem ir à rede a cada troca de página.
 * Com a API, os itens vêm resumidos; com a reserva, já vêm completos.
 */
export async function obterResultados(filtros) {
  // Uma requisição por raridade marcada; sem raridade, uma só.
  const raridadesAlvo = filtros.raridades.length > 0 ? filtros.raridades : [null];

  try {
    const listas = await Promise.all(
      raridadesAlvo.map((raridade) => buscarJson(construirConsulta({ ...filtros, raridade })))
    );

    const porId = new Map();
    listas.flat().forEach((resumo) => {
      if (resumo.image) {
        porId.set(resumo.id, resumo);
      }
    });

    let itens = [...porId.values()];
    if (filtros.colecoes.length > 0) {
      itens = itens.filter((resumo) => filtros.colecoes.includes(resumo.id.split("-")[0]));
    }

    return { itens: ordenar(itens, filtros.ordem), origem: "api" };
  } catch {
    try {
      const reserva = await buscarJson(arquivoReserva);
      return { itens: filtrarReserva(reserva, filtros), origem: "reserva" };
    } catch {
      return { itens: [], origem: "erro" };
    }
  }
}

/** Monta uma página de cartas completas a partir da lista de resultados. */
export async function obterPagina(itens, origem, pagina, porPagina) {
  const fatia = itens.slice((pagina - 1) * porPagina, pagina * porPagina);

  if (origem !== "api") {
    return fatia;
  }

  const respostas = await Promise.allSettled(
    fatia.map((resumo) => buscarJson(`${base}/cards/${resumo.id}`))
  );

  return respostas
    .filter((resposta) => resposta.status === "fulfilled")
    .map((resposta) => normalizar(resposta.value));
}

/** Cartas sorteadas para os destaques da página inicial. */
export async function obterDestaques(quantidade = 4) {
  const colecaoSorteada = colecoes[Math.floor(Math.random() * colecoes.length)];

  try {
    // Uma página sorteada basta para os destaques e evita baixar a coleção inteira.
    const parametros = new URLSearchParams({
      set: colecaoSorteada.id,
      "pagination:page": String(1 + Math.floor(Math.random() * 8)),
      "pagination:itemsPerPage": String(quantidade),
    });
    const resumos = (await buscarJson(`${base}/cards?${parametros}`)).filter((resumo) => resumo.image);

    if (resumos.length === 0) {
      throw new Error("Página sorteada sem cartas");
    }

    const cartas = await obterPagina(resumos, "api", 1, quantidade);
    return { cartas, origem: "api", colecao: colecaoSorteada };
  } catch {
    const { itens, origem } = await obterResultados({ termo: "", colecoes: [], tipos: [], raridades: [], ordem: "recentes" });
    return { cartas: itens.slice(0, quantidade), origem, colecao: colecaoSorteada };
  }
}
