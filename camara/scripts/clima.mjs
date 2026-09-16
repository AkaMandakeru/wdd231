// Tempo em Curitiba: condições atuais e previsão de 3 dias (API do OpenWeatherMap)

import { criarElemento } from "./utilitarios.mjs";

const chaveApi = "2db1afd579b90618f218556e784d580e";
const parametros = new URLSearchParams({
  lat: "-25.43",
  lon: "-49.27",
  units: "metric",
  lang: "pt_br",
  appid: chaveApi,
});
const urlTempoAtual = `https://api.openweathermap.org/data/2.5/weather?${parametros}`;
const urlPrevisao = `https://api.openweathermap.org/data/2.5/forecast?${parametros}`;
const diasPrevisao = 3;

const containerTempoAtual = document.querySelector("#tempoAtual");
const listaPrevisao = document.querySelector("#previsao");

async function buscarJson(url) {
  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error(await resposta.text());
  }
  return resposta.json();
}

const formatarTemperatura = (graus) => `${Math.round(graus)}°C`;
const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

// A API envia horários em UTC. Somando o fuso da cidade e lendo a data em UTC,
// obtemos o horário local de Curitiba, independentemente do fuso do visitante.
function dataLocal(segundosUtc, fusoSegundos) {
  return new Date((segundosUtc + fusoSegundos) * 1000);
}

function formatarHora(segundosUtc, fusoSegundos) {
  return dataLocal(segundosUtc, fusoSegundos).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function criarDetalhe(rotulo, valor) {
  const item = document.createElement("div");
  item.append(criarElemento("dt", "", rotulo), criarElemento("dd", "", valor));
  return item;
}

function exibirTempoAtual(dados) {
  const evento = dados.weather[0];

  // A descrição aparece em texto ao lado, então o ícone é decorativo (alt vazio).
  const icone = criarElemento("img", "tempo-icone");
  icone.src = `https://openweathermap.org/img/wn/${evento.icon}@2x.png`;
  icone.alt = "";
  icone.width = 100;
  icone.height = 100;

  const resumo = criarElemento("div", "tempo-resumo");
  resumo.append(
    criarElemento("p", "tempo-temperatura", formatarTemperatura(dados.main.temp)),
    criarElemento("p", "tempo-descricao", capitalizar(evento.description))
  );

  const principal = criarElemento("div", "tempo-principal");
  principal.append(icone, resumo);

  const detalhes = criarElemento("dl", "tempo-detalhes");
  detalhes.append(
    criarDetalhe("Máxima", formatarTemperatura(dados.main.temp_max)),
    criarDetalhe("Mínima", formatarTemperatura(dados.main.temp_min)),
    criarDetalhe("Umidade", `${dados.main.humidity}%`),
    criarDetalhe("Nascer do sol", formatarHora(dados.sys.sunrise, dados.timezone)),
    criarDetalhe("Pôr do sol", formatarHora(dados.sys.sunset, dados.timezone))
  );

  containerTempoAtual.replaceChildren(principal, detalhes);
}

// A previsão vem em intervalos de 3 horas: agrupa por dia local e guarda a máxima e a mínima.
function resumirPorDia(dados) {
  const fuso = dados.city.timezone;
  const dias = new Map();

  dados.list.forEach((item) => {
    const chave = dataLocal(item.dt, fuso).toISOString().slice(0, 10);
    const dia = dias.get(chave) ?? { chave, maxima: -Infinity, minima: Infinity };
    dia.maxima = Math.max(dia.maxima, item.main.temp_max);
    dia.minima = Math.min(dia.minima, item.main.temp_min);
    dias.set(chave, dia);
  });

  const hoje = dataLocal(Date.now() / 1000, fuso).toISOString().slice(0, 10);
  return [...dias.values()].filter((dia) => dia.chave > hoje).slice(0, diasPrevisao);
}

function rotuloDia(chave, indice) {
  if (indice === 0) {
    return "Amanhã";
  }
  const nomeDia = new Date(`${chave}T12:00:00Z`).toLocaleDateString("pt-BR", {
    weekday: "long",
    timeZone: "UTC",
  });
  return capitalizar(nomeDia);
}

function exibirPrevisao(dados) {
  const itens = resumirPorDia(dados).map((dia, indice) => {
    const temperaturas = criarElemento("span", "previsao-temperaturas");
    temperaturas.append(
      criarElemento("strong", "", formatarTemperatura(dia.maxima)),
      ` / ${formatarTemperatura(dia.minima)}`
    );

    const item = document.createElement("li");
    item.append(criarElemento("span", "previsao-dia", rotuloDia(dia.chave, indice)), temperaturas);
    return item;
  });

  listaPrevisao.replaceChildren(...itens);
}

export async function exibirTempo() {
  try {
    const [tempoAtual, previsao] = await Promise.all([
      buscarJson(urlTempoAtual),
      buscarJson(urlPrevisao),
    ]);
    exibirTempoAtual(tempoAtual);
    exibirPrevisao(previsao);
  } catch {
    const aviso = "Não foi possível carregar os dados do tempo agora.";
    containerTempoAtual.replaceChildren(criarElemento("p", "mensagem-status", aviso));
    listaPrevisao.replaceChildren(criarElemento("li", "mensagem-status", aviso));
  }
}
