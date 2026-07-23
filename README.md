# SenacOS · mural-talentos

Este é o repositório de **perfis de candidatos** da organização SenacOS — o espaço onde alunos se auto-declaram, através de um formulário estruturado, para serem encontrados por recrutadores.

> 💡 **`mural-talentos` x `mural-vagas` — qual a diferença?**
> O `mural-talentos` (aqui) guarda os **perfis dos candidatos** — quem procura oportunidade se declara aqui. O [`mural-vagas`](https://github.com/SenacOS/mural-vagas) guarda o caminho inverso: vagas publicadas por empresas. Se você é aluno buscando emprego, seu lugar é aqui. Se você é recrutador com uma vaga aberta, publique em `mural-vagas`.

## 📂 Índice

| Recurso | O que você encontra |
|---|---|
| [Criar perfil](../../issues/new/choose) | Formulário estruturado (Issue Form) para declarar seus dados, curso e stacks |
| Issues `Perfis - <Stack>` | Listas automáticas de candidatos por tecnologia — ponto de partida da busca de recrutadores |
| [`GUIA-DE-CONTRIBUICAO.md`](https://github.com/SenacOS/core/blob/main/GUIA-DE-CONTRIBUICAO.md) | Regras de membresia, Times por curso e demais convenções da organização |
| Categoria [Dúvidas](https://github.com/orgs/SenacOS/discussions/categories/duvidas) | Onde tirar dúvidas sobre preenchimento — Discussions estão desabilitadas neste repositório |

## 👤 Para candidatos — como criar seu perfil

1. Clique em **New Issue** e escolha o template **Perfil de Candidato**.
2. Preencha nome, usuário do GitHub, LinkedIn (opcional) e portfólio (opcional).
3. Selecione seu **curso** — isso também te adiciona automaticamente ao Team correspondente da organização.
4. Selecione todas as **stacks** que se aplicam a você. Cada uma marcada te inclui na respectiva issue agregadora `Perfis - <Stack>`, visível a recrutadores.
5. Editou o perfil depois e desmarcou uma stack? Sem problema — você é removido da issue agregadora correspondente automaticamente na próxima atualização.

> 🔒 **Nunca inclua CPF, endereço completo ou telefone pessoal.** Use apenas os campos de contato profissional indicados no formulário (GitHub, LinkedIn).

## 🔍 Para recrutadores — como buscar candidatos

- Abra a aba **Issues** e filtre pela label `indice-stack`, ou busque diretamente por `Perfis - <Nome da Stack>` (ex.: `Perfis - Java`) para ver todos os candidatos que declararam aquela tecnologia, com link direto para o perfil completo de cada um.
- Para ver todos os perfis sem filtro por stack, filtre pela label `perfil`.
- Cada perfil individual (a issue aberta pelo próprio candidato) traz o restante do contexto: disponibilidade, modalidade de trabalho e um resumo em texto livre.

---

*Este repositório não contém código de produção — apenas perfis de candidatos e a automação de indexação que os organiza.*