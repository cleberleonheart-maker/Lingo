# Lingo — estado em 2026-09-29

Vertical slice estilo Duolingo, montada do zero sobre o template do Expo.
**Rodando e validado** no Chromium (ver "Validado em runtime").

## O que existe

**Avatar (`src/components/avatar.tsx`)** — reescrito na técnica do TAMI
(`/root/tami/index.html:291-325`): `View` + `LinearGradient` em vez de SVG com path
desenhado à mão. A piscada encolhe o próprio olho com `scaleY`, então não existe
pálpebra para alinhar — que era exatamente o bug do rework no Pulsa.

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

**Lições sorteiam de um banco** — `pool` + `perSession`: as lições 1 e 3 de cada
idioma sorteiam 10 exercícios de um banco de 10-14 em vez de repetir uma
sequência fixa. O sorteio acontece na abertura da tela (`drawSession`), não
dentro do `ExercisePlayer`, senão a ordem mudaria a cada re-render e o `index`
pararia de bater.

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

- States `.playing`/`.sleep` do avatar e a recompensa diária do Duolingo.
- Lições 2 e as provas ainda são fixas (sem `pool`).
- Ao morrer (vidas a zero) o XP do que foi acertado é descartado.
- Acertar de primeira não entra na revisão espaçada — só o que se erra volta.
- `exercises` e `pool` duplicam o mesmo conteúdo; `drawSession` só usa o `pool`.
- `package-lock.json` é novo e nunca foi revisado.
- Áudio do japonês depende de voz instalada no `expo-speech`; não confirmado em
  hardware real.
- Acessibilidade: barra de progresso, vidas, opções/chips e faixas de feedback
  já foram tratadas (2026-10-16); falta revisar o foco do botão "Continuar".

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
  contador de vidas tem `accessibilityLabel` ("2 de 3 vidas"); a faixa de
  feedback é `accessibilityLiveRegion="polite"` (Android/web) e o iOS recebe
  `AccessibilityInfo.announceForAccessibility` (que não tem `liveRegion`).
- **Campo `to` removido do `translate`** — era dado morto: aparecia em ~78
  lugares e nunca era lido (nem no render, nem no validador). Saiu do tipo em
  `content.ts` e dos 6 arquivos de conteúdo; o teste que o usava foi corrigido.
- **`react-native-svg` removido** — estava no `package.json` sem nenhum uso em
  `src`. `npm uninstall` tirou ele e 12 dependências exclusivas (css-select,
  css-tree, domhandler…); o lockfile caiu 154 linhas.
- **`engines` corrigido para `node >=22.13.0`** — era `>=20.19.4`, mas o Expo SDK
  57 exige Node 22.13.x no mínimo (tabela oficial dos docs versionados). O CI já
  usa Node 22.

## Validador de conteúdo

Mora no repo: `src/lib/validate-content.ts` (`findContentProblems()`), coberto
por `test/validator.test.ts` e rodando no `npm test`. Checa o que o typecheck não
pega: opção correta dentro do próprio enunciado, `fill` com resposta vazia,
`translate` com `from` do mesmo idioma da resposta, coluna de `match` repetida,
banco menor que a sessão (`perSession > pool`), ids duplicados e varredura de
caractere de outro alfabeto. As regras 1 e 2 acima foram escritas a partir dos
bugs que ele achou.

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
