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

**Telas** — `(tabs)/index` é o mapa, `(tabs)/languages` a lista de idiomas,
`lesson/[id]` e `exam/[id]` rodam o `ExercisePlayer`, `result` mostra o placar.
O `_layout` virou `Stack` porque as tabs prendiam as telas de exercício.

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

## Pendências

- Faltam coração, states `.playing`/`.sleep` e a recompensa diária do Duolingo.
- A repetição espaçada (nível 3): exercício errado volta em 5 min, 1 dia, 3 dias.
  O `pool` do nível 2 já é a base disso.
- Lições 2 e as provas ainda são fixas (sem `pool`).
- O `avatar.tsx` antigo (SVG) foi substituído; o `react-native-svg` continua
  instalado e sem uso.
- O campo `to` do tipo `translate` não é usado no render.
- `package-lock.json` é novo e nunca foi revisado.
- Áudio do japonês depende de voz instalada no `expo-speech`; não confirmado em
  hardware real.

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

## Validador de conteúdo

`/tmp/opencode/validate-content.cjs` (fora do repo, é ferramenta de trabalho).
Compila os `content*.ts` e checa o que o typecheck não pega: opção correta
dentro do próprio enunciado, `fill` com resposta vazia, `translate` com `from`
do mesmo idioma da resposta, coluna de `match` repetida, banco menor que a
sessão, ids duplicados, e varredura de caractere de outro alfabeto. As regras 1
e 2 acima foram escritas a partir dos bugs que ele achou.

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
