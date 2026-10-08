// Página de ação do formulário: mostra o que foi enviado na lista de trocas.

const resumo = document.querySelector("#dadosEnviados");
const parametros = new URLSearchParams(window.location.search);

// Os valores vêm da barra de endereço, então nunca entram como HTML.
function escapar(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatarDataHora(valor) {
  const data = new Date(valor);
  return Number.isNaN(data.getTime())
    ? valor
    : data.toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });
}

const campos = [
  { chave: "nome", rotulo: "Nome" },
  { chave: "email", rotulo: "E-mail" },
  { chave: "cidade", rotulo: "Cidade" },
  { chave: "contato", rotulo: "Forma de contato" },
  { chave: "procura", rotulo: "Cartas que procura" },
  { chave: "novidades", rotulo: "Quer receber novidades", formatar: () => "Sim" },
  { chave: "total-cartas", rotulo: "Cartas na coleção" },
  { chave: "data-hora", rotulo: "Enviado em", formatar: formatarDataHora },
];

const preenchidos = campos.filter(({ chave }) => (parametros.get(chave) ?? "").trim());

if (preenchidos.length === 0) {
  resumo.innerHTML = `
    <div class="linha-envio">
      <dt>Nenhum dado recebido</dt>
      <dd>Preencha a lista de trocas na página Minha Coleção para enviá-la.</dd>
    </div>`;
} else {
  resumo.innerHTML = preenchidos
    .map(({ chave, rotulo, formatar }) => {
      const valor = parametros.get(chave).trim();
      return `
        <div class="linha-envio">
          <dt>${rotulo}</dt>
          <dd>${escapar(formatar ? formatar(valor) : valor)}</dd>
        </div>`;
    })
    .join("");
}
