# Lingo — estado em 2026-09-29

Vertical slice estilo Duolingo, montada do zero sobre o template do Expo.
**Rodando e validado** no Chromium (ver "Validado em runtime").

## O que existe

**Avatar (`src/components/avatar.tsx`)** — reescrito na técnica do TAMI
(`/root/tami/index.html:291-325`): `View` + `LinearGradient` em vez de SVG com path
desenhado à mão. A piscada encolhe o próprio olho com `scaleY`, então não existe
pálpebra para alinhar — que era exatamente o bug do rework no Pulsa. Tem humores
(`mood`: `idle`/`sleep`/`happy`/`sad`) — ver "Humores do avatar" abaixo.

**Um avatar por idioma** (`src/constants/languages.ts`) — 6 idiomas, cada um com
esfera, adereço (emoji) e bochecha próprios:

| idioma | esfera | adereço |
|---|---|---|
| en | rosa → violeta | 🎀 |
| es | azul claro | 🧢 |
| fr | creme → vermelho | 🎩 |
| de | azul → lima | 🎓 |
| it | turquesa | 🍕 |
| ja | rosa → vinho | 🌸 |

**Conteúdo** — 6 idiomas com 1 unidade cada, 3 lições + 1 prova, 5 tipos de
exercício (`choice`, `translate`, `fill`, `match`, `listen`). 198 exercícios no
total. Inglês em `src/constants/content.ts`; os outros 5 em `content-es.ts`,
`content-fr.ts`, `content-de.ts`, `content-it.ts` e `content-ja.ts`.

**Lições sorteiam de um banco** — `perSession`: as lições 1 e 3 de cada idioma
têm `exercises` com 10-14 itens e sorteiam 10 (`drawSession`) em vez de repetir
uma sequência fixa; sem `perSession`, os exercícios saem na ordem escrita. O
sorteio acontece na abertura da tela (`drawSession`), não dentro do
`ExercisePlayer`, senão a ordem mudaria a cada re-render e o `index` pararia de
bater.

**Progresso (`src/lib/progress.ts`)** — AsyncStorage, com streak e
`streakBest`. `touchStudy` só avança o streak se for o dia seguinte.

**Telas** — o `_layout` raiz é um `Stack`: `lesson/[id]` e `exam/[id]` rodam o
`ExercisePlayer` e `result` mostra o placar, todos fora das abas para não prender
a navegação de exercício. O grupo `(tabs)` tem `_layout` próprio com `NativeTabs`
(`app-tabs`): `index` é o mapa e `languages` a lista de idiomas.

**`ExercisePlayer`** — barra de progresso, um exercício por vez, feedback
imediato (verde/vermelho + resposta certa), botão "Continuar" que só aparece
depois de responder. `listen` fala sozinho ao entrar (via `expo-speech`).
`match` é pareamento de verdade: toca na esquerda, depois na direita.

## Validado em runtime (2026-09-29, no Chromebook)

Rodou de ponta a ponta no Chromium: mapa renderiza, os 6 avatares aparecem
com os adereços certos, o relógio mostra a hora e o fuso, a lição abre, os 5
tipos de exercício respondem, o feedback imediato funciona, a prova roda e a
tela de resultado mostra "Perfeito!", e o progresso persiste (bolinha vira ✓,
streak sobe).

### Bug encontrado rodando (não pegava no typecheck)

O mapa carregava o progresso só no mount (`useEffect`). A lição gravava no
AsyncStorage e voltava com `router.back()`, que **não remonta** a tela — então
o mapa ficava com o estado velho para sempre: a lição terminava certa, mas a
bolinha nunca virava ✓ e o streak não subia.

Corrigido trocando por `useFocusEffect`, que revalida a cada ganho de foco.
**O typecheck passava limpo com esse bug presente.** Erro de lógica não aparece
em checagem de tipo; só aparece quando alguém faz a lição e olha o resultado.

## Feito depois do estado de 2026-09-29

- **Vidas/coração** — 3 por sessão (`MAX_HEARTS`). Errar desconta; zerar encerra a
  lição sem contá-la como concluída.
- **XP e meta diária** — `addXp`, `XP_PER_CORRECT` e `DAILY_GOAL`; o mapa mostra
  `⭐ XP` e a barra "Meta de hoje", e a tela de resultado mostra o XP da prova.
