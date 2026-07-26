# SenacOS · mural-talentos

Este é o repositório de **perfis de candidatos** da organização SenacOS — o espaço onde alunos se auto-declaram, através de um formulário estruturado, para serem encontrados por recrutadores.

> 💡 **`mural-talentos` x `mural-vagas` — qual a diferença?**
> O `mural-talentos` (aqui) guarda os **perfis dos candidatos** — quem procura oportunidade se declara aqui. O [`mural-vagas`](https://github.com/SenacOS/mural-vagas) guarda o caminho inverso: vagas publicadas por empresas. Se você é aluno buscando emprego, seu lugar é aqui. Se você é recrutador com uma vaga aberta, publique em `mural-vagas`.

## 📂 Índice

| Recurso | O que você encontra |
|---|---|
| [Criar perfil](../../issues/new/choose) | Formulário estruturado (Issue Form) para declarar seus dados, curso e linguagens |
| [Acesso Rápido](https://github.com/SenacOS/mural-talentos/issues/55) | Issue fixada com atalhos diretos para cada issue agregadora `Perfis - <Linguagem>` |
| [Guia de navegação](https://github.com/SenacOS/mural-talentos/issues/41) | Issue fixada explicando a dinâmica de perfis, agregadoras e busca |
| `Perfis - <Linguagem>` | Listas automáticas de candidatos por linguagem de programação — ponto de partida da busca de recrutadores |
| [Guia de contribuição](https://github.com/SenacOS/core/blob/main/GUIA-DE-CONTRIBUICAO.md) | Regras de membresia, Times por curso e demais convenções da organização |
| Categoria [Dúvidas](https://github.com/orgs/SenacOS/discussions/categories/duvidas) | Onde tirar dúvidas sobre preenchimento — Discussions estão desabilitadas neste repositório |

## 👤 Para candidatos — como criar seu perfil

1. Clique em **New Issue** e escolha o template **Perfil de Candidato**.
2. Preencha nome completo, LinkedIn (opcional) e portfólio (opcional).
3. Selecione seu **curso** — isso também te adiciona automaticamente ao Team correspondente da organização.
4. Selecione todas as **linguagens de programação** que se aplicam a você. Cada uma marcada te inclui na respectiva issue agregadora `Perfis - <Linguagem>`, visível a recrutadores.
5. Editou o perfil depois e desmarcou uma linguagem? Sem problema — você é removido da issue agregadora correspondente automaticamente na próxima atualização.

> 🔒 **Nunca inclua CPF, endereço completo ou telefone pessoal.** Use apenas os campos de contato profissional indicados no formulário (LinkedIn, portfólio). Seu usuário do GitHub já é identificado automaticamente pela própria issue — não precisa informá-lo.

## 🔍 Para recrutadores — como buscar candidatos

- Comece pela issue fixada [**`[SenacOS] · Acesso Rápido`**](https://github.com/SenacOS/mural-talentos/issues/55) — ela linka direto para cada issue agregadora, sem precisar rolar a lista.
- Ou filtre a aba **Issues** pela label `indice-stack` para ver todas as agregadoras de uma vez, ou busque diretamente por `Perfis - <Nome da Linguagem>` (ex.: `Perfis - Java`).
- Para ver todos os perfis sem filtro por linguagem, filtre pela label `perfil`.
- Cada perfil individual (a issue aberta pelo próprio candidato) traz o restante do contexto: curso, disponibilidade, modalidade de trabalho e um resumo em texto livre.

---

*Este repositório não contém código de produção — apenas perfis de candidatos e a automação de indexação que os organiza. Mudanças na automação (Issue Form, workflow, script) exigem Pull Request revisado — a branch principal é protegida por ruleset.*
