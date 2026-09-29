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

**Conteúdo (`src/constants/content.ts`)** — só inglês tem lição: 1 unidade,
3 lições + 1 prova, 5 tipos de exercício (`choice`, `translate`, `fill`,
`match`, `listen`). Os outros 5 idiomas têm o array vazio de propósito — a tela
mostra "em breve" em vez de quebrar.

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

- **Lições dos outros 5 idiomas** — só o inglês tem conteúdo. es[],
  fr[], de[], it[] e ja[] estão vazios de propósito (a tela mostra "em breve").
- **A tela de "em breve" ainda não foi conferida** visualmente.
- O exercício `match` (pareamento) ainda não foi testado por alguém.
- Faltam coração, states `.playing`/`.sleep` e a recompensa daily do Duolingo.
- O `avatar.tsx` antigo (SVG) foi substituído; o `react-native-svg` continua
  instalado e sem uso.
- `package-lock.json` é novo e nunca foi revisado.

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