- **Repetição espaçada (nível 3)** — `REVIEW_STEPS` (5 min, 1 dia, 3 dias),
  `recordAnswer`, `isDue` e `reviewKey`; `buildSession` põe os exercícios vencidos
  na frente do sorteio.
- **Lint, testes e CI** — `eslint.config.js`, `test/content.test.ts`, validador de
  conteúdo e `.github/workflows/ci.yml` (typecheck + lint + test no Node 22).

## Pendências

- `package-lock.json` já foi revisto (ver seção própria): **555 dependências de
  produção sem `resolved`/`integrity`** e binários por plataforma desalinhados.
  Consertar exige regenerar o lock com Node ≥ 22.13 — ver os três motivos em
  que não foi feito.
- Áudio do japonês depende de voz instalada no `expo-speech`; não confirmado em
  hardware real.
- Lições 2 embaralham, mas o banco continua com os mesmos 6 itens (não há
  exercício novo para sortear). Bancos maiores exigem traduzir conteúdo novo
  nos 6 idiomas — decidir antes se vale o risco.

## Bugs de conteúdo achados rodando (2026-09-29, tarde)

Todos introduzidos no mesmo dia. Os 3 primeiros nos 5 idiomas novos;
os 4 últimos na navegação, que era compartilhada por todos. **Nenhum pegava no
typecheck** — passavam com TS limpo. Só apareceram porque o app foi rodado.

1. **55 exercícios de `translate` ao contrário** — o `from` estava escrito no
   idioma alvo, então pedia "traduza para espanhol" em cima de `¡Hola!`.
   Corrigido: o `from` é sempre português. No japonês o `from` continua em kana
   de propósito (ler kana é o exercício essencial e não dá para digitar kana no
   teclado), com o novo campo opcional `label` trocando o texto para
   "leia em romaji".

2. **21 exercícios de `choice` entregavam a resposta** — o enunciado estava
   no idioma estrangeiro *e* continha a opção correta
   (`¿Cómo se dice "buenos días"?` com a opção `buenos días`). Agora o
   enunciado pergunta em português a partir do significado
   (`Como você diz "bom dia" em espanhol?`).

3. **2 `fill` impossíveis de acertar** — `answer: ''`. `checkAnswer` rejeita
   entrada vazia, então nunca dava certo. Achados por script, não a olho.

4. **Lição travada na última tela** — `router.back()` depende de existir uma
   tela anterior na pilha. Aberta sem histórico (F5 na URL), o React
   Navigation dispara "The action 'goBack' was not handled by any navigator" e
   a lição ficava presa. Agora a saída é sempre explícita, `router.replace` para
   o mapa com o idioma. Não sobrou nenhum `router.back()` no app.

5. **Botão ✕ concluía a lição** — chamava `onFinish`, o mesmo callback do fim,
   então sair depois do primeiro exercício marcava a lição como feita. Agora tem
   `onExit` próprio, que só sai.

6. **Idioma selecionado não sobrevivia ao F5** — o chip do mapa mudava só o
   estado local, e a URL continuava `?lang=en`, então recarregar voltava para o
   inglês. Agora o chip grava com `router.setParams`; a URL é a fonte da verdade
   nas duas telas.

7. **Lição reaproveitava o estado da anterior** — o `ExercisePlayer` guarda
   `index`/`given`/`linked` em estado local e o React reaproveita a instância
   entre `/lesson/en-u1-l2` e `/lesson/fr-u1-l2`, então a francesa abria no
   índice que a inglesa deixou. Agora leva `key` por id de lição/prova.

## Bugs remanescentes (2026-10-15)

Revisão dos 7 bugs acima contra o código atual. Os de navegação (4–7) seguem
corrigidos. O bug 2, porém, tinha sobrado em 2 exercícios: a correção de
2026-09-29 reescreveu os `pool`, e os arrays `exercises` (a ordem canônica da
primeira vez da lição) ficaram para trás.

- **`fr-u1-l3` `e2`** — o enunciado era `"Je viens du Brésil" veut dire…` (em
  francês) e a opção certa era o próprio `Je viens du Brésil`. Reescrito no
  padrão do `p4`: pergunta em português e opções de significado em português.
- **`ja-u1-l1` `e1`** — o enunciado se contradizia:
  `「おはようございます」は?|Qual destas frases é a boa-noite?` com resposta
  `おはようございます` (bom dia). Trocado pelo padrão do `p1`, só em português.

