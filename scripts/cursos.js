// Cursos do certificado de Programação Web e Computacional.
// Altere "concluido" para true assim que terminar um curso.
const cursos = [
  {
    assunto: "CSE",
    numero: 110,
    titulo: "Introduction to Programming",
    creditos: 2,
    certificado: "Web and Computer Programming",
    descricao:
      "This course will introduce students to programming. It will introduce the building blocks of programming languages (variables, decisions, calculations, loops, array, and input/output) and use them to solve problems.",
    tecnologia: ["Python"],
    concluido: true,
  },
  {
    assunto: "WDD",
    numero: 130,
    titulo: "Web Fundamentals",
    creditos: 2,
    certificado: "Web and Computer Programming",
    descricao:
      "This course introduces students to the World Wide Web and to careers in web site design and development. The course is hands on with students actually participating in simple web designs and programming.",
    tecnologia: ["HTML", "CSS"],
    concluido: true,
  },
  {
    assunto: "CSE",
    numero: 111,
    titulo: "Programming with Functions",
    creditos: 2,
    certificado: "Web and Computer Programming",
    descricao:
      "CSE 111 students become more organized, efficient, and powerful computer programmers by learning to research and call functions written by others; to write, call, debug, and test their own functions; and to handle errors within functions.",
    tecnologia: ["Python"],
    concluido: true,
  },
  {
    assunto: "CSE",
    numero: 210,
    titulo: "Programming with Classes",
    creditos: 2,
    certificado: "Web and Computer Programming",
    descricao:
      "This course will introduce the notion of classes and objects. It will present encapsulation at a conceptual level. It will also work with inheritance and polymorphism.",
    tecnologia: ["C#"],
    concluido: false,
  },
  {
    assunto: "WDD",
    numero: 131,
    titulo: "Dynamic Web Fundamentals",
    creditos: 2,
    certificado: "Web and Computer Programming",
    descricao:
      "This course builds on prior experience in Web Fundamentals and programming. Students will learn to create dynamic websites that use JavaScript to respond to events, update content, and create responsive user experiences.",
    tecnologia: ["HTML", "CSS", "JavaScript"],
    concluido: true,
  },
  {
    assunto: "WDD",
    numero: 231,
    titulo: "Frontend Web Development I",
    creditos: 2,
    certificado: "Web and Computer Programming",
    descricao:
      "This course builds on prior experience with Dynamic Web Fundamentals and programming. Students will focus on user experience, accessibility, compliance, performance optimization, and basic API usage.",
    tecnologia: ["HTML", "CSS", "JavaScript"],
    concluido: false,
  },
];

const listaCursos = document.querySelector("#listaCursos");
const totalCreditos = document.querySelector("#totalCreditos");
const botoesFiltro = document.querySelectorAll(".filtro");

function criarCartaoCurso(curso) {
  const cartao = document.createElement("article");
  cartao.classList.add("cartao-curso");
  if (curso.concluido) {
    cartao.classList.add("concluido");
  }

  const codigo = document.createElement("h3");
  codigo.classList.add("codigo-curso");

  const sigla = document.createElement("span");
  sigla.textContent = `${curso.assunto} ${curso.numero}`;

  const selo = document.createElement("span");
  selo.classList.add("selo");
  selo.textContent = curso.concluido ? "✔ Concluído" : "Pendente";

  codigo.append(sigla, selo);

  const nome = document.createElement("p");
  nome.classList.add("nome-curso");
  nome.textContent = `${curso.titulo} · ${curso.creditos} créditos`;

  cartao.append(codigo, nome);
  return cartao;
}

function filtrarCursos(filtro) {
  if (filtro === "todos") {
    return cursos;
  }
  return cursos.filter((curso) => curso.assunto === filtro);
}

function somarCreditos(listaFiltrada) {
  return listaFiltrada.reduce((total, curso) => total + curso.creditos, 0);
}

function exibirCursos(filtro) {
  const selecionados = filtrarCursos(filtro);

  listaCursos.innerHTML = "";
  selecionados.forEach((curso) => {
    listaCursos.appendChild(criarCartaoCurso(curso));
  });

  totalCreditos.textContent = somarCreditos(selecionados);
}

botoesFiltro.forEach((botao) => {
  botao.addEventListener("click", () => {
    botoesFiltro.forEach((outro) => {
      const ativo = outro === botao;
      outro.classList.toggle("selecionado", ativo);
      outro.setAttribute("aria-pressed", ativo);
    });

    exibirCursos(botao.dataset.filtro);
  });
});

exibirCursos("todos");
