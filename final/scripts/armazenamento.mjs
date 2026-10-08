// Coleção pessoal e preferências guardadas no localStorage do navegador.

const chaveColecao = "pcc-colecao";
const chavePreferencias = "pcc-preferencias";

function lerChave(chave, valorPadrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : valorPadrao;
  } catch {
    // Navegador em modo privado ou dado corrompido: segue com o valor padrão.
    return valorPadrao;
  }
}

function gravarChave(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

export function lerColecao() {
  const colecao = lerChave(chaveColecao, []);
  return Array.isArray(colecao) ? colecao : [];
}

export function estaGuardada(id) {
  return lerColecao().some((carta) => carta.id === id);
}

/** Guarda ou remove a carta e devolve true quando ela ficou guardada. */
export function alternarCarta(carta) {
  const colecao = lerColecao();
  const guardada = colecao.some((item) => item.id === carta.id);
  const nova = guardada
    ? colecao.filter((item) => item.id !== carta.id)
    : [...colecao, { ...carta, guardadaEm: Date.now() }];

  gravarChave(chaveColecao, nova);
  return !guardada;
}

export function removerCarta(id) {
  gravarChave(chaveColecao, lerColecao().filter((carta) => carta.id !== id));
}

export function limparColecao() {
  gravarChave(chaveColecao, []);
}

export function lerPreferencias() {
  return lerChave(chavePreferencias, { termo: "", tipos: [], colecoes: [], raridades: [], ordem: "recentes" });
}

export function salvarPreferencias(preferencias) {
  gravarChave(chavePreferencias, preferencias);
}

/** Totais por raridade, do mais frequente para o menos frequente. */
export function contarPorRaridade(colecao) {
  const totais = colecao.reduce((acumulado, carta) => {
    acumulado[carta.raridade] = (acumulado[carta.raridade] ?? 0) + 1;
    return acumulado;
  }, {});

  return Object.entries(totais).sort((a, b) => b[1] - a[1]);
}