Mais 2 defeitos achados na revisão, nenhum deles entre os 7 originais:

- **O `|` aparecia literal na tela** — o player renderizava `exercise.prompt`
  cru, então os 11 enunciados de japonês no formato `「kana」…?|português`
  mostravam a barra. Agora `renderPrompt` divide no `|`: a primeira parte vira o
  enunciado e a segunda, uma linha menor (`promptSub`).
- **`match` sempre dizia "inglês ↔ português"** — o rótulo era fixo, até em
  es/fr/de/it/ja. Agora usa o nome do idioma da lição.

Também removido um `accept` duplicado (`['burajiru', 'burajiru']`) em `ja-u1-l3`.

O validador passou a reportar **0 problemas** nos 168 exercícios.

## Varredura dos 6 idiomas (2026-10-15)

Revisão de todos os idiomas além do que o validador já pega.

- **"Se favor"** aparecia como tradução de "por favor" no par do `match` de
  `es-u1-l1`, `fr-u1-l1`, `de-u1-l1` e `it-u1-l1` — o inglês já estava certo
  (`Please → Por favor`). "Se favor" não existe em pt-BR: é o "se" do
  espanhol/italiano vazando. Trocado por "Por favor".
- Em `it-u1-l1` `p3` o mesmo erro estava no enunciado: `E "se favor"?` virou
  `E "por favor"?`.
- **`fr-u1-l1` estava inconsistente com "boa tarde"**: `p2` respondia `bonne
  soirée` e `p5` traduzia para `bonsoir`. Alinhado — `p2` agora responde
  `bonsoir` (o par `Bonne soirée` continua existindo no `fill` `p10`).

O validador ganhou uma regra nova (palavra de outro idioma no lado em
português) e segue reportando **0 problemas**.

## Navegação e código morto (2026-10-15)

Achados numa revisão de navegação/código, nenhum pego pelo typecheck.

- **Faltava `(tabs)/_layout.tsx`** — o grupo `(tabs)` tinha só `index` e
  `languages`, sem layout. Sem esse arquivo o grupo não vira navegador: não havia
  barra de abas, a tela **Idiomas (`/languages`) era inalcançável** (nada
  navegava até ela) e `AppTabs` ficava órfão. O `<Stack.Screen name="(tabs)" />`
  do root apontava para uma rota que não existia. Recriado como
  `src/app/(tabs)/_layout.tsx`, reexportando o `AppTabs` — restaura as abas
  "Mapa" e "Idiomas".
- **Código morto do template removido** — `src/components/hint-row.tsx`,
  `src/components/web-badge.tsx` e `src/components/ui/collapsible.tsx` não eram
  importados por ninguém. O cluster que o `AppTabs` usa (`external-link`,
  `themed-text`, `themed-view`, `use-theme`, `use-color-scheme`, `theme`) fica.
- **`drawSession` recalculado a cada render** — em `lesson/[id].tsx` o sorteio
  estava inline no JSX (`exercises={drawSession(lesson)}`). Como o `key` é
  estável durante a lição, um re-render **não remonta** o player mas reembaralha
  a lista, podendo trocar o exercício no meio da sessão (contrariando o
  comentário original). Passou para `useMemo` (a busca da lição também).

## Padronização do inglês (2026-10-15)

Os 5 idiomas novos seguem o mesmo formato: l1 = 4 exercícios + `pool` +
`perSession: 10`; l2 = 6 exercícios fixos; l3 = 3 exercícios + `pool` +
`perSession: 10`. O inglês destoava — l2 tinha 4 e l3 tinha 4 fixos, sem `pool`.

- **`en-u1-l2` foi de 4 para 6**: acrescentado o `fill` `My ___ is Ana.` →
  `name` e um `choice` novo (significado de "prazer em conhecê-lo" →
  `nice to meet you`); o `match` foi de 3 para 4 pares.
- **`en-u1-l3` foi de 4 fixos para 3 + `pool` de 11** com `perSession: 10`
  (mesmo formato de `es-u1-l3`): os 3 canônicos (fill/choice/listen) ficam em
  `exercises` e ganharam um banco com fill, `choice` de significado, traduções,
  `listen` e o `match` que sobrou.

O validador foi de 168 para 177 exercícios e segue com **0 problemas**.

## Robustez e ferramentas (2026-10-15)

