const STACKS_CONHECIDAS = [
  "Java",
  "JavaScript",
  "TypeScript",
  "Python",
  "C#",
  "Go",
  "PHP",
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "Spring Boot",
  ".NET",
  "Django",
  "Flask",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Docker",
  "AWS",
];

const CURSO_PARA_TEAM_SLUG = {
  "Análise e Desenvolvimento de Sistemas": "dev-sistemas",
  "Ciência da Computação": "ciencia-comp",
  "Engenharia de Software": "eng-software",
  "Sistemas de Informação": "sistemas-info",
  "Banco de Dados": "banco-dados",
  "Redes de Computadores": "redes-computadores",
  "Gestão da Tecnologia da Informação": "gestao-ti",
  "Sistemas para Internet": "sistemas-internet",
  "Engenharia da Computação": "eng-computacao",
};

function extrairCampo(body, label) {
  const escapado = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`### ${escapado}\\s*\\n\\n([\\s\\S]*?)(?=\\n### |$)`);
  const match = regex.exec(body);
  if (!match) return "";
  const valor = match[1].trim();
  return valor === "_No response_" ? "" : valor;
}

module.exports = async ({ github, context, core }) => {
  const { owner, repo } = context.repo;
  const issue = context.payload.issue;
  const body = issue.body || "";

  const nomeCompleto = extrairCampo(body, "Nome completo");
  const usuarioGithub = extrairCampo(body, "Usuário do GitHub").replace(/^@/, "");
  const linkedin = extrairCampo(body, "Link do LinkedIn");
  const curso = extrairCampo(body, "Curso");
  const stacksTexto = extrairCampo(body, "Stacks / Tecnologias");
  const stacksMarcadas = stacksTexto
    ? stacksTexto.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  core.info(`Perfil #${issue.number}: curso="${curso}", stacks=[${stacksMarcadas.join(", ")}]`);

  for (const stack of STACKS_CONHECIDAS) {
    const estaMarcada = stacksMarcadas.includes(stack);
    try {
      await sincronizarStack({ github, owner, repo, issue, stack, estaMarcada, nomeCompleto, usuarioGithub, linkedin, core });
    } catch (erro) {
      core.warning(`Falha ao sincronizar stack "${stack}" para a issue #${issue.number}: ${erro.message}`);
    }
  }

  const teamSlug = CURSO_PARA_TEAM_SLUG[curso];
  if (!teamSlug) {
    core.warning(`Curso "${curso}" não mapeado para nenhum Team. Pulando convite.`);
    return;
  }
  if (!usuarioGithub) {
    core.warning(`Não foi possível identificar o usuário do GitHub na issue #${issue.number}. Pulando convite de Team.`);
    return;
  }

  try {
    await github.rest.teams.addOrUpdateMembershipForUserInOrg({
      org: owner,
      team_slug: teamSlug,
      username: usuarioGithub,
      role: "member",
    });
    core.info(`Convite/membership confirmado: @${usuarioGithub} -> team "${teamSlug}".`);
  } catch (erro) {
    core.warning(`Falha ao convidar @${usuarioGithub} para o team "${teamSlug}": ${erro.message}`);
  }
};

async function sincronizarStack({ github, owner, repo, issue, stack, estaMarcada, nomeCompleto, usuarioGithub, linkedin, core }) {
  const marcador = `<!-- perfil:#${issue.number} -->`;
  const tituloAgregadora = `Perfis - ${stack}`;

  const aggregatorIssue = await buscarOuCriarAgregadora({ github, owner, repo, titulo: tituloAgregadora });

  const comentarios = await github.paginate(github.rest.issues.listComments, {
    owner,
    repo,
    issue_number: aggregatorIssue.number,
    per_page: 100,
  });
  const comentarioExistente = comentarios.find((c) => c.body && c.body.includes(marcador));

  if (!estaMarcada) {
    if (comentarioExistente) {
      await github.rest.issues.deleteComment({ owner, repo, comment_id: comentarioExistente.id });
      core.info(`Removido de "${tituloAgregadora}": issue #${issue.number} (stack desmarcada).`);
    }
    return;
  }

  const linhas = [
    `**Nome:** ${nomeCompleto || "(não informado)"}`,
    `**GitHub:** ${usuarioGithub ? `@${usuarioGithub}` : "(não informado)"}`,
  ];
  if (linkedin) linhas.push(`**LinkedIn:** ${linkedin}`);
  linhas.push(`**Perfil:** #${issue.number}`);
  linhas.push("", marcador);
  const corpoComentario = linhas.join("\n");

  if (comentarioExistente) {
    if (comentarioExistente.body !== corpoComentario) {
      await github.rest.issues.updateComment({ owner, repo, comment_id: comentarioExistente.id, body: corpoComentario });
      core.info(`Atualizado em "${tituloAgregadora}": issue #${issue.number}.`);
    }
  } else {
    await github.rest.issues.createComment({ owner, repo, issue_number: aggregatorIssue.number, body: corpoComentario });
    core.info(`Adicionado em "${tituloAgregadora}": issue #${issue.number}.`);
  }
}

async function buscarOuCriarAgregadora({ github, owner, repo, titulo }) {
  const busca = await github.rest.search.issuesAndPullRequests({
    q: `repo:${owner}/${repo} in:title "${titulo}" type:issue`,
  });
  
  const existente = busca.data.items.find((i) => i.title === titulo);
  if (existente) return existente;

  const criada = await github.rest.issues.create({
    owner,
    repo,
    title: titulo,
    body: [
      `Lista automática de candidatos que declararam a stack **${titulo.replace("Perfis - ", "")}** em seu perfil.`,
      "",
      "Este comentário é atualizado automaticamente pelo workflow `indexar-perfil.yml`. Não edite os comentários manualmente.",
    ].join("\n"),
    labels: ["indice-stack"],
  });
  return criada.data;
}