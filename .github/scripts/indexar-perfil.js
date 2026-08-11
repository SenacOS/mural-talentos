const STACKS_CONHECIDAS = [
  "Java",
  "JavaScript",
  "TypeScript",
  "Python",
  "C#",
  "C",
  "C++",
  "Go",
  "PHP",
  "Ruby",
  "Kotlin",
  "Swift",
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

const CONTRATACAO_PARA_LABEL = {
  "Estágio": "Estágio",
  "CLT": "CLT",
  "Freelance": "Freelance",
  "PJ": "PJ",
};

const CORES_LABEL_REGIME = {
  "Estágio": "c2e0c6",
  "CLT": "bfd4f2",
  "Freelance": "f9d0c4",
  "PJ": "fef2c0",
};

const MODALIDADE_PARA_LABEL = {
  "Remoto": "Remoto",
  "Híbrido": "Híbrido",
  "Presencial": "Presencial",
};

const CORES_LABEL_MODALIDADE = {
  "Remoto": "d4c5f9",
  "Híbrido": "c5def5",
  "Presencial": "f5c5e0",
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
  const usuarioGithub = issue.user.login;
  const linkedin = extrairCampo(body, "Link do LinkedIn");
  const curso = extrairCampo(body, "Curso");
  const stacksTexto = extrairCampo(body, "Linguagens de Programação");
  const stacksMarcadas = stacksTexto
    ? stacksTexto.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const contratacaoTexto = extrairCampo(body, "Contratação");
  const contratacaoMarcada = contratacaoTexto
    ? contratacaoTexto.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const modalidadeTexto = extrairCampo(body, "Alocação");
  const modalidadeMarcada = modalidadeTexto
    ? modalidadeTexto.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  core.info(`Perfil #${issue.number}: curso="${curso}", stacks=[${stacksMarcadas.join(", ")}]`);
  core.info(`Perfil #${issue.number}: contratacao=[${contratacaoMarcada.join(", ")}], modalidade=[${modalidadeMarcada.join(", ")}]`);

  for (const stack of STACKS_CONHECIDAS) {
    const estaMarcada = stacksMarcadas.includes(stack);
    try {
      await sincronizarStack({ github, owner, repo, issue, stack, estaMarcada, nomeCompleto, usuarioGithub, linkedin, contratacaoMarcada, modalidadeMarcada, core });
    } catch (erro) {
      core.warning(`Falha ao sincronizar stack "${stack}" para a issue #${issue.number}: ${erro.message}`);
    }
  }

  try {
    await sincronizarLabelsPorCampo({
      github,
      owner,
      repo,
      issue,
      valoresMarcados: contratacaoMarcada,
      mapaLabel: CONTRATACAO_PARA_LABEL,
      mapaCores: CORES_LABEL_REGIME,
      core,
    });
  } catch (erro) {
    core.warning(`Falha ao sincronizar labels de regime para a issue #${issue.number}: ${erro.message}`);
  }

  try {
    await sincronizarLabelsPorCampo({
      github,
      owner,
      repo,
      issue,
      valoresMarcados: modalidadeMarcada,
      mapaLabel: MODALIDADE_PARA_LABEL,
      mapaCores: CORES_LABEL_MODALIDADE,
      core,
    });
  } catch (erro) {
    core.warning(`Falha ao sincronizar labels de modalidade para a issue #${issue.number}: ${erro.message}`);
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

async function sincronizarStack({ github, owner, repo, issue, stack, estaMarcada, nomeCompleto, usuarioGithub, linkedin, contratacaoMarcada, modalidadeMarcada, core }) {
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
  if (contratacaoMarcada.length) linhas.push(`**Regime:** ${contratacaoMarcada.join(", ")}`);
  if (modalidadeMarcada.length) linhas.push(`**Modalidade:** ${modalidadeMarcada.join(", ")}`);
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

async function sincronizarLabelsPorCampo({ github, owner, repo, issue, valoresMarcados, mapaLabel, mapaCores, core }) {
  const todasLabelsPossiveis = new Set(Object.values(mapaLabel));
  const labelsDesejadas = new Set(
    valoresMarcados.map((valor) => mapaLabel[valor]).filter(Boolean)
  );

  const labelsAtuais = await github.paginate(github.rest.issues.listLabelsOnIssue, {
    owner,
    repo,
    issue_number: issue.number,
    per_page: 100,
  });
  // Só considera, entre as labels já aplicadas na issue, as que pertencem
  // ao conjunto de opções deste campo (evita mexer em labels de outros campos,
  // já que aqui não há mais prefixo pra diferenciar).
  const labelsDoCampoAtuais = labelsAtuais
    .map((l) => l.name)
    .filter((nome) => todasLabelsPossiveis.has(nome));

  for (const label of labelsDesejadas) {
    if (!labelsDoCampoAtuais.includes(label)) {
      await garantirLabelExiste({ github, owner, repo, label, cor: mapaCores[label], core });
      try {
        await github.rest.issues.addLabels({ owner, repo, issue_number: issue.number, labels: [label] });
        core.info(`Label "${label}" adicionada à issue #${issue.number}.`);
      } catch (erro) {
        core.warning(`Falha ao adicionar label "${label}" na issue #${issue.number}: ${erro.message}`);
      }
    }
  }

  for (const label of labelsDoCampoAtuais) {
    if (!labelsDesejadas.has(label)) {
      try {
        await github.rest.issues.removeLabel({ owner, repo, issue_number: issue.number, name: label });
        core.info(`Label "${label}" removida da issue #${issue.number} (opção desmarcada).`);
      } catch (erro) {
        core.warning(`Falha ao remover label "${label}" na issue #${issue.number}: ${erro.message}`);
      }
    }
  }
}

async function garantirLabelExiste({ github, owner, repo, label, cor, core }) {
  try {
    await github.rest.issues.getLabel({ owner, repo, name: label });
  } catch (erro) {
    if (erro.status !== 404) throw erro;
    try {
      await github.rest.issues.createLabel({
        owner,
        repo,
        name: label,
        color: cor || "ededed",
      });
      core.info(`Label "${label}" criada no repositório.`);
    } catch (erroCriacao) {
      core.warning(`Falha ao criar label "${label}": ${erroCriacao.message}`);
    }
  }
}