- **Escritas serializadas no `progress.ts`** — antes, cada operação fazia
  `loadProgress()` → alterar → `save()`. Como o player dispara um
  `recordAnswer` por exercício, duas respostas rápidas podiam ler o mesmo estado
  e a última escrita apagava a outra (**lost update** silencioso). Agora toda
  mutação passa por uma fila (`update`), então nunca há duas operações
  intercaladas. `touchStudy`/`addXp`/`completeLesson`/`completeExam` viraram
  composições de funções puras (`withStudy`) para não deadlockar dentro da fila.
- **Validador de conteúdo movido para o repo** (ver seção abaixo).
- **`engines` no `package.json`** — `node >=20.19.4`. Com Node 18 o Expo SDK 57
  morre com `configs.toReversed is not a function`, erro que não aponta para a
  causa; agora o `npm` avisa antes.

## Lógica de jogo e paleta (2026-10-16)

- **`src/lib/quiz.ts`** — a lógica que estava presa dentro do `ExercisePlayer`
  (`isAnswerCorrect`, `linkPair`, `isMatchComplete`, `loseHeart`/`MAX_HEARTS`,
  `nextStep`) virou funções puras, cobertas por `test/quiz.test.ts`. O componente
  só chama essas funções e guarda o estado. Antes, a regra de vidas/placar só dava
  para testar montando a tela inteira.
- **Paleta `INK`** — `exercise-player`, `index`, `languages`, `result`,
  `local-clock` e o `_layout` trocaram os literais (`#12101a`, `#7C5CFF`…) pelas
  chaves de `INK` (`@/constants/theme`). Cores que não existem no `INK`
  (`#FFD166`, `#2a2142`, `#6f6880`, `#9a92ad`, `#c9c2d8`) continuam literais.

## Acessibilidade, limpeza e ambiente (2026-10-16)

- **Acessibilidade no player e no mapa** — a barra de progresso e a meta diária
  viraram `accessibilityRole="progressbar"` com `accessibilityValue`; as opções e
  os chips do `match` ganharam `accessibilityState` (`selected`/`disabled`); o
  contador de vidas tem `accessibilityLabel` ("2 de 3 vidas"). Depois de
  responder, o foco do leitor de tela vai para o botão "Continuar"
  (`findNodeHandle` + `AccessibilityInfo.setAccessibilityFocus`) e o rótulo do
  botão já carrega o resultado ("Quase! <resposta>. Continuar"), então o feedback
  e o avanço ficam num único passo. Na web o `setAccessibilityFocus` é no-op.
- **Campo `to` removido do `translate`** — era dado morto: aparecia em ~78
  lugares e nunca era lido (nem no render, nem no validador). Saiu do tipo em
  `content.ts` e dos 6 arquivos de conteúdo; o teste que o usava foi corrigido.
- **`react-native-svg` removido** — estava no `package.json` sem nenhum uso em
  `src`. `npm uninstall` tirou ele e 12 dependências exclusivas (css-select,
  css-tree, domhandler…); o lockfile caiu 154 linhas.
- **`engines` corrigido para `node >=22.13.0`** — era `>=20.19.4`, mas o Expo SDK
  57 exige Node 22.13.x no mínimo (tabela oficial dos docs versionados). O CI já
  usa Node 22.
- **CI vermelho consertado** — o `verify` falhava no typecheck desde o commit
  `dcc039e` (nos 3 commits seguintes também). Causa: `expo-env.d.ts` (que faz
  `/// <reference types="expo/types" />`, onde o Expo declara `*.css`/`*.module.css`)
  está no `.gitignore`, então um checkout limpo não o tem e o `tsc` quebrava em
  `theme.ts` (`@/global.css`) e `animated-icon.web.tsx`. Em vez de commitar o
  arquivo gerado, o `expo/types` entrou em `compilerOptions.types` do
  `tsconfig.json` — resolve com ou sem o `expo-env.d.ts` presente.
- **`npm audit` (2026-10-16)** — acusa 32 vulnerabilidades (1 crítica, 20 altas,
  11 moderadas). Todas transitivas do **toolchain de build** (`metro`,
  `@expo/cli`, `@expo/metro-config`, `shell-quote`, `braces`, `@react-native/*-cli-plugin`),
  não do código que vai no bundle. As diretas (`expo`, `react-native`,
  `react-native-reanimated`, `react-native-worklets`, `expo-router`,
  `expo-splash-screen`) apontam para dependências dessas ferramentas. Não vale
  `npm audit fix --force`: mexeria nas versões presas pelo Expo SDK 57. A
  correção vem com atualização do SDK.

## XP parcial e revisão de acertos (2026-10-16)

- **XP parcial ao zerar as vidas** — antes, o `ExercisePlayer` só premiava no
  `onFinish` (fim normal). Ao morrer, o CTA chamava `onExit`, que descartava o XP
  do que já tinha sido acertado. Agora o player tem um `onDead(score)` próprio:
  ao morrer, a lição chama `addXp(correct * XP_PER_CORRECT)` (sem
  `completeLesson`) e volta ao mapa; a prova faz o mesmo (sem `completeExam`).
  Sair pelo X continua sem creditar nada.
- **`src/lib/review.ts`** — a revisão espaçada saiu de `progress.ts` para um
  módulo puro (`applyAnswer`, `isDueAt`, `REVIEW_STEPS`, `Review`), coberto por
  `test/review.test.ts`. `progress.ts` só importa e reexporta.
- **Acerto de primeira agora entra na revisão** — o `recordAnswer` antigo tinha
  `if (!existing) return current`, então o primeiro acerto nunca era agendado: só
  o que se errava voltava. Agora o primeiro acerto entra no passo 1 (revisa em
  1 dia); acertos seguintes avançam (3 dias) até o item sair da fila. Errar
  reinicia no passo 0 (5 min). Total de testes foi de 18 para 25.

## Humores do avatar (2026-10-16)

O avatar tinha dois booleanos soltos (`blink` e `asleep`), que só davam conta de
"piscando" e "dormindo". Virou um único `mood` (`idle`/`sleep`/`happy`/`sad`),
mantendo o `blink` para ligar/desligar a piscada do `idle`:

- **`idle`** — olho aberto (1) e piscada de sempre; é o padrão.
- **`sleep`** — olho quase fechado (0.12), boca parada. Usado no mapa quando o
  streak está em 0 (antes: `asleep`).
- **`happy`** — olho na meia-lua (0.5), boca maior e um pulinho curto (`bounce`
  com `withSequence`). Usado no resultado perfeito e na resposta certa.
- **`sad`** — olho aberto, boca virada para baixo (borda de cima em vez da de
  baixo). Usado no resultado ruim e na resposta errada.

Só o `idle` pisca (`withRepeat`); os outros humores seguram a pose. O brilho do
olho (`glint`) some em `sleep`/`happy`, que são olhos fechados. O `result.tsx`
passou a escolher `happy`/`idle`/`sad` conforme acerto/perfeição, o `index.tsx`
usa `sleep` quando não há streak, e o `exercise-player` reage a cada resposta.
Continua sendo mudança visual: **não validada em dispositivo**, só no tipo/lint.

## Recompensa diária (2026-10-16)

"Baú" de XP do dia, inspirado no Duolingo. A lógica ficou pura em
`src/lib/reward.ts`, coberta por `test/reward.test.ts` (total de testes: 31).

- **`rewardFor(streak)`** — quanto o baú vale: `10 XP` de base + `5 XP` por dia
  de streak, com teto de `50 XP`. Nunca é negativo.
- **`canClaimReward(state, day)`** — só libera **depois de estudar no dia**
  (`lastStudied === hoje`, o que também evita farmar streak abrindo o app) e
  **uma vez por dia** (`lastReward !== hoje`).
- **`Progress.lastReward`** — novo campo (YYYY-MM-DD do último resgate). O
  `loadProgress` já mescla com o `emptyProgress`, então progresso antigo (sem o
  campo) cai em `null` sozinho.
- **`claimDailyReward()`** — num único passo da fila, credita o XP do dia, marca
  `lastReward` e devolve `{ progress, xp }`. **Não** avança o streak: o resgate
  depende do estudo, não o contrário. Se já foi resgatado hoje, devolve `xp: 0`.
- **`rewardState(progress)`** — `ready` / `claimed` / `locked`, para a tela
  inicial escolher texto e cor.
- **`addXp`** foi refatorado sobre um `addToDay` (soma ao dia sem mexer no
  streak), reusado pelo resgate.
- Na tela inicial (`index.tsx`) o card 🎁 fica destacado (borda dourada) quando
  `ready`, mostra "✅ … resgatado" quando `claimed` e "Estude hoje para abrir"
  quando `locked`. Tudo com `accessibilityLabel`/`accessibilityState`.
- `#FFD166` virou `INK.gold` (era literal repetido em `index.tsx` e `result.tsx`).

Como os humores do avatar, isto é sobretudo UI: o que dá para garantir é a
lógica pura (testes) e o tipo; **a aparência não foi validada em dispositivo**.

## Limpeza do modelo de conteúdo (2026-10-16)

O modelo tinha dois arrays por lição: `exercises` (a "ordem canônica") e `pool`
(o banco). Mas o `drawSession` só usava o `pool` quando ele existia, então, nas
lições sorteáveis, o `exercises` **nunca era apresentado** — só alimentava a
revisão espaçada (`allExercises`), gerando dois itens de revisão para a mesma
pergunta (um com id `e…`, outro com id `p…`). Boa parte do `exercises` era
duplicata exata do `pool`.

- **`pool` removido** — a lição agora tem só `exercises` (o banco) e, quando
  quer sorteio, `perSession`. `drawSession` embaralha `exercises` e pega
  `perSession`; sem `perSession`, usa `exercises` na ordem. `allExercises` sumiu
  (virou `lesson.exercises`, usado direto no `buildSession`).
- **Conteúdo fundido** — em cada lição sorteável, o `pool` virou o `exercises` e
  o array antigo saiu. Os 6 exercícios que **não** eram duplicata foram
  preservados: o `hint` do `en-u1-l1` foi para o `p4`; entraram como item novo o
  `listen` "Buenas noches" (`es-u1-l1` `p14`), o `translate` "Oi!"
  (`fr-u1-l1` `p14`), o `choice` de significado do `de-u1-l3` (`p11`) e do
  `it-u1-l3` (`p11`), e o `listen` `こんばんは` (`ja-u1-l1` `p14`).
- **Validador ganho uma regra** — exercícios de mesmo conteúdo na mesma lição
  (id zerado na comparação) são reportados. É o que garante que a fusão não
  deixou repetido; segue **0 problemas** nos 6 idiomas.

Sem mudança de comportamento visível: o que era sorteado (o `pool`) continua
sendo; some só o dado duplicado/morto. `tsc` limpo, `npm test` **31/31**, lint
sem erros.

## Tela de revisão (2026-10-16)

A repetição espaçada existia, mas só aparecia se a pessoa reabrisse a lição
(o `buildSession` põe os vencidos na frente do sorteio). Agora tem um lugar
próprio, que junta os vencidos de todas as lições **e provas** do idioma.

- **`src/lib/review-queue.ts`** — `dueItems(language, reviews, now)` devolve
  `{ containerId, exercise }[]` de tudo que venceu. Pura (recebe `reviews` e
  `now`), coberta por `test/review-queue.test.ts`. Percorre lições e a prova de
  cada unidade; só entra o que **já tem** revisão agendada (`isDueAt` devolve
  `false` para revisão inexistente, então nunca foi respondido = não vence).
- **`reviewKey` mudou de casa** — saiu de `progress.ts` para `review.ts` (é
  pura), e `progress.ts` reexporta. Assim a fila de revisão não precisa importar
  `progress.ts` (que carrega `AsyncStorage`) só para montar a chave.
- **`src/app/review/[id].tsx`** — roda o mesmo `ExercisePlayer`. O id de cada
  item da sessão vira a **própria chave de revisão** (`container#exercise`), que
  é única entre lições/provas; assim o `onResult` reagenda sem precisar carregar
  de volta de qual lição era. A sessão embaralha e corta em 20 itens
  (`REVIEW_MAX`) para não virar uma lição sem fim.
- **Terminar a revisão credita XP** (`addXp(correct * XP_PER_CORRECT)`, que
  também marca o dia para o streak), mas **não** conclui lição nem prova. Morrer
  no meio credita o XP parcial, igual às lições. Tela vazia (nada vencido) tem um
  "Nada para revisar agora" + botão de volta.
- **`dueItems` prioriza o atraso** — cada item carrega o `due` e volta do mais
  atrasado para o menos. A tela **corta antes de embaralhar**: os escolhidos são
  sempre os mais urgentes, e só a ordem da sessão é sorteada (para não decorar a
  sequência). Antes o embaralho vinha antes do corte, então podia passar por
  cima do item mais atrasado.
- **Card no mapa** — ao lado da recompensa: mostra "N revisão(ões) para treinar
  de novo" e fica destacado (borda violeta) quando há item vencido; com tudo em
  dia, aparece apagado ("Tudo em dia"). Rota registrada no `Stack` raiz.

`tsc` limpo, `npm test` **37/37**, lint sem erros. Como o resto da UI, **não foi
validado em dispositivo**; o que dá para garantir é a fila (testes) e o tipo.

## Revisão do `package-lock.json` (2026-10-16)

Pendência fechada: análise linha a linha do lockfile e do `node_modules`.

### O que está saudável

- `lockfileVersion: 3` (formato moderno, npm 7+), 928 nós, sem a chave legada
  `dependencies`.
- **O lock bate exatamente com o `package.json`**: `packages[""]`
  `dependencies`/`devDependencies` idênticos (`0` de diferença) e
  name/version iguais. As 31 diretas têm versão do lock = versão instalada.
- **`resolved` limpos**: os 373 que existem apontam todos para
  `registry.npmjs.org` — `0` fora de lá, `0` sem `integrity`, `0` com
  `file:`/`link:`/`git:`.
- `npm ls` e `npm ls --depth=0` saem com **exit 0** (sem `missing`,
  `invalid` ou `extraneous`).
- `npm install --dry-run` **não** reescreve o lock (git continua limpo).
- **O CI prova que instala**: ele roda `npm ci` no Node 22/linux-x64 e está
  verde em todos os pushes.
- 60 pacotes com versão duplicada no tree — normal no ecossistema RN/Metro
  (`metro` 0.84.5 + 0.84.6, `minimatch`, `semver`, `babel-*`, `debug`…).
- Só 2 `hasInstallScript` (`esbuild` e `unrs-resolver`), **ambos `dev`**: não
  entram no bundle do app. Nenhum script de instalação vem de dependência de
  produção.
- `npm audit`: 32 (11 moderate, 20 high, 1 critical), todos transitivos do
  toolchain de build — já conhecido; `npm audit fix --force` não vale a pena.

### Duas anomalias reais

1. **555 dos 928 nós estão sem `resolved` e sem `integrity`** — e são
   justamente as 555 **de produção**; as 373 com `resolved` são todas
   `dev`/`optional`. Não é um config atual (`omit-lockfile-registry-resolved`
   está `false`), nem corrupção: o lockfile oculto do `node_modules` omite
   **os mesmos 555**. Ou seja, o arquivo nasceu assim (outra passada de npm, ou
   outra máquina). *Consequência*: para as dependências que vão para o app, o
   lockfile não fixa o hash do tarball — `npm ci` re-deriva a URL do registry e
   **não verifica offline o byte exato**. Instala, mas com proteção de
   supply-chain mais fraca do que deveria.
2. **Binários por plataforma desalinhados com este ambiente** — `lightningcss`
   (que vem do `@expo/metro-config`) declara **11** binários em
   `optionalDependencies`; o lockfile grava **só** `lightningcss-linux-arm64-gnu`
   e **não grava `lightningcss-linux-x64-gnu`**, que é o desta máquina. Além
   disso **59 nós do lock não existem no disco**: binários de outras
   plataformas (esbuild, unrs, lightningcss) e a sub-árvore WASM
   (`@emnapi/*`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`). Um lock com
   binários de arm64 num ambiente x64 sugere que ele foi gerado **noutro
   aparelho** (provavelmente o Chromebook).

**Nada disso quebra hoje** — `npm ls` não reclama, `npm ci` passa no CI, o
`esbuild` roda (0.28.2, transform ok) e o `lightningcss.transform` também carrega
e funciona via fallback, mesmo sem nenhum binário nativo instalado.

**Como consertar (não feito de propósito):** regenerar o lock num ambiente com
**Node ≥ 22.13 e rede confiável**, com `npm install --package-lock-only`,
repor `resolved`/`integrity` nas 555 e reconciliar os binários por plataforma.
Não fiz agora por três motivos: (a) aqui só há Node 18; (b) re-resolver tudo
dentro das faixas pode trocar versões transitivas e **mexer nos pins do Expo
SDK 57**; (c) é uma mudança grande, difícil de validar sem poder rodar o app.

## Lições 2 e provas embaralhadas (2026-10-16)

Fecha a pendência "lições 2 e provas fixas". Antes só l1 e l3 tinham
`perSession`: refazer a lição 2 ou a prova repetia a sequência idêntica (e, na
prova, a ordem fixa ajudava a decorar a posição da resposta).

- **`SessionContainer`** — novo tipo `{ exercises, perSession? }` que `Lesson` e
  o `exam` passam a herdar (`exam: { id, title } & SessionContainer`).
  `drawSession` deixou de receber `Lesson` e passou a receber o container, então
  lição e prova compartilham o mesmo sorteio.
- **Lições 2** — `perSession: 6` nos 6 idiomas (banco de 6, sorteia os 6
  embaralhados: refazer muda a ordem).
- **Provas** — `perSession: 5` nos 6 idiomas (banco de 5, cobertura total) e
  `exam/[id].tsx` passou a chamar `drawSession(exam)` antes do JSX, do mesmo jeito
  que a lição: o sorteio tem que ficar estável entre renders, senão o exercício
  trocava no meio da prova (mesmo bug do `key` estável já corrigido na lição).
- **2 regras novas no validador** — toda lição precisa de `perSession` e toda
  prova precisa de `perSession === exercises.length`. A segunda existe porque
  perder cobertura é silencioso: um `perSession: 5` esquecido depois de
  acrescentar um 6º exercício tiraria a questão da prova sem ninguém notar.
- **2 testes novos** (37 → 39) — um prova que `drawSession` na prova embaralha e
  cobre o banco inteiro em 30 sorteios seguidos; outro que toda lição e toda
  prova tem `perSession`, travando a pendência para ela não voltar.

Verificado: `tsc --noEmit` limpo, lint 0 problemas, 39/39 testes. **Nenhum texto
novo foi escrito** — não houve tradução nesta rodada.

**Resta**: o banco da lição 2 segue sendo os mesmos 6 itens (só a ordem muda no
refazer). Um banco maior (9-10 sorteando 6) exigiria escrever exercício novo em
6 idiomas — risco de tradução, vira pendência própria.

## Validador de conteúdo

Mora no repo: `src/lib/validate-content.ts` (`findContentProblems()`), coberto
por `test/validator.test.ts` e rodando no `npm test`. Checa o que o typecheck não
pega: opção correta dentro do próprio enunciado, `fill` com resposta vazia,
`translate` com `from` do mesmo idioma da resposta, coluna de `match` repetida,
banco menor que a sessão (`perSession > exercícios`), ids duplicados, exercícios
de mesmo conteúdo na mesma lição e varredura de caractere de outro alfabeto. As
regras 1 e 2 acima foram escritas a partir dos bugs que ele achou.

A versão anterior era um script solto em `/tmp/opencode/validate-content.cjs` —
fora do repo, perdível, e que **não validava as provas**: chamava
`checkEx(unit.exam)` com o objeto da unidade (que não é um `Exercise`), então os
exercícios da prova nunca eram checados. Agora o teste itera
`unit.exam.exercises`.

## Como rodar

No ambiente normal (fora do proot), o Metro funciona:

```
git clone https://github.com/cleberleonheart-maker/Lingo.git
cd Lingo && npm install
npx expo start --web
```

**No proot/aarch64 daqui o Metro não sobe** — morre logo após "Starting Metro
Bundler", sem erro no log, sem porta, sem processo. Tentado 4x (2026-09-29),
inclusive com 2 GB de memória livres, então memória não é a causa. Não é bug
do código. Para testar, usar o Chromebook.

Antes de qualquer build, checar:
1. `free -m` (quer ~2 GB livres)
2. `npx tsc --noEmit` (erro de tipo sai aqui)
3. `ls node_modules/<pacote>` (a instalação pode dar timeout e gravar pela
   metade — já aconteceu com `expo-linear-gradient` e
   `react-native-safe-area-context`)
4. só então buildar — e se falhar, **não repetir igual**: ler o log

## Bug já corrigido no caminho

`react-native-safe-area-context` estava instalado sem os tipos
(`lib/typescript/` faltando), o que dava erro de TS7016 em toda tela que
importava `useSafeAreaInsets`. Reinstalado.

Também criei `expo-env.d.ts` declarando `*.module.css` e `*.css`, que elimina
os 2 últimos erros do template. **Typecheck do projeto inteiro passa limpo
pela primeira vez.**
